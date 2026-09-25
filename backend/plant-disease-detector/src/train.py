"""Training engine: two-phase transfer learning with mixed precision and early stopping."""

import json
import logging
import time
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torch.amp import GradScaler, autocast
from torch.optim.lr_scheduler import CosineAnnealingLR
from tqdm import tqdm

from .utils import save_checkpoint

logger = logging.getLogger(__name__)


# ------------------------------------------------------------------
# Early stopping
# ------------------------------------------------------------------

class EarlyStopping:
    """Stop when *score* has not improved by *min_delta* for *patience* epochs."""

    def __init__(self, patience: int = 7, min_delta: float = 1e-4):
        self.patience = patience
        self.min_delta = min_delta
        self.counter = 0
        self.best = -float("inf")
        self.triggered = False

    def __call__(self, score: float) -> bool:
        if score > self.best + self.min_delta:
            self.best = score
            self.counter = 0
        else:
            self.counter += 1
            if self.counter >= self.patience:
                self.triggered = True
        return self.triggered


# ------------------------------------------------------------------
# Training loop helpers
# ------------------------------------------------------------------

def _train_one_epoch(
    model: nn.Module,
    loader,
    optimizer: optim.Optimizer,
    criterion: nn.Module,
    device: torch.device,
    scaler: GradScaler,
    amp_enabled: bool,
) -> tuple[float, float]:
    model.train()
    total_loss = correct = total = 0

    for images, labels in tqdm(loader, desc="  train", leave=False, unit="batch"):
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad(set_to_none=True)

        with autocast(device.type, enabled=amp_enabled):
            logits = model(images)
            loss = criterion(logits, labels)

        scaler.scale(loss).backward()
        scaler.unscale_(optimizer)
        nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        scaler.step(optimizer)
        scaler.update()

        total_loss += loss.item() * images.size(0)
        preds = logits.argmax(dim=1)
        correct += preds.eq(labels).sum().item()
        total += images.size(0)

    return total_loss / total, 100.0 * correct / total


@torch.no_grad()
def _evaluate(
    model: nn.Module,
    loader,
    criterion: nn.Module,
    device: torch.device,
) -> tuple[float, float]:
    """Return (loss, accuracy). Per-sample probabilities are not accumulated
    here -- the training loop only needs these two scalars, and holding a
    (17k, 38) float array per epoch to throw it away is wasted memory.
    `src.evaluate.evaluate_model` produces the full metric set when it is
    actually wanted."""
    model.eval()
    total_loss = correct = total = 0

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        logits = model(images)
        loss = criterion(logits, labels)

        total_loss += loss.item() * images.size(0)
        correct += logits.argmax(dim=1).eq(labels).sum().item()
        total += images.size(0)

    return total_loss / total, 100.0 * correct / total


# ------------------------------------------------------------------
# Trainer
# ------------------------------------------------------------------

class Trainer:
    """Two-phase transfer-learning trainer for EfficientNet-B4.

    Phase 1 (warmup_epochs): backbone frozen, head only.
    Phase 2 (remaining):     full fine-tuning with differential LRs.
    """

    def __init__(
        self,
        model: nn.Module,
        config: dict,
        device: torch.device,
        save_dir: str = "models",
    ):
        self.model = model.to(device)
        self.config = config
        self.device = device
        self.save_dir = Path(save_dir)
        self.save_dir.mkdir(parents=True, exist_ok=True)
        # Mixed precision is a CUDA feature. On CPU, torch degrades autocast to
        # a no-op and warns on every batch; disabling it explicitly keeps the
        # documented CPU path quiet and honest about what it is doing.
        self.amp_enabled = device.type == "cuda"
        self.scaler = GradScaler(device.type, enabled=self.amp_enabled)
        self.history: dict = {
            "train_loss": [], "train_acc": [],
            "val_loss": [], "val_acc": [],
        }

    # ------------------------------------------------------------------

    def fit(self, train_loader, val_loader, class_weights=None):
        cfg = self.config["training"]
        num_epochs = cfg["num_epochs"]
        warmup = cfg["warmup_epochs"]

        # Class weighting corrects the training objective. Validation loss is
        # deliberately unweighted: a re-weighted validation loss is not
        # comparable to the training loss, to other runs, or to the literature.
        train_criterion = (
            nn.CrossEntropyLoss(weight=class_weights.to(self.device))
            if class_weights is not None
            else nn.CrossEntropyLoss()
        )
        val_criterion = nn.CrossEntropyLoss()

        # ---- Phase 1: head only ----
        self.model.freeze_backbone()
        head_optimizer = optim.AdamW(
            filter(lambda p: p.requires_grad, self.model.parameters()),
            lr=cfg["head_lr"],
            weight_decay=cfg["weight_decay"],
        )

        logger.info(f"=== Phase 1: head-only training ({warmup} epochs) ===")
        for ep in range(1, warmup + 1):
            self._run_epoch(ep, warmup, train_loader, val_loader, head_optimizer,
                            train_criterion, val_criterion, phase=1)

        # ---- Phase 2: full fine-tune ----
        self.model.unfreeze_backbone()
        fine_tune_epochs = num_epochs - warmup

        optimizer = optim.AdamW(
            [
                {"params": self.model.features.parameters(), "lr": cfg["backbone_lr"]},
                {"params": self.model.classifier.parameters(), "lr": cfg["head_lr"]},
            ],
            weight_decay=cfg["weight_decay"],
        )
        scheduler = CosineAnnealingLR(optimizer, T_max=fine_tune_epochs, eta_min=1e-7)
        early_stop = EarlyStopping(patience=cfg["early_stopping_patience"])
        best_val_acc = 0.0
        best_epoch = 0
        epochs_run = warmup

        logger.info(f"=== Phase 2: full fine-tuning ({fine_tune_epochs} epochs) ===")
        for ep in range(1, fine_tune_epochs + 1):
            val_acc = self._run_epoch(
                ep, fine_tune_epochs, train_loader, val_loader, optimizer,
                train_criterion, val_criterion, scheduler=scheduler, phase=2,
            )
            epochs_run = warmup + ep
            if val_acc > best_val_acc:
                best_val_acc = val_acc
                best_epoch = epochs_run
                save_checkpoint(
                    self.model, best_epoch, val_acc,
                    self.config, self.save_dir / "best_model.pth"
                )
                logger.info(f"  -> Checkpoint saved (val_acc={val_acc:.2f}%)")

            if early_stop(val_acc):
                logger.info("Early stopping triggered.")
                break

        save_checkpoint(
            self.model, epochs_run, best_val_acc,
            self.config, self.save_dir / "last_model.pth"
        )

        # Recorded so the README can state whether the run converged or simply
        # hit the epoch cap, rather than leaving the reader to assume.
        self.history["epochs_run"] = epochs_run
        self.history["epoch_cap"] = num_epochs
        self.history["early_stopped"] = early_stop.triggered
        self.history["best_epoch"] = best_epoch
        self.history["best_val_acc"] = best_val_acc
        self._dump_history()

        if not early_stop.triggered and epochs_run >= num_epochs:
            # State what happened rather than guessing why. Hitting the cap can
            # mean the curve was still climbing, or that it plateaued while the
            # occasional marginal best kept resetting the patience counter --
            # the gap between the last improvement and the cap tells them apart.
            since_best = epochs_run - best_epoch
            logger.warning(
                f"Reached the {num_epochs}-epoch cap without early stopping "
                f"(patience {cfg['early_stopping_patience']}). Best validation "
                f"accuracy {best_val_acc:.2f}% at epoch {best_epoch}, "
                f"{since_best} epoch(s) before the cap. This run was capped, "
                "not stopped by a convergence criterion; say so when quoting it."
            )
        logger.info(f"Done. Best val accuracy: {best_val_acc:.2f}% (epoch {best_epoch})")
        return self.history

    # ------------------------------------------------------------------

    def _run_epoch(
        self, ep, total_ep, train_loader, val_loader, optimizer,
        train_criterion, val_criterion, scheduler=None, phase=2,
    ) -> float:
        t0 = time.perf_counter()
        train_loss, train_acc = _train_one_epoch(
            self.model, train_loader, optimizer, train_criterion,
            self.device, self.scaler, self.amp_enabled,
        )
        val_loss, val_acc = _evaluate(
            self.model, val_loader, val_criterion, self.device
        )
        if scheduler is not None:
            scheduler.step()

        self.history["train_loss"].append(train_loss)
        self.history["train_acc"].append(train_acc)
        self.history["val_loss"].append(val_loss)
        self.history["val_acc"].append(val_acc)

        elapsed = time.perf_counter() - t0
        logger.info(
            f"[P{phase}] Epoch {ep:03d}/{total_ep:03d} | "
            f"Train Loss {train_loss:.4f} | Train Acc {train_acc:.2f}% | "
            f"Val Loss {val_loss:.4f} | Val Acc {val_acc:.2f}% | "
            f"{elapsed:.1f}s"
        )
        return val_acc

    def _dump_history(self):
        with open(self.save_dir / "training_history.json", "w") as f:
            json.dump(self.history, f, indent=2)
