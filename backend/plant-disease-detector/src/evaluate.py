"""Evaluation utilities: metrics, plots, and whole-split evaluation."""

import logging
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
import torch
from sklearn.metrics import (
    balanced_accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    roc_auc_score,
    top_k_accuracy_score,
)

from .dataset import CLASSES

logger = logging.getLogger(__name__)


# ------------------------------------------------------------------
# Main evaluation entry point
# ------------------------------------------------------------------

def evaluate_model(
    model: torch.nn.Module,
    data_loader,
    device: torch.device,
    save_dir: str = "outputs",
    split: str = "val",
) -> dict:
    """Score *model* on *data_loader* and write the per-class plots.

    `split` only names the output files, so evaluating validation and test does
    not silently overwrite one set of plots with the other.
    """
    save_dir = Path(save_dir)
    save_dir.mkdir(parents=True, exist_ok=True)

    model.eval()
    all_preds, all_labels, all_probs = [], [], []

    with torch.no_grad():
        for images, labels in data_loader:
            images = images.to(device)
            logits = model(images)
            probs = torch.softmax(logits, dim=1)
            preds = logits.argmax(dim=1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())
            all_probs.extend(probs.cpu().numpy())

    y_true = np.array(all_labels)
    y_pred = np.array(all_preds)
    y_prob = np.array(all_probs)

    # Pass the full label set explicitly. Without it these metrics are computed
    # over only the classes present in y_true, so a split missing a class
    # silently changes what "macro" averages over.
    labels = list(range(len(CLASSES)))
    acc = 100.0 * (y_pred == y_true).mean()
    top5_acc = top_k_accuracy_score(y_true, y_prob, k=5, labels=labels) * 100
    macro_f1 = f1_score(y_true, y_pred, average="macro", labels=labels, zero_division=0)
    balanced_acc = 100.0 * balanced_accuracy_score(y_true, y_pred)

    cm = confusion_matrix(y_true, y_pred, labels=labels)
    support = cm.sum(axis=1)
    per_class_acc = np.divide(
        np.diag(cm), support, out=np.zeros(len(CLASSES)), where=support > 0
    ) * 100
    scored = [i for i in labels if support[i] > 0]

    # AUC needs every class represented; on a split that is missing one it
    # cannot be computed at all rather than being quietly computed on a subset.
    if len(scored) == len(CLASSES):
        auc = roc_auc_score(y_true, y_prob, multi_class="ovr", average="macro", labels=labels)
    else:
        auc = float("nan")
        logger.warning(
            f"AUC-ROC skipped: {len(CLASSES) - len(scored)} class(es) absent from this split."
        )

    worst = sorted(scored, key=lambda i: per_class_acc[i])[:5]

    logger.info(f"Split          : {split}  ({len(y_true):,} images)")
    logger.info(f"Top-1 Accuracy : {acc:.2f}%")
    logger.info(f"Top-5 Accuracy : {top5_acc:.2f}%")
    logger.info(f"Balanced Acc.  : {balanced_acc:.2f}%")
    logger.info(f"Macro F1       : {macro_f1:.4f}")
    logger.info(f"AUC-ROC (macro): {auc:.4f}")
    logger.info("Weakest classes:")
    for i in worst:
        logger.info(f"  {per_class_acc[i]:6.2f}%  {CLASSES[i]}  (n={support[i]})")
    logger.info(
        "\n" + classification_report(
            y_true, y_pred, labels=labels, target_names=CLASSES, zero_division=0
        )
    )

    plot_per_class_accuracy(y_true, y_pred, save_dir, split=split)
    plot_top_confused_classes(y_true, y_pred, save_dir, split=split)

    # Plain floats, not numpy scalars: these get written straight to JSON.
    return {
        "split": split,
        "n_images": len(y_true),
        "top1_accuracy": float(acc),
        "top5_accuracy": float(top5_acc),
        "balanced_accuracy": float(balanced_acc),
        "macro_f1": float(macro_f1),
        "auc_roc_macro": None if np.isnan(auc) else float(auc),
        "per_class_accuracy": {CLASSES[i]: float(per_class_acc[i]) for i in scored},
        "support": {CLASSES[i]: int(support[i]) for i in scored},
    }


# ------------------------------------------------------------------
# Plot helpers
# ------------------------------------------------------------------

def plot_per_class_accuracy(y_true, y_pred, save_dir: Path, split: str = "val"):
    """Horizontal bar chart: per-class accuracy, coloured by plant type."""
    cm = confusion_matrix(y_true, y_pred, labels=list(range(len(CLASSES))))
    support = cm.sum(axis=1)
    per_class_acc = np.divide(
        np.diag(cm), support, out=np.zeros(len(CLASSES)), where=support > 0
    ) * 100

    # Sort worst → best
    order = np.argsort(per_class_acc)
    sorted_acc = per_class_acc[order]
    sorted_names = [CLASSES[i].replace("___", "\n").replace("_", " ") for i in order]

    colors = ["#e74c3c" if a < 90 else "#f39c12" if a < 97 else "#27ae60" for a in sorted_acc]

    fig, ax = plt.subplots(figsize=(10, 14))
    bars = ax.barh(sorted_names, sorted_acc, color=colors, edgecolor="white", lw=0.4)
    for bar, acc in zip(bars, sorted_acc, strict=True):
        ax.text(
            min(bar.get_width() + 0.3, 99), bar.get_y() + bar.get_height() / 2,
            f"{acc:.1f}%", va="center", fontsize=7,
        )
    ax.set_xlim(0, 105)
    ax.set_xlabel("Accuracy (%)", fontsize=12)
    ax.set_title(f"Per-Class Accuracy ({split})", fontsize=14, fontweight="bold")
    ax.axvline(90, color="red", lw=1, linestyle="--", alpha=0.5, label="90%")
    ax.axvline(97, color="orange", lw=1, linestyle="--", alpha=0.5, label="97%")
    ax.legend(fontsize=9)
    ax.grid(axis="x", alpha=0.3)
    fig.tight_layout()
    out = save_dir / f"per_class_accuracy_{split}.png"
    fig.savefig(out, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info(f"Saved: {out.name}")


def plot_top_confused_classes(y_true, y_pred, save_dir: Path, top_n: int = 12, split: str = "val"):
    """Heatmap of the most frequently confused class pairs."""
    cm = confusion_matrix(y_true, y_pred, labels=list(range(len(CLASSES))))
    np.fill_diagonal(cm, 0)  # zero out correct predictions

    # Find top_n classes with the most confusion
    class_errors = cm.sum(axis=1) + cm.sum(axis=0)
    top_idx = np.argsort(class_errors)[-top_n:]
    sub_cm = cm[np.ix_(top_idx, top_idx)]
    sub_labels = [CLASSES[i].split("___")[-1].replace("_", " ")[:20] for i in top_idx]

    fig, ax = plt.subplots(figsize=(12, 10))
    sns.heatmap(
        sub_cm, annot=True, fmt="d", cmap="Reds",
        xticklabels=sub_labels, yticklabels=sub_labels,
        ax=ax, square=True, linewidths=0.5,
    )
    ax.set_title(f"Top-{top_n} Most Confused Class Pairs, {split} (off-diagonal errors)",
                 fontsize=13, fontweight="bold")
    ax.set_xlabel("Predicted", fontsize=11)
    ax.set_ylabel("True", fontsize=11)
    plt.xticks(rotation=45, ha="right", fontsize=8)
    plt.yticks(rotation=0, fontsize=8)
    fig.tight_layout()
    out = save_dir / f"confusion_matrix_top_confused_{split}.png"
    fig.savefig(out, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info(f"Saved: {out.name}")


def plot_training_history(history: dict, save_dir: str = "outputs"):
    save_dir = Path(save_dir)
    save_dir.mkdir(parents=True, exist_ok=True)

    epochs = range(1, len(history["train_loss"]) + 1)
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    axes[0].plot(epochs, history["train_loss"], "b-o", ms=4, label="Train")
    axes[0].plot(epochs, history["val_loss"], "r-o", ms=4, label="Validation")
    axes[0].set_title("Loss per Epoch", fontsize=14, fontweight="bold")
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Cross-Entropy Loss")
    axes[0].legend()
    axes[0].grid(alpha=0.3)

    axes[1].plot(epochs, history["train_acc"], "b-o", ms=4, label="Train")
    axes[1].plot(epochs, history["val_acc"], "r-o", ms=4, label="Validation")
    axes[1].set_title("Accuracy per Epoch", fontsize=14, fontweight="bold")
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Accuracy (%)")
    axes[1].legend()
    axes[1].grid(alpha=0.3)

    fig.suptitle("Training History — Plant Disease Detector", fontsize=16, fontweight="bold")
    fig.tight_layout()
    fig.savefig(save_dir / "training_history.png", dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info("Saved: training_history.png")
