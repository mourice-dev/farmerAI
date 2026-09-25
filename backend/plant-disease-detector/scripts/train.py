"""Main training entry point.

Usage:
    python scripts/train.py
    python scripts/train.py --config configs/config.yaml
"""

import argparse
import logging
import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.dataset import get_dataloaders
from src.evaluate import plot_training_history
from src.model import EfficientNetB4Classifier
from src.train import Trainer
from src.utils import get_device, set_seed, setup_logging


def main(config_path: str = "configs/config.yaml"):
    with open(config_path) as f:
        config = yaml.safe_load(f)

    setup_logging(log_file=config["paths"]["log_file"])
    logger = logging.getLogger(__name__)

    set_seed(config["seed"])
    device = get_device()

    # ------------------------------------------------------------------
    # Data
    # ------------------------------------------------------------------
    logger.info("Loading dataset ...")
    loaders, datasets = get_dataloaders(
        data_dir=config["data"]["data_dir"],
        batch_size=config["data"]["batch_size"],
        img_size=config["data"]["img_size"],
        num_workers=config["data"]["num_workers"],
        splits=("train", "val"),
        manifest=config["data"]["manifest"],
    )
    train_ds = datasets["train"]

    logger.info(f"  train : {len(train_ds):,} images")
    logger.info(f"  val   : {len(datasets['val']):,} images")
    logger.info(f"  classes: {config['model']['num_classes']}")

    dist = train_ds.class_distribution()
    lo, hi = min(dist.values()), max(dist.values())
    logger.info(f"  class distribution (train): min={lo}, max={hi}, ratio={hi / lo:.2f}x")

    # ------------------------------------------------------------------
    # Model
    # ------------------------------------------------------------------
    logger.info("Building EfficientNet-B4 model ...")
    model = EfficientNetB4Classifier(
        num_classes=config["model"]["num_classes"],
        dropout=config["model"]["dropout"],
        pretrained=config["model"]["pretrained"],
    )
    logger.info(f"  Total params:     {model.count_parameters(False):,}")
    logger.info(f"  Trainable params: {model.count_parameters(True):,}  (before unfreeze)")

    # ------------------------------------------------------------------
    # Train
    # ------------------------------------------------------------------
    # One imbalance correction, not two. An earlier version also wrapped the
    # training set in a WeightedRandomSampler, which squares the intended
    # up-weighting of rare classes. Class-weighted loss is kept because it
    # covers every training image exactly once per epoch; the sampler draws
    # with replacement and does not.
    class_weights = train_ds.get_class_weights()
    logger.info(f"  Class weight range: [{class_weights.min():.3f}, {class_weights.max():.3f}]")

    trainer = Trainer(
        model=model,
        config=config,
        device=device,
        save_dir=config["paths"]["save_dir"],
    )
    history = trainer.fit(loaders["train"], loaders["val"], class_weights=class_weights)

    # ------------------------------------------------------------------
    # Save training curves
    # ------------------------------------------------------------------
    plot_training_history(history, save_dir=config["paths"]["output_dir"])
    logger.info(
        "\nTraining finished!\n"
        "  Best checkpoint : models/best_model.pth\n"
        "  Training curves : outputs/training_history.png\n"
        "  Next step       : python scripts/evaluate.py --split test"
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default="configs/config.yaml")
    args = parser.parse_args()
    main(args.config)
