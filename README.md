# 🌱 FarmerAI: Next-Generation Agricultural Decision & Diagnostics System
## Dual-Engine Architecture: Vision Neural Networks + DeepSeek Reasoning

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776AB.svg)
![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TypeScript-61DAFB.svg)
![ONNX](https://img.shields.io/badge/Inference-ONNX%20Runtime%20(38ms)-005CED.svg)
![DeepSeek](https://img.shields.io/badge/Reasoning-DeepSeek--V3%20MoE-8B5CF6.svg)

This repository is organized into **two dedicated folders** separating the user-facing application from the AI inference and model engines:

```
FarmerAI/
├── frontend/                  # React 18 + TypeScript + Vite UI (Qoder IDE Theme)
│   ├── src/                   # Dashboard, Crop Doctor, Agro-Calendar, USSD Simulator
│   ├── public/                # Static assets, icons, evaluation graphs
│   ├── package.json           # Frontend dependencies
│   └── vite.config.ts         # Vite bundler configuration
│
└── backend/                   # Python AI Microservice & Deep Learning Pipelines
    ├── backend_bridge.py      # FastAPI REST server & context fusion engine
    ├── infer.py               # Local CLI leaf inference tool
    ├── requirements.txt       # Python backend dependencies
    ├── classes.json           # 38 PlantVillage agricultural classes metadata
    ├── efficientnet_v2_s_best.onnx  # Trained ONNX vision model (~38ms latency)
    ├── best_model.pth         # PyTorch checkpoint (99.89% validation accuracy)
    ├── sample_leaf.jpg        # Field testing leaf sample
    ├── DeepSeek-V3/           # Cloned MoE reference implementation & Triton kernels
    ├── PlantVillage-Multiclass-YOLO/ # YOLOv11 lesion & pest detection
    ├── plant-disease-detection/      # ViT & YOLO training pipelines
    ├── plant-disease-detector/       # PyTorch EfficientNet fine-tuning scripts
    └── plant_disease_model/          # Evaluation notebooks and reports
```

---

## Quick Start

### 1. Frontend (User Interface)
The frontend provides the Qoder IDE dark-mode interface, real-time Grad-CAM heatmaps, Kinyarwanda translations, and 2G USSD (`*844#`) offline simulator.

```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 2. Backend (Python AI Microservice)
The backend loads the neural networks, processes leaf tensors, queries live satellite weather, and executes the agronomic reasoning engine.

```bash
cd backend
pip install -r requirements.txt
uvicorn backend_bridge:app --host 0.0.0.0 --port 8000 --reload
```
API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).
