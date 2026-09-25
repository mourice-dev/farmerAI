"""Run full evaluation on a saved checkpoint.

The default is the held-out `test` split, which is the number worth quoting:
it is built by `scripts/make_splits.py` grouped on source image, so no
augmented copy of a test leaf appears in training, and unlike `val` it played
no part in choosing the checkpoint.

Usage:
    python scripts/evaluate.py
    python scripts/evaluate.py --split val
    python scripts/evaluate.py --checkpoint models/best_model.pth --split test
"""

import argparse
import json
import logging
import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.dataset import get_dataloaders
from src.evaluate import evaluate_model
from src.model import EfficientNetB4Classifier
from src.utils import get_device, load_checkpoint, set_seed, setup_logging


def main(
    config_path: str = "configs/config.yaml",
    checkpoint: str | None = None,
    split: str = "test",
    save_json: str | None = None,
):
    with open(config_path) as f:
        config = yaml.safe_load(f)

    setup_logging()
    logger = logging.getLogger(__name__)
    set_seed(config["seed"])
    device = get_device()

    # Build only the split being scored. Constructing the 60k-image training
    # set and its sampler to evaluate one split wasted minutes per run and made
    # evaluation fail on a machine that only has the evaluation data.
    loaders, datasets = get_dataloaders(
        data_dir=config["data"]["data_dir"],
        batch_size=config["data"]["batch_size"],
        img_size=config["data"]["img_size"],
        num_workers=config["data"]["num_workers"],
        splits=(split,),
        manifest=config["data"]["manifest"],
    )

    model = EfficientNetB4Classifier(
        num_classes=config["model"]["num_classes"],
        dropout=config["model"]["dropout"],
        pretrained=False,
    )

    ckpt_path = checkpoint or (Path(config["paths"]["save_dir"]) / "best_model.pth")
    if not Path(ckpt_path).exists():
        logger.error(f"Checkpoint not found: {ckpt_path}")
        logger.error("Train first: python scripts/train.py")
        sys.exit(1)

    val_acc, epoch = load_checkpoint(model, ckpt_path, device)
    logger.info(f"Loaded checkpoint from epoch {epoch}  (val_acc={val_acc:.2f}%)")
    model = model.to(device)

    metrics = evaluate_model(
        model, loaders[split], device,
        save_dir=config["paths"]["output_dir"],
        split=split,
    )

    print("\n" + "=" * 58)
    print(f"  EVALUATION RESULTS  --  {split} split")
    print("=" * 58)
    print(f"  Images            : {metrics['n_images']:,}")
    print(f"  Top-1 Accuracy    : {metrics['top1_accuracy']:.2f}%")
    print(f"  Top-5 Accuracy    : {metrics['top5_accuracy']:.2f}%")
    print(f"  Balanced Accuracy : {metrics['balanced_accuracy']:.2f}%")
    print(f"  Macro F1          : {metrics['macro_f1']:.4f}")
    auc = metrics["auc_roc_macro"]
    print(f"  AUC-ROC (macro)   : {auc:.4f}" if auc is not None
          else "  AUC-ROC (macro)   : n/a (a class is absent from this split)")
    if split == "val":
        print("\n  Note: `val` selected this checkpoint. Quote `test` as the")
        print("        headline number, not this one.")
    print("=" * 58)
    print(f"\nPlots saved to: {config['paths']['output_dir']}/")

    out_json = save_json or (
        Path(config["paths"]["output_dir"]) / f"metrics_{split}.json"
    )
    Path(out_json).parent.mkdir(parents=True, exist_ok=True)
    with open(out_json, "w") as f:
        json.dump(
            {"checkpoint": str(ckpt_path), "epoch": epoch,
             "n_classes": len(datasets[split].CLASSES), **metrics},
            f, indent=2,
        )
    print(f"Metrics written to: {out_json}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default="configs/config.yaml")
    parser.add_argument("--checkpoint", default=None)
    parser.add_argument(
        "--split", default="test", choices=["train", "val", "test"],
        help="Split to score (default: test, the held-out set).",
    )
    parser.add_argument("--save-json", default=None)
    args = parser.parse_args()
    main(args.config, args.checkpoint, args.split, args.save_json)
