"""Unit tests for model architecture, Grad-CAM, and dataset utilities.

Run:
    pytest tests/ -v
"""

import sys
from pathlib import Path

import numpy as np
import pytest
import torch
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.dataset import CLASS_TO_IDX, CLASSES, get_transforms
from src.gradcam import GradCAM, explain
from src.model import EfficientNetB4Classifier

NUM_CLASSES = 38


# ------------------------------------------------------------------
# Fixtures
# ------------------------------------------------------------------

@pytest.fixture(scope="module")
def model_cpu():
    """EfficientNet-B4 classifier on CPU (no pretrained download needed for tests)."""
    return EfficientNetB4Classifier(num_classes=NUM_CLASSES, dropout=0.4, pretrained=False)


@pytest.fixture(scope="module")
def dummy_batch():
    """A batch of 4 random 224×224 images."""
    return torch.randn(4, 3, 224, 224)


@pytest.fixture(scope="module")
def dummy_image_tensor():
    return torch.randn(3, 224, 224)


# ------------------------------------------------------------------
# Model architecture tests
# ------------------------------------------------------------------

class TestEfficientNetB4Classifier:

    def test_output_shape_batch(self, model_cpu, dummy_batch):
        model_cpu.eval()
        with torch.no_grad():
            out = model_cpu(dummy_batch)
        assert out.shape == (4, NUM_CLASSES), f"Expected (4, {NUM_CLASSES}), got {out.shape}"

    def test_output_shape_single(self, model_cpu, dummy_image_tensor):
        model_cpu.eval()
        with torch.no_grad():
            out = model_cpu(dummy_image_tensor.unsqueeze(0))
        assert out.shape == (1, NUM_CLASSES)

    def test_softmax_sums_to_one(self, model_cpu, dummy_batch):
        model_cpu.eval()
        with torch.no_grad():
            logits = model_cpu(dummy_batch)
            probs = torch.softmax(logits, dim=1)
        assert torch.allclose(probs.sum(dim=1), torch.ones(4), atol=1e-5)

    def test_argmax_in_valid_range(self, model_cpu, dummy_batch):
        model_cpu.eval()
        with torch.no_grad():
            logits = model_cpu(dummy_batch)
            preds = logits.argmax(dim=1)
        assert preds.max().item() < NUM_CLASSES
        assert preds.min().item() >= 0

    def test_freeze_backbone_reduces_trainable_params(self, model_cpu):
        model_cpu.unfreeze_backbone()
        total_before = model_cpu.count_parameters(trainable_only=True)
        model_cpu.freeze_backbone()
        total_after = model_cpu.count_parameters(trainable_only=True)
        assert total_after < total_before, "Freezing backbone must reduce trainable params"

    def test_unfreeze_backbone_restores_all_params(self, model_cpu):
        model_cpu.unfreeze_backbone()
        trainable = model_cpu.count_parameters(trainable_only=True)
        total = model_cpu.count_parameters(trainable_only=False)
        assert trainable == total, "All params should be trainable after unfreezing"

    def test_grad_cam_target_layer_accessible(self, model_cpu):
        layer = model_cpu.grad_cam_target_layer
        assert isinstance(layer, torch.nn.Module)

    def test_count_parameters_reasonable(self, model_cpu):
        total = model_cpu.count_parameters(trainable_only=False)
        # EfficientNet-B4 ~19M + custom head ~1M
        assert 15_000_000 < total < 25_000_000, f"Unexpected param count: {total:,}"

    def test_output_layer_init_is_not_relu_gained(self, model_cpu):
        """The final Linear feeds a softmax, not a ReLU.

        He initialisation with a ReLU gain there starts training with logits
        spread wide enough that an untrained 38-class model assigns ~34% to its
        top guess. A small-variance init starts it near the 1/38 = 2.6% prior.
        """
        linears = [m for m in model_cpu.classifier.modules()
                   if isinstance(m, torch.nn.Linear)]
        hidden_layer, output_layer = linears[0], linears[-1]
        assert output_layer.weight.std().item() < 0.02
        assert output_layer.weight.std().item() < hidden_layer.weight.std().item()
        assert torch.all(output_layer.bias == 0)

    def test_unfreeze_last_n_stages(self, model_cpu):
        model_cpu.freeze_backbone()
        frozen_count = model_cpu.count_parameters(trainable_only=True)
        model_cpu.unfreeze_last_n_stages(n=3)
        partial_count = model_cpu.count_parameters(trainable_only=True)
        assert partial_count > frozen_count, "Unfreezing stages should increase trainable params"
        model_cpu.unfreeze_backbone()  # restore


# ------------------------------------------------------------------
# Grad-CAM tests
# ------------------------------------------------------------------

class TestGradCAM:

    def test_cam_shape_matches_input(self, model_cpu, dummy_image_tensor):
        model_cpu.unfreeze_backbone()
        model_cpu.eval()
        gradcam = GradCAM(model_cpu, model_cpu.grad_cam_target_layer)
        cam, _, _ = gradcam.generate(dummy_image_tensor)
        gradcam.remove_hooks()
        assert cam.shape == (224, 224), f"Expected (224, 224), got {cam.shape}"

    def test_cam_is_peak_normalised(self, model_cpu, dummy_image_tensor):
        """The map must actually reach 1.0, not merely stay inside [0, 1].

        The previous `+ 1e-8` epsilon was absolute. On a freshly initialised
        EfficientNet the raw CAM peaks around 1e-14, so the epsilon dominated
        the denominator and the "normalised" map came out at ~1e-6: a heatmap
        that renders as a uniform black square. The old assertion -- min >= 0
        and max <= 1 -- passed on that, and would pass on all zeros.
        """
        model_cpu.unfreeze_backbone()
        model_cpu.eval()
        gradcam = GradCAM(model_cpu, model_cpu.grad_cam_target_layer)
        cam, _, _ = gradcam.generate(dummy_image_tensor)
        gradcam.remove_hooks()
        assert cam.min() >= 0.0
        assert cam.max() == pytest.approx(1.0), (
            f"CAM peak is {cam.max():.3g}; normalisation did not reach 1.0"
        )

    def test_works_with_a_frozen_backbone(self, model_cpu, dummy_image_tensor):
        """Phase-1 training freezes the backbone. With no parameter requiring
        grad and an input that does not either, the backward hook never fired
        and the CAM computation raised
        `AttributeError: 'NoneType' object has no attribute 'mean'`."""
        model_cpu.freeze_backbone()
        model_cpu.eval()
        gradcam = GradCAM(model_cpu, model_cpu.grad_cam_target_layer)
        try:
            cam, pred, probs = gradcam.generate(dummy_image_tensor)
        finally:
            gradcam.remove_hooks()
            model_cpu.unfreeze_backbone()
        assert cam.shape == (224, 224)
        assert cam.max() == pytest.approx(1.0)
        assert 0 <= pred < NUM_CLASSES
        assert probs.shape == (NUM_CLASSES,)

    def test_does_not_leave_the_input_tensor_mutated(self, model_cpu, dummy_image_tensor):
        """`requires_grad_` is applied to a clone, not the caller's tensor."""
        model_cpu.eval()
        before = dummy_image_tensor.clone()
        gradcam = GradCAM(model_cpu, model_cpu.grad_cam_target_layer)
        gradcam.generate(dummy_image_tensor)
        gradcam.remove_hooks()
        assert dummy_image_tensor.requires_grad is False
        assert torch.equal(dummy_image_tensor, before)

    def test_returns_probabilities_from_the_same_forward_pass(self, model_cpu,
                                                              dummy_image_tensor):
        """Callers reuse these instead of running inference a second time."""
        model_cpu.eval()
        gradcam = GradCAM(model_cpu, model_cpu.grad_cam_target_layer)
        _, _, probs = gradcam.generate(dummy_image_tensor)
        gradcam.remove_hooks()
        with torch.no_grad():
            expected = torch.softmax(
                model_cpu(dummy_image_tensor.unsqueeze(0)), dim=1
            )[0].numpy()
        assert probs.shape == (NUM_CLASSES,)
        assert probs.sum() == pytest.approx(1.0, abs=1e-5)
        assert probs == pytest.approx(expected, abs=1e-5)

    def test_cam_pred_class_valid(self, model_cpu, dummy_image_tensor):
        model_cpu.eval()
        gradcam = GradCAM(model_cpu, model_cpu.grad_cam_target_layer)
        _, pred, _ = gradcam.generate(dummy_image_tensor)
        gradcam.remove_hooks()
        assert 0 <= pred < NUM_CLASSES, f"Predicted class must be in [0, {NUM_CLASSES}), got {pred}"

    def test_cam_dtype_is_float32(self, model_cpu, dummy_image_tensor):
        model_cpu.eval()
        gradcam = GradCAM(model_cpu, model_cpu.grad_cam_target_layer)
        cam, _, _ = gradcam.generate(dummy_image_tensor)
        gradcam.remove_hooks()
        assert cam.dtype == np.float32

    def test_overlay_shape_and_dtype(self, model_cpu, dummy_image_tensor):
        model_cpu.eval()
        gradcam = GradCAM(model_cpu, model_cpu.grad_cam_target_layer)
        cam, _, _ = gradcam.generate(dummy_image_tensor)
        gradcam.remove_hooks()

        img = dummy_image_tensor.permute(1, 2, 0).numpy()
        img = (img - img.min()) / (img.max() - img.min() + 1e-8)

        overlay = GradCAM.overlay(cam, img, alpha=0.4)
        assert overlay.shape == (224, 224, 3)
        assert overlay.dtype == np.uint8

    def test_class_idx_override(self, model_cpu, dummy_image_tensor):
        """Grad-CAM must accept an explicit class index."""
        model_cpu.eval()
        gradcam = GradCAM(model_cpu, model_cpu.grad_cam_target_layer)
        cam, pred, _ = gradcam.generate(dummy_image_tensor, class_idx=0)
        gradcam.remove_hooks()
        assert pred == 0
        assert cam.shape == (224, 224)

    def test_explain_returns_cam_image_class_and_probs(self, model_cpu, dummy_image_tensor):
        model_cpu.eval()
        cam, img_np, pred, probs = explain(model_cpu, dummy_image_tensor,
                                           torch.device("cpu"))
        assert cam.shape == (224, 224)
        assert img_np.shape == (224, 224, 3)
        assert 0.0 <= img_np.min() and img_np.max() <= 1.0
        assert 0 <= pred < NUM_CLASSES
        assert probs.shape == (NUM_CLASSES,)


# ------------------------------------------------------------------
# Dataset / transform tests
# ------------------------------------------------------------------

class TestClasses:

    def test_class_count(self):
        assert len(CLASSES) == NUM_CLASSES

    def test_class_to_idx_consistent(self):
        assert len(CLASS_TO_IDX) == NUM_CLASSES
        for i, cls in enumerate(CLASSES):
            assert CLASS_TO_IDX[cls] == i

    def test_all_classes_have_triple_underscore(self):
        for cls in CLASSES:
            assert "___" in cls, f"Class '{cls}' missing '___' separator"

    def test_healthy_classes_present(self):
        healthy = [c for c in CLASSES if "healthy" in c.lower()]
        assert len(healthy) > 0, "Expected at least one healthy class"

    def test_tomato_classes_present(self):
        tomato = [c for c in CLASSES if c.startswith("Tomato")]
        assert len(tomato) >= 9, "Expected at least 9 Tomato classes"


class TestTransforms:

    def test_train_output_shape(self):
        transform = get_transforms("train", img_size=224)
        img = Image.fromarray(np.random.randint(0, 255, (300, 300, 3), dtype=np.uint8))
        tensor = transform(img)
        assert tensor.shape == (3, 224, 224)

    def test_val_output_shape(self):
        transform = get_transforms("val", img_size=224)
        img = Image.fromarray(np.random.randint(0, 255, (400, 400, 3), dtype=np.uint8))
        tensor = transform(img)
        assert tensor.shape == (3, 224, 224)

    def test_transforms_return_float_tensor(self):
        transform = get_transforms("val", img_size=224)
        img = Image.fromarray(np.zeros((224, 224, 3), dtype=np.uint8))
        tensor = transform(img)
        assert tensor.dtype == torch.float32

    def test_normalisation_centres_around_zero(self):
        transform = get_transforms("val")
        img = Image.fromarray(
            (np.random.rand(224, 224, 3) * 255).astype(np.uint8)
        )
        tensor = transform(img)
        # After ImageNet normalisation values are typically in [-2.5, 2.5]
        assert tensor.min() < 0, "Normalised tensor should have negative values"
        assert tensor.max() > 0, "Normalised tensor should have positive values"

    def test_train_and_val_same_output_channels(self):
        train_t = get_transforms("train")
        val_t   = get_transforms("val")
        img = Image.fromarray(np.random.randint(0, 255, (256, 256, 3), dtype=np.uint8))
        assert train_t(img).shape[0] == val_t(img).shape[0] == 3
