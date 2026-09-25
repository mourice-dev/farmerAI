"""Gradient-weighted Class Activation Mapping (Grad-CAM).

Reference: Selvaraju et al., "Grad-CAM: Visual Explanations from Deep Networks
           via Gradient-based Localization", ICCV 2017.
"""

import cv2
import numpy as np
import torch
import torch.nn.functional as F


class GradCAM:
    """Attach forward/backward hooks to a target layer and compute Grad-CAM maps."""

    def __init__(self, model: torch.nn.Module, target_layer: torch.nn.Module):
        self.model = model
        self._activations: torch.Tensor | None = None
        self._gradients: torch.Tensor | None = None

        self._fwd_handle = target_layer.register_forward_hook(self._fwd_hook)
        self._bwd_handle = target_layer.register_full_backward_hook(self._bwd_hook)

    # ------------------------------------------------------------------
    # Hooks
    # ------------------------------------------------------------------

    def _fwd_hook(self, _module, _input, output):
        self._activations = output.detach()

    def _bwd_hook(self, _module, _grad_in, grad_out):
        self._gradients = grad_out[0].detach()

    # ------------------------------------------------------------------
    # Grad-CAM computation
    # ------------------------------------------------------------------

    def generate(
        self,
        input_tensor: torch.Tensor,
        class_idx: int | None = None,
    ) -> tuple[np.ndarray, int, np.ndarray]:
        """Compute a Grad-CAM map for one image.

        Returns:
            cam:        (H, W) float32 array, peak-normalised to [0, 1].
            class_idx:  The class the map explains.
            probs:      (num_classes,) float32 softmax over the same forward
                        pass. Returned so callers do not run inference twice.
        """
        self.model.eval()

        if input_tensor.dim() == 3:
            input_tensor = input_tensor.unsqueeze(0)

        # The backward hook only fires if something upstream of the target
        # layer requires grad. With the backbone frozen (phase-1 training, or a
        # caller that froze it) no parameter does, so the input has to carry
        # the requirement itself -- otherwise no graph is built, the hook never
        # runs, and _gradients stays None.
        input_tensor = input_tensor.clone().detach().requires_grad_(True)

        self._activations = None
        self._gradients = None

        output = self.model(input_tensor)
        probs = torch.softmax(output, dim=1).detach()[0].cpu().numpy().astype(np.float32)

        if class_idx is None:
            class_idx = int(output.argmax(dim=1))

        self.model.zero_grad()
        one_hot = torch.zeros_like(output)
        one_hot[0, class_idx] = 1.0
        output.backward(gradient=one_hot, retain_graph=True)

        if self._gradients is None or self._activations is None:
            raise RuntimeError(
                "Grad-CAM captured no gradients at the target layer. The layer "
                "is detached from the graph -- check that it is part of the "
                "forward pass and that the model was not wrapped in no_grad()."
            )

        # alpha_k = global-average-pool of gradients for channel k
        weights = self._gradients.mean(dim=(2, 3), keepdim=True)
        cam = (weights * self._activations).sum(dim=1, keepdim=True)
        cam = F.relu(cam)
        cam = F.interpolate(
            cam, size=input_tensor.shape[2:], mode="bilinear", align_corners=False
        )
        cam = cam.squeeze().cpu().numpy()

        # Peak-normalise by dividing by the actual range rather than adding a
        # fixed 1e-8. Raw CAM magnitudes are arbitrary -- on an untrained model
        # the whole map lands around 1e-14, where an absolute epsilon dominates
        # the denominator and silently rescales the output to ~1e-6: a heatmap
        # that renders as a uniform black square while still satisfying a
        # "values are within [0, 1]" check.
        cam = cam - cam.min()
        peak = float(cam.max())
        if peak > np.finfo(np.float32).tiny:
            cam = cam / peak
        else:
            # Genuinely no positive gradient signal anywhere. A flat map is the
            # honest answer; dividing here would amplify denormal noise.
            cam = np.zeros_like(cam)

        return cam.astype(np.float32), class_idx, probs

    # ------------------------------------------------------------------
    # Visualisation helpers
    # ------------------------------------------------------------------

    @staticmethod
    def overlay(
        cam: np.ndarray,
        image_rgb: np.ndarray,
        alpha: float = 0.4,
    ) -> np.ndarray:
        """Blend a Grad-CAM heatmap with the original image.

        Args:
            cam:       Normalised (H, W) array in [0, 1].
            image_rgb: (H, W, 3) uint8 or float32 in [0, 1].
            alpha:     Heatmap opacity.

        Returns:
            (H, W, 3) uint8 blended image.
        """
        heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
        heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0

        if image_rgb.max() > 1.0:
            image_rgb = image_rgb.astype(np.float32) / 255.0

        blended = np.clip(heatmap * alpha + image_rgb * (1 - alpha), 0, 1)
        return (blended * 255).astype(np.uint8)

    def remove_hooks(self):
        self._fwd_handle.remove()
        self._bwd_handle.remove()


# ------------------------------------------------------------------
# Convenience function
# ------------------------------------------------------------------

def explain(
    model: torch.nn.Module,
    image_tensor: torch.Tensor,
    device: torch.device,
) -> tuple[np.ndarray, np.ndarray, int, np.ndarray]:
    """Run Grad-CAM once and return everything a caller needs.

    Args:
        model:        EfficientNetB4Classifier (must have .grad_cam_target_layer).
        image_tensor: (C, H, W) normalised tensor.
        device:       Target device.

    Returns:
        cam:        (H, W) float32 in [0, 1].
        image_np:   (H, W, 3) float32 in [0, 1] -- denormalised for display.
        pred_class: Predicted class index.
        probs:      (num_classes,) float32 softmax from the same forward pass.
    """
    _MEAN = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
    _STD = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)

    gradcam = GradCAM(model, model.grad_cam_target_layer)
    try:
        cam, pred_class, probs = gradcam.generate(image_tensor.to(device))
    finally:
        gradcam.remove_hooks()

    img_np = image_tensor.cpu() * _STD + _MEAN
    img_np = img_np.permute(1, 2, 0).numpy().clip(0, 1)
    return cam, img_np, pred_class, probs
