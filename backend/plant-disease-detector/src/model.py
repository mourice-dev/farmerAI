import torch
import torch.nn as nn
from torchvision import models
from torchvision.models import EfficientNet_B4_Weights


class EfficientNetB4Classifier(nn.Module):
    """EfficientNet-B4 with a custom two-layer classification head.

    Training strategy:
        Phase 1 — freeze backbone, train head only (fast convergence).
        Phase 2 — unfreeze all layers, fine-tune with differential LRs.
    """

    def __init__(
        self,
        num_classes: int = 38,
        dropout: float = 0.4,
        pretrained: bool = True,
    ):
        super().__init__()

        weights = EfficientNet_B4_Weights.IMAGENET1K_V1 if pretrained else None
        backbone = models.efficientnet_b4(weights=weights)

        # Keep features + avgpool; replace classifier
        self.features = backbone.features
        self.avgpool = backbone.avgpool

        self.classifier = nn.Sequential(
            nn.Dropout(p=dropout),
            nn.Linear(1792, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(p=dropout / 2),
            nn.Linear(512, num_classes),
        )
        self._init_classifier()

    # ------------------------------------------------------------------
    # Initialisation
    # ------------------------------------------------------------------

    def _init_classifier(self):
        """He init for the ReLU layer, small-variance init for the logit layer.

        Kaiming's gain assumes a ReLU follows the layer. The final Linear feeds
        a softmax, not a ReLU, so the same gain starts training with logits
        spread far wider than they should be -- a needlessly confident, badly
        calibrated model for the first epochs.
        """
        linears = [m for m in self.classifier.modules() if isinstance(m, nn.Linear)]
        for m in linears[:-1]:
            nn.init.kaiming_normal_(m.weight, mode="fan_out", nonlinearity="relu")
            nn.init.constant_(m.bias, 0)

        output_layer = linears[-1]
        nn.init.normal_(output_layer.weight, mean=0.0, std=0.01)
        nn.init.constant_(output_layer.bias, 0)

    # ------------------------------------------------------------------
    # Backbone freezing helpers
    # ------------------------------------------------------------------

    def freeze_backbone(self):
        for p in self.features.parameters():
            p.requires_grad = False

    def unfreeze_backbone(self):
        for p in self.features.parameters():
            p.requires_grad = True

    def unfreeze_last_n_stages(self, n: int = 3):
        """Unfreeze the last *n* EfficientNet feature stages."""
        stages = list(self.features.children())
        for stage in stages[-n:]:
            for p in stage.parameters():
                p.requires_grad = True

    # ------------------------------------------------------------------
    # Forward
    # ------------------------------------------------------------------

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        x = self.classifier(x)
        return x

    # ------------------------------------------------------------------
    # Utilities
    # ------------------------------------------------------------------

    def count_parameters(self, trainable_only: bool = True) -> int:
        return sum(
            p.numel() for p in self.parameters()
            if (not trainable_only or p.requires_grad)
        )

    @property
    def grad_cam_target_layer(self) -> nn.Module:
        """Last conv stage — standard Grad-CAM target for EfficientNet."""
        return self.features[-1]
