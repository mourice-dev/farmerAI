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
