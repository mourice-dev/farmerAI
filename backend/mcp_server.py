"""
mcp_server.py — FarmerAI Model Context Protocol (MCP) Server
=============================================================
Exposes FarmerAI agricultural diagnostics, disease knowledge base,
and microclimate weather risk tools to external AI agents
(Claude Desktop, Cursor, Antigravity, etc.).

Run:
    python backend/mcp_server.py
"""

from __future__ import annotations

import asyncio
import base64
import json
import os
import sys
from pathlib import Path
from typing import Any, Optional

# Ensure backend directory is in sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

try:
    from mcp.server.fastmcp import FastMCP
    HAS_FASTMCP = True
except ImportError:
    FastMCP = None  # type: ignore[assignment, misc]
    HAS_FASTMCP = False

from disease_knowledge import DISEASE_DATABASE, get_disease_info
from disease_search import search_diseases
from vision_service import run_diagnosis
from weather_service import RWANDA_DISTRICTS, fetch_weather_summary

# Load classes
CLASSES_FILE = BASE_DIR / "classes.json"
meta: dict[str, Any] = {}
classes_list: list[str] = []
if CLASSES_FILE.exists():
    with open(CLASSES_FILE, "r", encoding="utf-8") as f:
        meta = json.load(f)
        classes_list = meta.get("classes", [])
else:
    classes_list = list(DISEASE_DATABASE.keys())


def _calculate_fungal_spore_risk(
    temp_c: float | None,
    humidity_pct: float | None,
    precipitation_now: float | None,
    precipitation_24h: float | None,
) -> dict[str, Any]:
    """
    Evaluates microclimate risk for fungal foliar disease proliferation
    (such as Phytophthora infestans late blight, powdery mildew, rusts).
    """
    t = temp_c if temp_c is not None else 20.0
    h = humidity_pct if humidity_pct is not None else 60.0
    p24 = precipitation_24h if precipitation_24h is not None else 0.0

    # Optimal fungal germination: 15°C - 25°C with RH >= 80% or rain
    is_temp_optimal = 15.0 <= t <= 25.0
    is_humidity_high = h >= 80.0
    has_rain = p24 >= 2.0 or (precipitation_now is not None and precipitation_now > 0.0)

    if (is_temp_optimal and is_humidity_high) or (is_humidity_high and has_rain):
        level = "CRITICAL / VERY HIGH"
        advice = (
            "High humidity and favorable temperatures create extreme spore germination conditions. "
            "Inspect susceptible crops immediately. Apply preventive fungicides (e.g. Mancozeb, Copper) "
            "prior to rain events and avoid sprinkler irrigation."
        )
    elif is_temp_optimal or is_humidity_high or has_rain:
        level = "MODERATE"
        advice = (
            "Moderate conditions for pathogen spread. Ensure proper canopy aeration through weeding "
            "and suckering. Scout leaves for early water-soaked or necrotic lesions."
        )
    else:
        level = "LOW"
        advice = (
            "Dry conditions inhibit rapid fungal spore germination. Maintain baseline crop monitoring "
            "and soil moisture conservation."
        )

    return {
        "risk_level": level,
        "is_optimal_temperature": is_temp_optimal,
        "is_high_humidity": is_humidity_high,
        "actionable_advice": advice,
    }


def _format_diagnosis_markdown(result: dict[str, Any]) -> str:
    diag = result.get("diagnosis", {})
    crop = diag.get("crop", "Unknown")
    disease = diag.get("disease", "Unknown")
    confidence = diag.get("confidence", 0.0)
    level = diag.get("confidence_level", "UNKNOWN")
    severity = result.get("severity", "UNKNOWN")
    cause = result.get("cause", "N/A")
    spread_risk = result.get("spread_risk", "N/A")

    symptoms = "\n".join(f"- {s}" for s in result.get("symptoms", [])) or "- None documented"
    prevention = "\n".join(f"- {p}" for p in result.get("prevention", [])) or "- None documented"
    treatment = "\n".join(f"- {t}" for t in result.get("treatment", [])) or "- None documented"
    spread_prev = "\n".join(f"- {sp}" for sp in result.get("spread_prevention", [])) or "- None documented"

    top5_lines = []
    for p in result.get("top5_predictions", []):
        top5_lines.append(f"  {p['rank']}. **{p['crop']} — {p['condition']}**: {p['confidence']}%")
    top5_str = "\n".join(top5_lines)

    return f"""# 🌿 FarmerAI Plant Diagnosis: {crop} ({disease})

- **Crop**: {crop}
- **Condition / Disease**: {disease}
- **Scientific Label**: `{diag.get('scientific_label', '')}`
- **Model Confidence**: {confidence}% ({level})
- **Severity Level**: {severity}
- **Spread Risk**: {spread_risk}
- **Inference Time**: {result.get('meta', {}).get('inference_time_ms', 0)}ms

### 🔍 Cause
{cause}

### 📋 Observed Symptoms
{symptoms}

### 🛡️ Immediate Treatment Protocols
{treatment}

### 🌱 Prevention & Cultural Measures
{prevention}

### 🚫 Spread Prevention
{spread_prev}

### 📊 Top Predictions
{top5_str}
"""


# ==============================================================================
# Tool Implementations
# ==============================================================================

def diagnose_plant_leaf(image_path: str, crop_hint: str = "") -> str:
    """Diagnose plant diseases from a leaf photograph using the EfficientNetV2-S ONNX model.

    Args:
        image_path: Absolute or relative filesystem path to the leaf image (JPEG, PNG, WebP).
        crop_hint: Optional name of the crop (e.g. 'tomato', 'potato', 'corn') to refine diagnosis.

    Returns:
        Structured diagnosis report with confidence score, severity, symptoms, prevention,
        and organic/chemical treatments.
    """
    p = Path(image_path).expanduser().resolve()
    if not p.exists() or not p.is_file():
        return f"Error: Image file not found at '{image_path}'"

    try:
        image_bytes = p.read_bytes()
        result = run_diagnosis(
            image_bytes=image_bytes,
            classes_list=classes_list,
            image_size=meta.get("image_size", 224),
            crop_hint=crop_hint if crop_hint else None,
            filename=p.name,
        )
        return _format_diagnosis_markdown(result)
    except Exception as e:
        return f"Error diagnosing leaf image: {e}"


def diagnose_plant_leaf_base64(image_base64: str, crop_hint: str = "") -> str:
    """Diagnose plant diseases from a base64-encoded leaf image string.

    Args:
        image_base64: Base64-encoded image data string (with or without data:image/...;base64, header).
        crop_hint: Optional name of the crop (e.g. 'tomato', 'maize') to refine diagnosis.

    Returns:
        Structured diagnosis report with confidence score, severity, symptoms, and treatments.
    """
    try:
        raw_b64 = image_base64.strip()
        if "," in raw_b64 and "base64" in raw_b64:
            raw_b64 = raw_b64.split(",", 1)[1]
        image_bytes = base64.b64decode(raw_b64)
        if len(image_bytes) == 0:
            return "Error: Decoded base64 image is empty."

        result = run_diagnosis(
            image_bytes=image_bytes,
            classes_list=classes_list,
            image_size=meta.get("image_size", 224),
            crop_hint=crop_hint if crop_hint else None,
            filename="base64_upload.jpg",
        )
        return _format_diagnosis_markdown(result)
    except Exception as e:
        return f"Error processing base64 image: {e}"


def get_disease_treatment_guide(class_label: str) -> str:
    """Get full agronomic treatment guide and scientific profile for a crop disease.

    Args:
        class_label: PlantVillage class label (e.g. 'Tomato___Late_blight', 'Potato___Early_blight', 'Corn___Common_rust').

    Returns:
        Detailed guide containing symptoms, organic & chemical treatments, cause, and prevention.
    """
    info = get_disease_info(class_label)
    symptoms = "\n".join(f"- {s}" for s in info.get("symptoms", [])) or "- None documented"
    prevention = "\n".join(f"- {p}" for p in info.get("prevention", [])) or "- None documented"
    treatment = "\n".join(f"- {t}" for t in info.get("treatment", [])) or "- None documented"
    spread_prev = "\n".join(f"- {sp}" for sp in info.get("spread_prevention", [])) or "- None documented"

    return f"""# 🌾 Agronomic Guide: {info.get('crop')} — {info.get('common_name')}

- **Scientific Label**: `{class_label}`
- **Crop**: {info.get('crop')}
- **Condition**: {info.get('common_name')}
- **Is Active Disease**: {'Yes' if info.get('is_disease') else 'No (Healthy Plant)'}
- **Severity**: {info.get('severity', 'UNKNOWN')}
- **Spread Risk**: {info.get('spread_risk', 'Unknown')}

### 🔬 Cause & Etiology
{info.get('cause', 'N/A')}

### 🩺 Diagnostic Symptoms
{symptoms}

### 💊 Recommended Treatments
{treatment}

### 🛡️ Preventive & Cultural Management
{prevention}

### 🚫 Containment & Biosecurity
{spread_prev}
"""


def search_plant_diseases(query: str, limit: int = 5) -> str:
    """Search the 38-class plant disease knowledge base by symptoms, crop, or disease name.

    Args:
        query: Search keywords (e.g. 'water soaked tomato spots', 'maize rust', 'powdery leaves').
        limit: Maximum number of results to return (1-20).

    Returns:
        Ranked list of matching diseases with severity and relevance scores.
    """
    results = search_diseases(query, class_labels=classes_list, limit=limit)
    if not results:
        return f"No disease entries matched query: '{query}'"

    lines = [f"# Search Results for '{query}' (Found: {len(results)})\n"]
    for r in results:
        status = "Disease" if r.get("is_disease") else "Healthy"
        lines.append(
            f"- **{r.get('crop')} — {r.get('common_name')}** (`{r.get('class_label')}`)\n"
            f"  - Status: {status} | Severity: {r.get('severity', 'N/A')} | Relevance Score: {r.get('score')}\n"
        )
    return "\n".join(lines)


async def get_rwanda_district_weather(district: str) -> str:
    """Get real-time weather conditions and fungal spore germination risk for a Rwandan agricultural district.

    Args:
        district: District name (e.g. 'Musanze', 'Huye', 'Rubavu', 'Nyagatare', 'Gasabo', 'Kigali').

    Returns:
        Live microclimate report, precipitation forecast, and fungal disease risk assessment.
    """
    try:
        data = await fetch_weather_summary(district=district)
    except Exception as e:
        return f"Error retrieving weather for district '{district}': {e}"

    risk = _calculate_fungal_spore_risk(
        data.get("temperature_c"),
        data.get("humidity_percent"),
        data.get("precipitation_mm_now"),
        data.get("precipitation_mm_next_24h"),
    )

    return f"""# 🌦️ Microclimate & Fungal Spore Radar: {data.get('location')}

- **Current Weather**: {data.get('weather_description')}
- **Temperature**: {data.get('temperature_c')}°C
- **Relative Humidity**: {data.get('humidity_percent')}%
- **Current Rain**: {data.get('precipitation_mm_now')} mm
- **Expected Rain (Next 24h)**: {data.get('precipitation_mm_next_24h')} mm
- **Coordinates**: ({data.get('latitude')}, {data.get('longitude')})

### ⚠️ Fungal Spore Germination Risk: **{risk['risk_level']}**
{risk['actionable_advice']}
"""


async def get_coordinates_weather(latitude: float, longitude: float) -> str:
    """Get real-time weather conditions and fungal spore risk for arbitrary GPS coordinates.

    Args:
        latitude: Latitude coordinate (-90.0 to 90.0).
        longitude: Longitude coordinate (-180.0 to 180.0).

    Returns:
        Live weather summary and fungal risk evaluation.
    """
    try:
        data = await fetch_weather_summary(lat=latitude, lon=longitude)
    except Exception as e:
        return f"Error retrieving weather for ({latitude}, {longitude}): {e}"

    risk = _calculate_fungal_spore_risk(
        data.get("temperature_c"),
        data.get("humidity_percent"),
        data.get("precipitation_mm_now"),
        data.get("precipitation_mm_next_24h"),
    )

    return f"""# 🌦️ Microclimate & Spore Risk: ({latitude}, {longitude})

- **Condition**: {data.get('weather_description')}
- **Temperature**: {data.get('temperature_c')}°C
- **Humidity**: {data.get('humidity_percent')}%
- **Rainfall (24h Forecast)**: {data.get('precipitation_mm_next_24h')} mm

### ⚠️ Fungal Spore Risk: **{risk['risk_level']}**
{risk['actionable_advice']}
"""


def list_supported_crops_and_diseases() -> str:
    """List all 38 crop disease classes supported by the FarmerAI ONNX neural network.

    Returns:
        Structured breakdown of supported crops, classes, and model performance metrics.
    """
    crop_map: dict[str, list[str]] = {}
    for cls in classes_list:
        info = get_disease_info(cls)
        crop = info.get("crop", "Other")
        crop_map.setdefault(crop, []).append(f"{info.get('common_name')} (`{cls}`)")

    lines = [
        f"# 🌱 FarmerAI Supported Crops & Conditions ({len(classes_list)} Total Classes)\n",
        f"- **Model**: EfficientNetV2-S ONNX",
        f"- **Validation Accuracy**: {meta.get('val_accuracy', 0.9989) * 100:.2f}%\n",
    ]

    for crop, conditions in sorted(crop_map.items()):
        lines.append(f"### 🌾 {crop} ({len(conditions)} classes)")
        for cond in conditions:
            lines.append(f"- {cond}")
        lines.append("")

    return "\n".join(lines)


# ==============================================================================
# MCP Resources & Prompts
# ==============================================================================

def get_classes_resource() -> str:
    """List of all 38 plant classes supported by the neural vision engine."""
    return json.dumps(
        {
            "count": len(classes_list),
            "classes": classes_list,
            "accuracy": meta.get("val_accuracy", 0.9989),
            "image_size": meta.get("image_size", 224),
        },
        indent=2,
    )


def get_districts_resource() -> str:
    """Supported Rwanda agricultural districts with coordinate presets."""
    return json.dumps(RWANDA_DISTRICTS, indent=2)


def get_knowledge_resource(class_label: str) -> str:
    """Full agronomic knowledge base entry for a specific crop disease class."""
    return json.dumps(get_disease_info(class_label), indent=2)


def crop_consultation_prompt(crop: str, symptoms: str, district: str = "Musanze") -> str:
    """Structured agronomic consultation prompt for field advisory."""
    return (
        f"You are the FarmerAI Agronomist advising a farmer growing {crop} in {district} district, Rwanda.\n"
        f"The farmer observes the following crop symptoms: '{symptoms}'.\n\n"
        "Please provide a structured response:\n"
        "1. Likely diagnosis and differential diagnosis\n"
        "2. Immediate emergency action to halt pathogen spread\n"
        "3. Low-cost organic remedies and cultural sanitation\n"
        "4. Recommended chemical controls (with active ingredients and pre-harvest intervals)\n"
        "5. Preventative measures considering local microclimate weather conditions."
    )


# ==============================================================================
# FastMCP Registration & Fallback JSON-RPC stdio Server
# ==============================================================================

if HAS_FASTMCP:
    mcp = FastMCP("FarmerAI")

    mcp.tool()(diagnose_plant_leaf)
    mcp.tool()(diagnose_plant_leaf_base64)
    mcp.tool()(get_disease_treatment_guide)
    mcp.tool()(search_plant_diseases)
    mcp.tool()(get_rwanda_district_weather)
    mcp.tool()(get_coordinates_weather)
    mcp.tool()(list_supported_crops_and_diseases)

    mcp.resource("farmerai://classes")(get_classes_resource)
    mcp.resource("farmerai://districts")(get_districts_resource)
    mcp.resource("farmerai://knowledge/{class_label}")(get_knowledge_resource)

    mcp.prompt("crop_consultation")(crop_consultation_prompt)
else:
    mcp = None  # type: ignore[assignment]


def run_stdio_server():
    """Fallback standard JSON-RPC 2.0 stdio MCP server when fastmcp package is not pre-installed."""
    TOOLS = [
        {
            "name": "diagnose_plant_leaf",
            "description": "Diagnose plant diseases from a leaf photograph using EfficientNetV2-S ONNX model.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "image_path": {"type": "string", "description": "Filesystem path to leaf image."},
                    "crop_hint": {"type": "string", "description": "Optional crop name hint."},
                },
                "required": ["image_path"],
            },
        },
        {
            "name": "diagnose_plant_leaf_base64",
            "description": "Diagnose plant diseases from a base64-encoded leaf image string.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "image_base64": {"type": "string", "description": "Base64 encoded image string."},
                    "crop_hint": {"type": "string", "description": "Optional crop name hint."},
                },
                "required": ["image_base64"],
            },
        },
        {
            "name": "get_disease_treatment_guide",
            "description": "Get complete agronomic treatment guide and scientific profile for a crop disease.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "class_label": {"type": "string", "description": "PlantVillage class label."},
                },
                "required": ["class_label"],
            },
        },
        {
            "name": "search_plant_diseases",
            "description": "Search the 38-class plant disease knowledge base by symptoms or crop.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query or symptoms."},
                    "limit": {"type": "integer", "description": "Max results to return", "default": 5},
                },
                "required": ["query"],
            },
        },
        {
            "name": "get_rwanda_district_weather",
            "description": "Get real-time weather and fungal spore germination risk for a Rwandan agricultural district.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "district": {"type": "string", "description": "Rwanda district name."},
                },
                "required": ["district"],
            },
        },
        {
            "name": "get_coordinates_weather",
            "description": "Get real-time weather and fungal spore risk for arbitrary GPS coordinates.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "latitude": {"type": "number"},
                    "longitude": {"type": "number"},
                },
                "required": ["latitude", "longitude"],
            },
        },
        {
            "name": "list_supported_crops_and_diseases",
            "description": "List all 38 crop disease classes supported by the FarmerAI ONNX neural network.",
            "inputSchema": {"type": "object", "properties": {}},
        },
    ]

    async def _handle_call(req: dict) -> dict:
        req_id = req.get("id")
        method = req.get("method")
        params = req.get("params", {})

        if method == "initialize":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {"tools": {}, "resources": {}, "prompts": {}},
                    "serverInfo": {"name": "FarmerAI", "version": "1.0.0"},
                },
            }
        elif method == "notifications/initialized":
            return {}
        elif method == "tools/list":
            return {"jsonrpc": "2.0", "id": req_id, "result": {"tools": TOOLS}}
        elif method == "tools/call":
            tool_name = params.get("name")
            args = params.get("arguments", {})
            try:
                if tool_name == "diagnose_plant_leaf":
                    res = diagnose_plant_leaf(args.get("image_path", ""), args.get("crop_hint", ""))
                elif tool_name == "diagnose_plant_leaf_base64":
                    res = diagnose_plant_leaf_base64(args.get("image_base64", ""), args.get("crop_hint", ""))
                elif tool_name == "get_disease_treatment_guide":
                    res = get_disease_treatment_guide(args.get("class_label", ""))
                elif tool_name == "search_plant_diseases":
                    res = search_plant_diseases(args.get("query", ""), int(args.get("limit", 5)))
                elif tool_name == "get_rwanda_district_weather":
                    res = await get_rwanda_district_weather(args.get("district", ""))
                elif tool_name == "get_coordinates_weather":
                    res = await get_coordinates_weather(float(args.get("latitude")), float(args.get("longitude")))
                elif tool_name == "list_supported_crops_and_diseases":
                    res = list_supported_crops_and_diseases()
                else:
                    return {"jsonrpc": "2.0", "id": req_id, "error": {"code": -32601, "message": f"Unknown tool: {tool_name}"}}
                return {"jsonrpc": "2.0", "id": req_id, "result": {"content": [{"type": "text", "text": str(res)}]}}
            except Exception as ex:
                return {"jsonrpc": "2.0", "id": req_id, "isError": True, "result": {"content": [{"type": "text", "text": f"Error: {ex}"}]}}
        elif method == "resources/list":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "resources": [
                        {"uri": "farmerai://classes", "name": "Supported Classes", "mimeType": "application/json"},
                        {"uri": "farmerai://districts", "name": "Rwanda Districts", "mimeType": "application/json"},
                    ]
                },
            }
        elif method == "resources/read":
            uri = params.get("uri", "")
            if uri == "farmerai://classes":
                return {"jsonrpc": "2.0", "id": req_id, "result": {"contents": [{"uri": uri, "mimeType": "application/json", "text": get_classes_resource()}]}}
            elif uri == "farmerai://districts":
                return {"jsonrpc": "2.0", "id": req_id, "result": {"contents": [{"uri": uri, "mimeType": "application/json", "text": get_districts_resource()}]}}
            elif uri.startswith("farmerai://knowledge/"):
                lbl = uri.replace("farmerai://knowledge/", "")
                return {"jsonrpc": "2.0", "id": req_id, "result": {"contents": [{"uri": uri, "mimeType": "application/json", "text": get_knowledge_resource(lbl)}]}}
            return {"jsonrpc": "2.0", "id": req_id, "error": {"code": -32602, "message": f"Resource not found: {uri}"}}
        elif method == "prompts/list":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "prompts": [
                        {
                            "name": "crop_consultation",
                            "description": "Structured agronomic advisory consultation prompt.",
                            "arguments": [
                                {"name": "crop", "description": "Crop name", "required": True},
                                {"name": "symptoms", "description": "Observed symptoms", "required": True},
                                {"name": "district", "description": "District name", "required": False},
                            ],
                        }
                    ]
                },
            }
        elif method == "prompts/get":
            pname = params.get("name")
            pargs = params.get("arguments", {})
            if pname == "crop_consultation":
                msg = crop_consultation_prompt(pargs.get("crop", ""), pargs.get("symptoms", ""), pargs.get("district", "Musanze"))
                return {"jsonrpc": "2.0", "id": req_id, "result": {"messages": [{"role": "user", "content": {"type": "text", "text": msg}}]}}
            return {"jsonrpc": "2.0", "id": req_id, "error": {"code": -32601, "message": f"Unknown prompt: {pname}"}}
        return {"jsonrpc": "2.0", "id": req_id, "error": {"code": -32601, "message": f"Method '{method}' not found"}}

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            resp = asyncio.run(_handle_call(req))
            if resp:
                sys.stdout.write(json.dumps(resp) + "\n")
                sys.stdout.flush()
        except Exception as e:
            err = {"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": str(e)}}
            sys.stdout.write(json.dumps(err) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    if HAS_FASTMCP and mcp is not None:
        mcp.run()
    else:
        run_stdio_server()
