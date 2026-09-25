"""Tests for EarlyStopping and the mixed-precision setup."""

import sys
from pathlib import Path

import torch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.model import EfficientNetB4Classifier
from src.train import EarlyStopping, Trainer

CONFIG = {
    "training": {
        "num_epochs": 4,
        "warmup_epochs": 1,
        "head_lr": 1e-3,
        "backbone_lr": 1e-5,
        "weight_decay": 1e-4,
        "early_stopping_patience": 2,
    }
}


class TestEarlyStopping:

    def test_does_not_trigger_while_improving(self):
        stopper = EarlyStopping(patience=3)
        for score in (10.0, 20.0, 30.0, 40.0, 50.0):
            assert stopper(score) is False
        assert stopper.best == 50.0

    def test_triggers_after_patience_flat_epochs(self):
        stopper = EarlyStopping(patience=3)
        stopper(90.0)
        assert stopper(90.0) is False   # 1
        assert stopper(90.0) is False   # 2
        assert stopper(90.0) is True    # 3 -> patience reached
        assert stopper.triggered

    def test_counter_resets_on_improvement(self):
        stopper = EarlyStopping(patience=2)
        stopper(50.0)
        stopper(50.0)                   # counter 1
        assert stopper(60.0) is False   # improvement resets
        assert stopper.counter == 0
        assert stopper(60.0) is False   # counter 1 again
        assert stopper(60.0) is True    # counter 2

    def test_improvement_must_exceed_min_delta(self):
        stopper = EarlyStopping(patience=1, min_delta=0.5)
        stopper(90.0)
        # +0.1 is inside the noise band, so it does not count as improvement
        assert stopper(90.1) is True

    def test_stays_triggered_once_fired(self):
        stopper = EarlyStopping(patience=1)
        stopper(10.0)
        assert stopper(10.0) is True
        assert stopper(99.0) is True, "triggered is latching by design"

    def test_first_score_always_counts_as_improvement(self):
        stopper = EarlyStopping(patience=1)
        assert stopper(-5.0) is False
        assert stopper.best == -5.0


class TestMixedPrecisionSetup:

    def test_amp_matches_device_type(self):
        """Hardcoding "cuda" made every CPU batch warn. AMP now follows the
        device, and the CPU path runs the scaler disabled rather than degraded."""
        model = EfficientNetB4Classifier(num_classes=38, pretrained=False)
        trainer = Trainer(model, CONFIG, torch.device("cpu"), save_dir="models")
        assert trainer.amp_enabled is False
        assert trainer.scaler.is_enabled() is False

    def test_autocast_accepts_the_cpu_device_type(self):
        with torch.amp.autocast("cpu", enabled=False):
            out = torch.ones(2, 2) @ torch.ones(2, 2)
        assert out.dtype == torch.float32

    def test_history_starts_empty(self):
        model = EfficientNetB4Classifier(num_classes=38, pretrained=False)
        trainer = Trainer(model, CONFIG, torch.device("cpu"), save_dir="models")
        assert trainer.history["train_loss"] == []
        assert trainer.history["val_acc"] == []
