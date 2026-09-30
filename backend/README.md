# FarmerAI Backend

Vision (EfficientNetV2-S ONNX) + LLM advisor (DeepSeek, Ollama, or any OpenAI-compatible API).

## Setup

```bash
cd backend
pip install -r requirements.txt
copy .env.example .env   # Windows
# Edit .env — set DEEPSEEK_API_KEY or Ollama settings
uvicorn backend_bridge:app --host 0.0.0.0 --port 8000 --reload
```

Open [http://localhost:8000/docs](http://localhost:8000/docs) for interactive API docs.

## Environment

| Variable | Purpose |
|----------|---------|
| `DEEPSEEK_API_KEY` / `LLM_API_KEY` | API key for cloud LLM |
| `DEEPSEEK_BASE_URL` / `LLM_BASE_URL` | OpenAI-compatible base URL |
| `DEEPSEEK_MODEL` / `LLM_MODEL` | Model name |
| `LLM_PROVIDER=ollama` | Local Ollama without API key |
| `MOCK_LLM=1` | Offline mock replies (tests only) |

### Ollama example

```env
LLM_PROVIDER=ollama
LLM_BASE_URL=http://localhost:11434/v1
LLM_MODEL=llama3.1
```

## Main endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health + capability flags |
| POST | `/api/v1/diagnose` | Leaf image → disease + static advice |
| GET | `/api/v1/diseases/search?q=` | Keyword search for text grounding |
| GET | `/api/v1/weather?district=` | Open-Meteo summary (Rwanda districts) |
| POST | `/api/v1/chat` | Text → LLM (auto-grounds from search if no diagnosis) |
| POST | `/api/v1/chat/stream` | SSE streaming chat |
| POST | `/api/v1/advise` | Image + text → diagnosis + LLM advice |

## Examples

```bash
# Diagnose
curl -X POST http://localhost:8000/api/v1/diagnose \
  -F "file=@sample_leaf.jpg"

# Search knowledge base
curl "http://localhost:8000/api/v1/diseases/search?q=tomato%20late%20blight"

# Chat with auto-grounding + district weather
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"My tomato has water-soaked leaf spots\",\"district\":\"Huye\"}"

# Advise (image + question)
curl -X POST http://localhost:8000/api/v1/advise \
  -F "file=@sample_leaf.jpg" \
  -F "message=Should I spray fungicide today?" \
  -F "district=Musanze"
```

## Tests

```bash
cd backend
set MOCK_LLM=1
pytest test_backend.py -q
```

Optional live LLM test (requires real API key, no MOCK_LLM):

```bash
pytest test_backend.py -q -m live
```

## Architecture

```
backend_bridge.py     → HTTP routes, rate limits
vision_service.py     → ONNX inference
disease_knowledge.py  → 38-class agronomy facts
disease_search.py     → Text → disease retrieval
weather_service.py    → Open-Meteo summaries
prompts.py            → System prompt + grounding templates
chat_service.py       → Orchestration (weather, search, LLM)
llm_service.py        → OpenAI-compatible client
```
