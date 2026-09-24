"""
infer.py — Crop Disease Classifier Inference (38 Classes)
=========================================================
Classifies plant diseases from leaf images using EfficientNetV2-S.
Supports both ONNX Runtime (fast, edge) and PyTorch.

Usage:
    python infer.py --image sample_leaf.jpg
    python infer.py --image sample_leaf.jpg --backend pytorch
"""

import argparse
import json
from pathlib import Path
import numpy as np
from PIL import Image

def parse_args():
    parser = argparse.ArgumentParser(description="Crop Disease Classifier Inference")
    parser.add_argument("--image", type=str, required=True, help="Path to input leaf image")
    parser.add_argument("--topk", type=int, default=5, help="Number of top predictions to display")
    parser.add_argument("--backend", choices=["onnx", "pytorch"], default="onnx", help="Inference backend")
    parser.add_argument("--onnx-model", type=str, default="efficientnet_v2_s_best.onnx", help="Path to ONNX model")
    parser.add_argument("--pytorch-model", type=str, default="efficientnet_v2_s_best.pth", help="Path to PyTorch checkpoint")
    parser.add_argument("--classes", type=str, default="classes.json", help="Path to classes JSON")
    return parser.parse_args()

def preprocess_image(image_path: str, size: int = 224):
    img = Image.open(image_path).convert("RGB").resize((size, size), Image.Resampling.BILINEAR)
    arr = np.array(img, dtype=np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    arr = (arr - mean) / std
    arr = np.transpose(arr, (2, 0, 1))  # HWC -> CHW
    return np.expand_dims(arr, axis=0).astype(np.float32)

def run_onnx(image_tensor: np.ndarray, model_path: str):
    import onnxruntime as ort
    session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
    input_name = session.get_inputs()[0].name
    outputs = session.run(None, {input_name: image_tensor})
    return outputs[0][0]

def run_pytorch(image_tensor: np.ndarray, checkpoint_path: str, num_classes: int):
    import torch
    import torch.nn as nn
    from torchvision import models
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = models.efficientnet_v2_s(weights=None)
    in_features = model.classifier[-1].in_features
    model.classifier[-1] = nn.Linear(in_features, num_classes)
    ckpt = torch.load(checkpoint_path, map_location=device, weights_only=False)
    state = ckpt["model_state_dict"] if "model_state_dict" in ckpt else ckpt
    # Clean dropout prefix if any
    cleaned_state = {}
    for k, v in state.items():
        if "classifier.1.1." in k:
            cleaned_state[k.replace("classifier.1.1.", "classifier.1.")] = v
        else:
            cleaned_state[k] = v
    try:
        model.load_state_dict(cleaned_state, strict=True)
    except Exception:
        model.classifier[-1] = nn.Sequential(nn.Dropout(p=0.0), nn.Linear(in_features, num_classes))
        model.load_state_dict(state, strict=False)
    model.to(device).eval()
    tensor = torch.from_numpy(image_tensor).to(device)
    with torch.no_grad():
        out = model(tensor)
    return out.cpu().numpy()[0]

def softmax(x):
    e = np.exp(x - np.max(x))
    return e / np.sum(e)

def format_class_name(raw_name: str) -> str:
    parts = raw_name.split("___")
    crop = parts[0].replace("_", " ").title()
    disease = parts[1].replace("_", " ") if len(parts) > 1 else "Healthy"
    return f"{crop} — {disease}"

def main():
    args = parse_args()
    with open(args.classes, "r", encoding="utf-8") as f:
        meta = json.load(f)
    classes = meta["classes"] if isinstance(meta, dict) and "classes" in meta else meta

    tensor = preprocess_image(args.image, meta.get("image_size", 224))
    print(f"Running inference on {args.image} via {args.backend.upper()}...")

    if args.backend == "onnx":
        logits = run_onnx(tensor, args.onnx_model)
    else:
        logits = run_pytorch(tensor, args.pytorch_model, len(classes))

    probs = softmax(logits)
    top_indices = np.argsort(probs)[::-1][:args.topk]

    print("\n" + "=" * 65)
    print(f"  TOP {args.topk} PLANT DISEASE PREDICTIONS")
    print("=" * 65)
    for rank, idx in enumerate(top_indices, 1):
        name = format_class_name(classes[idx])
        conf = probs[idx] * 100
        bar = "#" * int(conf / 5)
        print(f"  {rank}. {name:<40} {conf:5.1f}%  [{bar:<20}]")
    print("=" * 65)

if __name__ == "__main__":
    main()
