# 🌱 FarmerAI: Next-Generation Agricultural Diagnostics & Advisory System

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776AB.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20REST-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TypeScript-61DAFB.svg)](https://react.dev)
[![ONNX](https://img.shields.io/badge/Inference-ONNX%20Runtime%20(38ms)-005CED.svg)](https://onnxruntime.ai)
[![LLM](https://img.shields.io/badge/LLM-Groq%20120B%20%7C%20DeepSeek-FF6F00.svg)](https://groq.com)

FarmerAI is a production-grade agricultural decision support platform engineered for East African smallholder farmers. It couples real-time plant disease classification using a custom-trained **EfficientNetV2-S** neural network with grounding through a curated disease knowledge base and streaming LLM agronomic reasoning (**Groq 120B** / DeepSeek / local Ollama).

---

## 🏛️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    FarmerAI Architecture                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐     ┌──────────────┐     ┌──────────────┐  │
│  │  React 18   │────▶│   FastAPI    │────▶│ EfficientNet │  │
│  │  (Vite + TS)│     │   Backend    │     │ ONNX Model   │  │
│  └─────────────┘     │  (Port 8000) │     │ (99.89% Acc) │  │
│                      │              │     └──────────────┘  │
│                      │              │     ┌──────────────┐  │
│                      │              │────▶│ Groq 120B LLM│  │
│                      │              │     │ (Streaming)  │  │
│                      │              │     └──────────────┘  │
│                      │              │     ┌──────────────┐  │
│                      │              │────▶│ Open-Meteo   │  │
│                      │              │     │ Live Weather │  │
│                      └──────────────┘     └──────────────┘  │
│                      ┌──────────────┐                        │
│                      │ Disease KB   │ 38 PlantVillage        │
│                      │ 55KB Ground  │ classes with remedies  │
│                      └──────────────┘                        │
└──────────────────────────────────────────────────────────────┘
```

### Core Capabilities
- **Neural Vision Engine**: 38-class leaf disease detector on PlantVillage dataset (~38ms CPU inference via ONNX Runtime).
- **Model Context Protocol (MCP) Server**: FastMCP stdio server enabling Claude Desktop, Cursor, and external AI agents to invoke leaf diagnostics, agronomic treatments, and spore risk.
- **Conversational Agronomist**: Context-grounded advisory with SSE streaming in English and Kinyarwanda.
- **Multimodal Advise Endpoint**: Direct image + prompt diagnosis with immediate treatment protocols.
- **Microclimate Weather Radar**: Live temperature, humidity, precipitation, and fungal spore germination index for Rwanda districts.
- **ChatGPT-Style Frontend**: Minimalist dark UI with chat persistence, image upload, error boundaries, and live engine status.

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows (or source venv/bin/activate on Unix)
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit backend/.env and add your GROQ_API_KEY (free from https://console.groq.com/keys)

# Run server
uvicorn backend_bridge:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 2. Frontend Setup

```bash
cd frontend
npm install

# Configure environment (optional, defaults to http://127.0.0.1:8000)
cp .env.example .env

# Run development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔌 Model Context Protocol (MCP) Server

FarmerAI includes an official Model Context Protocol (MCP) server powered by `FastMCP`. External AI assistants and IDEs (such as Claude Desktop, Cursor, and Antigravity) can directly connect over `stdio` to run neural vision diagnoses, look up disease remedies, and check fungal spore germination indices.

### Available MCP Tools & Capabilities

| Tool | Parameters | Description |
|------|------------|-------------|
| `diagnose_plant_leaf` | `image_path`, `crop_hint` | Classifies leaf pathology from file path via EfficientNetV2-S ONNX with treatment advice. |
| `diagnose_plant_leaf_base64` | `image_base64`, `crop_hint` | Classifies leaf pathology from base64 string for remote/webhook agents. |
| `get_disease_treatment_guide` | `class_label` | Retrieves full agronomic dossier, symptoms, organic remedies, and chemical controls. |
| `search_plant_diseases` | `query`, `limit` | Ranked symptom and keyword search across all 38 PlantVillage classes. |
| `get_rwanda_district_weather` | `district` | Live temperature, humidity, rainfall, and fungal spore germination risk for Rwanda districts. |
| `get_coordinates_weather` | `latitude`, `longitude` | Microclimate weather and spore proliferation radar for arbitrary GPS coordinates. |
| `list_supported_crops_and_diseases` | _None_ | Complete catalogue of supported crops, diseases, and model performance metrics. |

### MCP Resources & Prompts
- **Resources**: `farmerai://classes`, `farmerai://districts`, `farmerai://knowledge/{class_label}`
- **Prompt**: `crop_consultation` — structured agronomist advisory prompt.

### Quick Start: Running the MCP Server
```bash
python backend/mcp_server.py
```

### Claude Desktop & Cursor Integration
Add to your `claude_desktop_config.json` (or Cursor MCP settings):

```json
{
  "mcpServers": {
    "farmerai": {
      "command": "python",
      "args": ["-m", "backend.mcp_server"],
      "cwd": "C:\\Users\\nshut\\OneDrive\\Attachments\\Documents\\Projects\\FarmerAI"
    }
  }
}
```

---

## 🧪 Testing

### Backend Unit & Integration Tests
```bash
pytest backend/ -q -m "not live"
```

### Live Smoke Test (requires running backend)
```bash
python backend/test_api.py
```

### Frontend Typecheck & Production Build
```bash
cd frontend
npm run build
```

---

## 🛡️ Security & Privacy
- Secrets and API keys are strictly excluded via `.gitignore`.
- Configurable CORS middleware (`CORS_ORIGINS`) allows restricting origins in production.
- Rate limiting is enforced via `slowapi` on AI endpoints.
