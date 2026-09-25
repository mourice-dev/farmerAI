"""Streamlit web application for the Plant Disease Detector.

Run:
    pip install -e .
    streamlit run app/app.py
"""

import io
import logging
import sys
from pathlib import Path

import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import streamlit as st
from PIL import Image

matplotlib.use("Agg")

_project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_project_root))

from src.dataset import CLASSES, get_transforms, prepare_input_image
from src.diseases import (
    DISCLAIMER,
    SEVERITY_COLOR,
    SEVERITY_LABEL,
    get_disease_info,
)
from src.gradcam import GradCAM, explain
from src.model import EfficientNetB4Classifier
from src.utils import get_device, load_checkpoint

logger = logging.getLogger(__name__)

# ------------------------------------------------------------------
# Constants
# ------------------------------------------------------------------

CHECKPOINT_PATH = _project_root / "models" / "best_model.pth"
NUM_CLASSES = 38
HF_REPO_ID = "Khawajaa/plant-disease-detector"
IMG_SIZE = 224

# ------------------------------------------------------------------
# Page config
# ------------------------------------------------------------------

st.set_page_config(
    page_title="Plant Disease Detector",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ------------------------------------------------------------------
# Custom CSS - fresh green agricultural theme
# ------------------------------------------------------------------

st.markdown("""
<style>
    /* Gradient header */
    .hero-title {
        font-size: 2.6rem;
        font-weight: 800;
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 50%, #56ab2f 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        margin-bottom: 0;
    }
    .hero-sub {
        text-align: center;
        color: #666;
        font-size: 1.05rem;
        margin-bottom: 1.5rem;
    }
    /* Prediction cards */
    .pred-card {
        padding: 1.2rem 1.5rem;
        border-radius: 12px;
        text-align: center;
        font-size: 1.5rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        margin-bottom: 0.8rem;
    }
    .pred-healthy  { background: #d5f5e3; color: #1e8449; border: 2px solid #27ae60; }
    .pred-moderate { background: #fdebd0; color: #935116; border: 2px solid #e67e22; }
    .pred-severe   { background: #fadbd8; color: #922b21; border: 2px solid #c0392b; }
    /* Tag chips */
    .chip {
        display: inline-block;
        background: #eafaf1;
        border: 1px solid #a9dfbf;
        border-radius: 999px;
        padding: 2px 12px;
        font-size: 0.78rem;
        color: #1e8449;
        margin: 2px 3px;
    }
    /* Treatment box */
    .treatment-box {
        background: #f9f9f9;
        border-left: 4px solid #27ae60;
        border-radius: 6px;
        padding: 0.8rem 1rem;
        font-size: 0.95rem;
        color: #333;
        margin-top: 0.5rem;
    }
    hr { border-color: #d5f5e3; }
</style>
""", unsafe_allow_html=True)

# ------------------------------------------------------------------
# Model loader (cached)
# ------------------------------------------------------------------


def _ensure_checkpoint() -> Path:
    """Return a path to the checkpoint, downloading it from the Hub if needed.

    Exceptions propagate on purpose. Swallowing them here and returning a
    sentinel meant `st.cache_resource` cached the failure for the life of the
    session, so one transient network blip bricked the app until restart -- and
    the user was told to run `python scripts/train.py`, which is not the
    problem on a deployed instance.
    """
    if CHECKPOINT_PATH.exists():
        return CHECKPOINT_PATH

    from huggingface_hub import hf_hub_download

    CHECKPOINT_PATH.parent.mkdir(parents=True, exist_ok=True)
    downloaded = hf_hub_download(
        repo_id=HF_REPO_ID,
        filename="best_model.pth",
        local_dir=str(CHECKPOINT_PATH.parent),
    )
    return Path(downloaded)


@st.cache_resource(show_spinner="Loading model (first run downloads ~71 MB) ...")
def load_model():
    """Load the classifier. Raises if the checkpoint cannot be obtained.

    Streamlit does not cache exceptions, so a failure here is retried on the
    next run rather than remembered.
    """
    device = get_device()
    model = EfficientNetB4Classifier(num_classes=NUM_CLASSES, pretrained=False)
    checkpoint = _ensure_checkpoint()
    load_checkpoint(model, str(checkpoint), device)
    return model.to(device).eval(), device


# ------------------------------------------------------------------
# Inference
# ------------------------------------------------------------------

def analyse(model, device, image_pil: Image.Image):
    """Run the model once and return (probs, cam, denormalised image, pred_idx).

    Grad-CAM already performs a forward pass to build the graph it backpropagates
    through, so its softmax is reused instead of running inference a second time.
    """
    tensor = get_transforms("val", img_size=IMG_SIZE)(image_pil)
    cam, img_np, pred_idx, probs = explain(model, tensor, device)
    return probs, cam, img_np, pred_idx


def build_figure(image_pil, cam, img_np, overlay):
    BG = "#0d1117"
    fig = plt.figure(figsize=(16, 5), facecolor=BG)

    panels = [
        (np.array(image_pil), "Original Leaf", None),
        (cam, "Grad-CAM", "hot"),
        (overlay, "Overlay", None),
    ]
    for i, (img, title, cmap) in enumerate(panels, 1):
        ax = fig.add_subplot(1, 3, i)
        ax.imshow(img, cmap=cmap)
        ax.set_title(title, color="white", fontsize=11, pad=6)
        ax.axis("off")
        ax.set_facecolor(BG)

    fig.tight_layout(pad=1.0)
    return fig


# ------------------------------------------------------------------
# Sidebar
# ------------------------------------------------------------------

def sidebar():
    with st.sidebar:
        st.markdown("## 🌿 About")
        st.info(
            "**Model:** EfficientNet-B4 (transfer learning)\n\n"
            "**Dataset:** PlantVillage (87,000+ images)\n\n"
            "**Classes:** 38 (14 plant species)\n\n"
            "**Diseases:** 26 unique diseases\n\n"
            "**Explainability:** Grad-CAM heatmaps"
        )
        st.markdown("## 🏷️ Tech Stack")
        tags = ["PyTorch", "EfficientNet-B4", "Grad-CAM", "Streamlit", "OpenCV", "scikit-learn"]
        st.markdown(" ".join(f'<span class="chip">{t}</span>' for t in tags),
                    unsafe_allow_html=True)
        st.markdown("## 📋 Supported Plants")
        plants = sorted({c.split("___")[0].replace("_", " ") for c in CLASSES})
        st.markdown(" ".join(f'<span class="chip">{p}</span>' for p in plants),
                    unsafe_allow_html=True)
        st.markdown("## 🔍 How to use")
        st.markdown(
            "1. Upload a photo of a plant leaf (JPG/PNG)\n"
            "2. The model identifies the plant and disease\n"
            "3. Grad-CAM highlights the affected leaf regions\n"
            "4. Treatment recommendations are provided"
        )
        st.markdown("---")
        st.caption("Built by **Abeer Ashraf** · EfficientNet-B4 + Grad-CAM")


# ------------------------------------------------------------------
# Main app
# ------------------------------------------------------------------

def main():
    st.markdown('<h1 class="hero-title">🌿 Plant Disease Detector</h1>', unsafe_allow_html=True)
    st.markdown(
        '<p class="hero-sub">EfficientNet-B4 Transfer Learning · Grad-CAM Explainability '
        '· 38 Disease Classes</p>',
        unsafe_allow_html=True,
    )
    st.divider()
    sidebar()

    try:
        model, device = load_model()
    except Exception as exc:
        logger.exception("Model load failed")
        st.error(
            "**Could not load the model.**\n\n"
            f"`{type(exc).__name__}: {exc}`\n\n"
            f"The app downloads `best_model.pth` from "
            f"[{HF_REPO_ID}](https://huggingface.co/{HF_REPO_ID}) on first run. "
            "If that repository is reachable, this is usually a transient network "
            "error -- retry below."
        )
        if st.button("Retry loading the model"):
            load_model.clear()
            st.rerun()
        return

    uploaded = st.file_uploader(
        "Upload a plant leaf image",
        type=["jpg", "jpeg", "png"],
        help="Clear, close-up photo of a single leaf - JPEG or PNG",
    )

    if uploaded is None:
        st.info("Upload a plant leaf photo above to detect diseases.")
        _show_class_grid()
        return

    # Decode straight from the upload buffer; a temp file on disk buys nothing.
    try:
        raw = Image.open(io.BytesIO(uploaded.getvalue())).convert("RGB")
    except Exception as exc:
        st.error(f"Could not read that image: `{type(exc).__name__}: {exc}`")
        return

    # Scale-and-centre-crop rather than squashing: the model has only ever seen
    # square images, so distorting a 4:3 photo into a square is a train/serve
    # mismatch the model was never given a chance to learn.
    image_pil = prepare_input_image(raw, IMG_SIZE)

    with st.spinner("Analysing leaf ..."):
        probs, cam, img_np, pred_idx = analyse(model, device, image_pil)
        overlay = GradCAM.overlay(cam, img_np, alpha=0.45)

    top5_idx = np.argsort(probs)[::-1][:5]
    pred_class = CLASSES[pred_idx]
    confidence = float(probs[pred_idx]) * 100
    info = get_disease_info(pred_class)

    # The disclaimer sits above the result, and shows for every prediction.
    # Gating it on `severity != "none"` meant a false "healthy" call -- the most
    # expensive mistake this model can make for a grower -- carried no warning
    # at all.
    st.warning(f"**Read before acting on this result.** {DISCLAIMER}")

    # ---- Top result strip ----
    col_img, col_pred = st.columns([1, 2], gap="large")

    with col_img:
        st.image(image_pil, caption="Uploaded Leaf (centre-cropped)", use_container_width=True)

    with col_pred:
        severity = info["severity"]
        css_cls = {
            "none": "pred-healthy",
            "moderate": "pred-moderate",
            "severe": "pred-severe",
        }.get(severity, "pred-moderate")
        st.markdown(
            f'<div class="pred-card {css_cls}">{info["icon"]}  '
            f'{info["plant"]} — {info["label"]}</div>',
            unsafe_allow_html=True,
        )

        sev_color = SEVERITY_COLOR.get(severity, "#8e44ad")
        sev_label = SEVERITY_LABEL.get(severity, "Unknown")
        st.markdown(
            f'**Risk Level:** <span style="color:{sev_color};font-weight:600;">'
            f'{sev_label}</span>',
            unsafe_allow_html=True,
        )
        if info["pathogen"]:
            st.caption(f"Pathogen: *{info['pathogen']}*")
        st.metric("Confidence", f"{confidence:.1f}%")

        st.markdown("**Top-5 predictions**")
        for idx in top5_idx:
            other = get_disease_info(CLASSES[idx])
            label = f"{other['plant']} — {other['label']}"
            c1, c2 = st.columns([3, 1])
            c1.progress(float(probs[idx]), text=label)
            c2.caption(f"{probs[idx] * 100:.1f}%")

    # ---- Treatment recommendation ----
    st.divider()
    col_treat, col_cam = st.columns([1, 2], gap="large")

    with col_treat:
        st.subheader(f"{info['icon']} Treatment")
        st.markdown(
            f'<div class="treatment-box">{info["treatment"]}</div>',
            unsafe_allow_html=True,
        )

    with col_cam:
        st.subheader("Grad-CAM Explainability")
        st.caption(
            "The heatmap highlights which leaf regions drove the prediction. "
            "Warm colours (red/yellow) = high activation."
        )
        fig = build_figure(image_pil, cam, img_np, overlay)
        st.pyplot(fig, use_container_width=True)
        plt.close(fig)


def _show_class_grid():
    """Show a summary grid of all 38 supported classes."""
    st.divider()
    st.subheader("📋 Supported Plant-Disease Classes")
    plants: dict[str, list[str]] = {}
    for cls in CLASSES:
        info = get_disease_info(cls)
        plants.setdefault(info["plant"], []).append(info["label"])

    cols = st.columns(3)
    for i, (plant, diseases) in enumerate(sorted(plants.items())):
        with cols[i % 3]:
            healthy = [d for d in diseases if "healthy" in d.lower()]
            sick = [d for d in diseases if "healthy" not in d.lower()]
            lines = [f"✅ {d}" for d in healthy] + [f"⚠️ {d}" for d in sick]
            st.markdown(f"**🌱 {plant}**")
            st.caption("\n".join(lines))


if __name__ == "__main__":
    main()
