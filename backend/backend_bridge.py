"""
backend_bridge.py — FarmerAI Plant Disease Diagnosis API + LLM Chat
====================================================================
FastAPI routes only; logic lives in vision_service, chat_service, etc.

Run:
    uvicorn backend_bridge:app --host 0.0.0.0 --port 8000 --reload
"""

from __future__ import annotations

import json
import logging
import time
import uuid
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from disease_knowledge import get_disease_info
from disease_search import search_diseases
from llm_service import is_llm_available, get_base_url, get_model
from vision_service import run_diagnosis, compact_diagnosis_for_advise, ONNX_MODEL_FILE
from chat_service import AdvisorInput, run_advisor, stream_advisor, parse_history_json
from weather_service import fetch_weather_summary

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("farmerai.api")

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="FarmerAI — Plant Disease Diagnosis + Chat API",
    description="Vision NN (leaf diagnosis) + LLM (farmer chat) in one API",
    version="4.0.0",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
CLASSES_FILE = BASE_DIR / "classes.json"

meta: dict = {}
classes_list: list[str] = []
if CLASSES_FILE.exists():
    with open(CLASSES_FILE, "r", encoding="utf-8") as f:
        meta = json.load(f)
        classes_list = meta.get("classes", [])
else:
    raise RuntimeError(f"classes.json not found at {CLASSES_FILE}")

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
    start = time.perf_counter()
    response = await call_next(request)
    ms = round((time.perf_counter() - start) * 1000, 1)
    logger.info("%s %s %s %.1fms", request_id, request.method, request.url.path, ms)
    response.headers["X-Request-ID"] = request_id
    return response


def _require_llm():
    if not is_llm_available():
        raise HTTPException(
            status_code=503,
            detail=(
                "LLM not configured. Set LLM_API_KEY / DEEPSEEK_API_KEY in backend/.env, "
                "or LLM_PROVIDER=ollama with LLM_BASE_URL=http://localhost:11434/v1"
            ),
        )


async def _read_image_upload(file: UploadFile) -> bytes:
    if file.content_type and file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Upload JPG, PNG, or WebP.",
        )
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded")
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File too large. Maximum 10MB.")
    return contents


@app.get("/")
def root():
    return {
        "system": "FarmerAI Plant Disease Diagnosis + Chat API",
        "version": "4.0.0",
        "status": "online",
        "vision_model": "EfficientNetV2-S (ONNX)",
        "llm_configured": is_llm_available(),
        "llm_base_url": get_base_url(),
        "llm_model": get_model(),
        "diseases_supported": len(classes_list),
        "model_loaded": ONNX_MODEL_FILE.exists(),
        "endpoints": {
            "diagnose": "POST /api/v1/diagnose",
            "chat": "POST /api/v1/chat",
            "chat_stream": "POST /api/v1/chat/stream",
            "advise": "POST /api/v1/advise",
            "diseases_search": "GET /api/v1/diseases/search?q=",
            "weather": "GET /api/v1/weather?district= or lat=&lon=",
            "classes": "GET /api/v1/classes",
            "diseases": "GET /api/v1/diseases",
            "disease_info": "GET /api/v1/diseases/{class_label}",
        },
    }


@app.get("/api/v1/classes")
def get_classes():
    return {
        "count": len(classes_list),
        "classes": classes_list,
        "model": meta.get("model_name", "efficientnet_v2_s"),
        "image_size": meta.get("image_size", 224),
        "val_accuracy": meta.get("val_accuracy", 0.9989),
    }


@app.get("/api/v1/diseases")
def get_all_diseases():
    result = {}
    for cls in classes_list:
        info = get_disease_info(cls)
        result[cls] = {
            "common_name": info["common_name"],
            "crop": info["crop"],
            "is_disease": info["is_disease"],
            "severity": info["severity"],
        }
    return {"count": len(result), "diseases": result}


@app.get("/api/v1/diseases/search")
def diseases_search(
    q: str = Query(..., min_length=2, max_length=500, description="Search query"),
    limit: int = Query(5, ge=1, le=20),
):
    """Keyword search over crops, disease names, and symptoms."""
    results = search_diseases(q, class_labels=classes_list, limit=limit)
    return {"query": q, "count": len(results), "results": results}


@app.get("/api/v1/diseases/{class_label}")
def get_disease_detail(class_label: str):
    return get_disease_info(class_label)


@app.get("/api/v1/weather")
async def get_weather(
    lat: float | None = Query(None),
    lon: float | None = Query(None),
    district: str | None = Query(None, description="Rwanda district name, e.g. Musanze"),
):
    try:
        data = await fetch_weather_summary(lat=lat, lon=lon, district=district)
        return {"status": "success", **data}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Weather service error: {e}")


@app.post("/api/v1/diagnose")
async def diagnose(
    file: UploadFile = File(..., description="Leaf image"),
    crop: Optional[str] = Form(None, description="Optional crop hint"),
):
    try:
        contents = await _read_image_upload(file)
        full = run_diagnosis(
            contents,
            classes_list,
            image_size=meta.get("image_size", 224),
            crop_hint=crop,
            filename=file.filename,
        )
        full.pop("_top_prob", None)
        full.pop("_top_label", None)
        full.pop("_disease_info", None)
        return full
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagnosis failed: {e}")


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    history: list[dict] | None = None
    language: str | None = None
    farm_context: str | None = None
    weather: str | None = None
    lat: float | None = None
    lon: float | None = None
    district: str | None = None
    diagnosis_label: str | None = None
    diagnosis_confidence: float | None = Field(default=None, ge=0, le=1)
    auto_ground: bool = True


class ChatResponse(BaseModel):
    status: str = "success"
    reply: str
    model: str
    grounded_on_diagnosis: bool = False
    grounding_source: str | None = None
    matched_class_label: str | None = None
    weather_summary: str | None = None
    usage: dict | None = None


def _advisor_from_chat(req: ChatRequest) -> AdvisorInput:
    return AdvisorInput(
        message=req.message,
        history=req.history,
        language=req.language,
        farm_context=req.farm_context,
        weather=req.weather,
        lat=req.lat,
        lon=req.lon,
        district=req.district,
        diagnosis_label=req.diagnosis_label,
        diagnosis_confidence=req.diagnosis_confidence,
        class_labels=classes_list,
        auto_ground=req.auto_ground,
    )


@app.post("/api/v1/chat", response_model=ChatResponse)
@limiter.limit("30/minute")
async def chat(request: Request, req: ChatRequest):
    _require_llm()
    try:
        result = await run_advisor(_advisor_from_chat(req))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return ChatResponse(
        reply=result.reply,
        model=result.model,
        grounded_on_diagnosis=result.grounded_on_diagnosis,
        grounding_source=result.grounding_source,
        matched_class_label=result.matched_class_label,
        weather_summary=result.weather_summary,
        usage=result.usage,
    )


@app.post("/api/v1/chat/stream")
@limiter.limit("30/minute")
async def chat_stream(request: Request, req: ChatRequest):
    _require_llm()
    inp = _advisor_from_chat(req)

    async def event_generator():
        try:
            async for chunk in stream_advisor(inp):
                yield f"data: {json.dumps({'content': chunk})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/api/v1/advise")
@limiter.limit("20/minute")
async def advise(
    request: Request,
    file: UploadFile = File(None),
    message: str = Form(""),
    language: str = Form(None),
    weather: str = Form(None),
    farm_context: str = Form(None),
    district: Optional[str] = Form(None),
    lat: Optional[float] = Form(None),
    lon: Optional[float] = Form(None),
    history_json: str = Form(None),
    auto_ground: bool = Form(True),
):
    if not message and file is None:
        raise HTTPException(status_code=400, detail="Provide at least a message or an image.")
    _require_llm()

    diagnosis_result = None
    diagnosis_label = None
    diagnosis_confidence = None
    low_confidence = False

    if file is not None:
        contents = await _read_image_upload(file)
        full = run_diagnosis(
            contents,
            classes_list,
            image_size=meta.get("image_size", 224),
            filename=file.filename,
        )
        diagnosis_result = compact_diagnosis_for_advise(full)
        diagnosis_label = full["_top_label"]
        diagnosis_confidence = full["_top_prob"]
        low_confidence = full["diagnosis"].get("low_confidence", False)

    inp = AdvisorInput(
        message=message or "Please explain this diagnosis and what I should do.",
        history=parse_history_json(history_json),
        language=language,
        farm_context=farm_context,
        weather=weather,
        lat=lat,
        lon=lon,
        district=district,
        diagnosis_label=diagnosis_label,
        diagnosis_confidence=diagnosis_confidence,
        class_labels=classes_list,
        low_confidence=low_confidence,
        auto_ground=auto_ground,
    )

    try:
        result = await run_advisor(inp)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return {
        "status": "success",
        "diagnosis": diagnosis_result,
        "advice": result.reply,
        "model": result.model,
        "grounding_source": result.grounding_source,
        "matched_class_label": result.matched_class_label,
        "weather_summary": result.weather_summary,
        "usage": result.usage,
    }


if __name__ == "__main__":
    import uvicorn

    print("[FarmerAI] Starting API on http://localhost:8000")
    print("[FarmerAI] API docs: http://localhost:8000/docs")
    llm_status = "configured" if is_llm_available() else "NOT configured (chat 503)"
    print(f"[FarmerAI] LLM: {llm_status} ({get_base_url()}, model={get_model()})")
    uvicorn.run("backend_bridge:app", host="0.0.0.0", port=8000, reload=True)
