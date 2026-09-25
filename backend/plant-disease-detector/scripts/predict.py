"""Single-image prediction with Grad-CAM visualisation.

Usage:
    python scripts/predict.py path/to/leaf.jpg
    python scripts/predict.py path/to/leaf.jpg --checkpoint models/best_model.pth --top-k 5
"""

import argparse
import sys
import textwrap
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.dataset import CLASSES, get_transforms, prepare_input_image
from src.diseases import DISCLAIMER, get_disease_info
from src.gradcam import GradCAM, explain
from src.model import EfficientNetB4Classifier
from src.utils import get_device, load_checkpoint


def predict_and_explain(
    image_path: str,
    checkpoint_path: str = "models/best_model.pth",
    output_dir: str = "outputs",
    top_k: int = 5,
    show: bool = True,
):
    device = get_device()

    model = EfficientNetB4Classifier(num_classes=38, pretrained=False)
    if not Path(checkpoint_path).exists():
        print(f"[ERROR] Checkpoint not found: {checkpoint_path}")
        print("        Train first: python scripts/train.py")
        sys.exit(1)
    load_checkpoint(model, checkpoint_path, device)
    model = model.to(device).eval()

    # Scale-and-centre-crop rather than squashing an off-square photo: every
    # training image is square, so a distorted input is a train/serve mismatch.
    image_pil = prepare_input_image(Image.open(image_path).convert("RGB"))
    tensor = get_transforms("val", img_size=224)(image_pil)

    # One forward pass: Grad-CAM needs it anyway and returns the softmax.
    cam, img_np, pred_idx, probs = explain(model, tensor, device)
    overlay = GradCAM.overlay(cam, img_np, alpha=0.45)

    top_indices = np.argsort(probs)[::-1][:top_k]
    pred_class = CLASSES[pred_idx]
    confidence = float(probs[pred_idx]) * 100
    info = get_disease_info(pred_class)

    # ---- Figure ----
    BG = "#0d1117"
    fig = plt.figure(figsize=(20, 6), facecolor=BG)
    fig.suptitle(
        f"{info['plant']}  -  {info['label']}  ({confidence:.1f}%)",
        fontsize=16, fontweight="bold", color=info["color"], y=1.01,
    )

    panels = [
        (np.array(image_pil), "Original Leaf", None),
        (cam, "Grad-CAM Heatmap", "hot"),
        (overlay, "Overlay", None),
    ]
    for i, (img, title, cmap) in enumerate(panels, 1):
        ax = fig.add_subplot(1, 5, i)
        ax.imshow(img, cmap=cmap)
        ax.set_title(title, color="white", fontsize=11, pad=6)
        ax.axis("off")
        ax.set_facecolor(BG)

    # Top-k bar chart
    ax_bar = fig.add_subplot(1, 5, 4)
    top_probs = probs[top_indices]
    top_labels = [get_disease_info(CLASSES[i])["label"][:22] for i in top_indices]
    bar_colors = [get_disease_info(CLASSES[i])["color"] for i in top_indices]
    bars = ax_bar.barh(top_labels[::-1], top_probs[::-1] * 100, color=bar_colors[::-1],
                       edgecolor="#555", lw=0.5)
    for bar, p in zip(bars, top_probs[::-1], strict=True):
        ax_bar.text(bar.get_width() + 0.5, bar.get_y() + bar.get_height() / 2,
                    f"{p * 100:.1f}%", va="center", color="white", fontsize=9)
    ax_bar.set_xlim(0, 115)
    ax_bar.set_xlabel("Confidence (%)", color="#aaa", fontsize=9)
    ax_bar.set_title(f"Top-{top_k} Predictions", color="white", fontsize=11, pad=6)
    ax_bar.set_facecolor(BG)
    ax_bar.tick_params(colors="white")
    for sp in ax_bar.spines.values():
        sp.set_edgecolor("#333")

    # Treatment hint panel
    ax_hint = fig.add_subplot(1, 5, 5)
    ax_hint.axis("off")
    ax_hint.set_facecolor(BG)
    ax_hint.text(0.5, 0.92, "Treatment", ha="center", va="top",
                 fontsize=12, fontweight="bold", color="white",
                 transform=ax_hint.transAxes)
    ax_hint.text(0.5, 0.82, "\n".join(textwrap.wrap(info["treatment"], 34)),
                 ha="center", va="top", fontsize=7.5, color="#cccccc",
                 transform=ax_hint.transAxes, multialignment="center")

    fig.tight_layout(pad=1.2)

    Path(output_dir).mkdir(parents=True, exist_ok=True)
    out_path = Path(output_dir) / f"prediction_{Path(image_path).stem}.png"
    fig.savefig(out_path, dpi=150, bbox_inches="tight", facecolor=BG)

    if show:
        plt.show()
    plt.close(fig)

    print(f"\nPlant      : {info['plant']}")
    print(f"Prediction : {info['label']}")
    if info["pathogen"]:
        print(f"Pathogen   : {info['pathogen']}")
    print(f"Confidence : {confidence:.1f}%")
    print(f"Saved to   : {out_path}")
    print(f"\nTop-{top_k} predictions:")
    for rank, idx in enumerate(top_indices, 1):
        print(f"  {rank}. {CLASSES[idx]:55s}  {probs[idx] * 100:5.1f}%")
    print("\nTreatment  :")
    print(textwrap.indent(textwrap.fill(info["treatment"], 74), "  "))
    print("\n" + textwrap.indent(textwrap.fill(DISCLAIMER, 74), "  ! "))

    return {"class": pred_class, "confidence": confidence, "probs": probs.tolist()}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Predict plant disease from a leaf image")
    parser.add_argument("image", help="Path to leaf image (JPG/PNG)")
    parser.add_argument("--checkpoint", default="models/best_model.pth")
    parser.add_argument("--output-dir", default="outputs")
    parser.add_argument("--top-k", type=int, default=5)
    parser.add_argument("--no-show", action="store_true")
    args = parser.parse_args()
    predict_and_explain(args.image, args.checkpoint, args.output_dir, args.top_k,
                        show=not args.no_show)
