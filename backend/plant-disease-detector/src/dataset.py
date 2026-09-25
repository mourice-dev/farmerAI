import json
from pathlib import Path

import numpy as np
import torch
from PIL import Image, ImageOps
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms

# Canonical 38 PlantVillage classes (alphabetical - matches directory sort order)
CLASSES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]

CLASS_TO_IDX = {cls: i for i, cls in enumerate(CLASSES)}

IMAGE_SUFFIXES = (".jpg", ".jpeg", ".png")

DEFAULT_MANIFEST = "data/splits.json"

# The manifest names its splits train/val/test. "valid" is accepted as an alias
# because that is what the Kaggle folder is called.
_SPLIT_ALIASES = {"valid": "val", "validation": "val"}


class PlantVillageDataset(Dataset):
    """PlantVillage plant disease dataset.

    Two ways to address the data:

    Manifest mode (preferred) -- `manifest` points at the JSON written by
    `scripts/make_splits.py`, which lists the files in each of train/val/test.
    The manifest split is grouped by source image, so no augmented copy of a
    validation or test leaf appears in training.

    Folder mode -- `manifest=None` reads `root_dir/<split>/<class>/*.jpg`
    directly. This is the raw Kaggle layout, whose shipped train/valid folders
    share source images; see `scripts/make_splits.py` for the measurement.
    """

    CLASSES = CLASSES
    CLASS_TO_IDX = CLASS_TO_IDX

    def __init__(
        self,
        root_dir: str,
        split: str = "train",
        transform=None,
        manifest: str | Path | dict | None = None,
    ):
        self.root_dir = Path(root_dir)
        self.split = _SPLIT_ALIASES.get(split, split)
        self.transform = transform
        self.samples: list[tuple[str, int]] = []
        self.targets: list[int] = []

        if manifest is not None:
            self._load_from_manifest(manifest)
        else:
            self._load_from_folders(split)

        if not self.samples:
            raise FileNotFoundError(
                f"No images found for split '{self.split}' under {self.root_dir}. "
                "Run `python scripts/download_data.py` then "
                "`python scripts/make_splits.py`."
            )

    # ------------------------------------------------------------------
    # Loading
    # ------------------------------------------------------------------

    def _load_from_manifest(self, manifest):
        if isinstance(manifest, dict):
            payload = manifest
        else:
            manifest_path = Path(manifest)
            if not manifest_path.exists():
                raise FileNotFoundError(
                    f"Split manifest not found: {manifest_path}\n"
                    "Build it with `python scripts/make_splits.py`."
                )
            with open(manifest_path) as f:
                payload = json.load(f)

        splits = payload.get("splits", payload)
        if self.split not in splits:
            raise KeyError(
                f"Split '{self.split}' not in manifest. "
                f"Available: {sorted(splits)}"
            )

        for rel_path in splits[self.split]:
            class_name = Path(rel_path).parent.name
            label = self.CLASS_TO_IDX.get(class_name)
            if label is None:
                continue
            self.samples.append((str(self.root_dir / rel_path), label))
            self.targets.append(label)

    def _load_from_folders(self, split: str):
        split_dir = self.root_dir / split
        if not split_dir.exists():
            raise FileNotFoundError(
                f"Split directory not found: {split_dir}\n"
                "Run `python scripts/download_data.py` first."
            )

        for class_dir in sorted(p for p in split_dir.iterdir() if p.is_dir()):
            label = self.CLASS_TO_IDX.get(class_dir.name)
            if label is None:
                continue
            # Iterate once and filter by suffix: globbing "*.jpg" and "*.JPG"
            # separately double-counts on case-insensitive filesystems.
            for img_path in sorted(class_dir.iterdir()):
                if img_path.is_file() and img_path.suffix.lower() in IMAGE_SUFFIXES:
                    self.samples.append((str(img_path), label))
                    self.targets.append(label)

    # ------------------------------------------------------------------
    # Dataset protocol
    # ------------------------------------------------------------------

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int):
        img_path, label = self.samples[idx]
        image = Image.open(img_path).convert("RGB")
        if self.transform:
            image = self.transform(image)
        return image, label

    # ------------------------------------------------------------------
    # Class-balance helpers
    # ------------------------------------------------------------------

    def get_class_weights(self) -> torch.FloatTensor:
        counts = np.bincount(self.targets, minlength=len(self.CLASSES))
        counts = np.where(counts == 0, 1, counts)  # avoid division by zero
        total = len(self.targets)
        weights = total / (len(self.CLASSES) * counts.astype(float))
        return torch.FloatTensor(weights)

    def get_sample_weights(self) -> list[float]:
        class_weights = self.get_class_weights()
        return [float(class_weights[t]) for t in self.targets]

    def class_distribution(self) -> dict:
        counts = np.bincount(self.targets, minlength=len(self.CLASSES))
        return {cls: int(counts[i]) for i, cls in enumerate(self.CLASSES) if counts[i] > 0}


def get_transforms(split: str, img_size: int = 224) -> transforms.Compose:
    mean = [0.485, 0.456, 0.406]
    std = [0.229, 0.224, 0.225]

    if split == "train":
        return transforms.Compose([
            transforms.Resize((img_size + 32, img_size + 32)),
            transforms.RandomCrop(img_size),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomVerticalFlip(p=0.1),
            transforms.RandomRotation(degrees=30),
            transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.05),
            transforms.RandomPerspective(distortion_scale=0.2, p=0.3),
            transforms.ToTensor(),
            transforms.Normalize(mean=mean, std=std),
        ])
    return transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=mean, std=std),
    ])


def prepare_input_image(image: Image.Image, img_size: int = 224) -> Image.Image:
    """Fit a user-supplied photo to the model's input square without distorting it.

    Every training image is square (PlantVillage ships 256x256), so the val
    transform's `Resize((224, 224))` never changes an aspect ratio during
    training or evaluation. Applied to a 4:3 phone photo it squashes the leaf
    into a shape the model has never seen. Scaling the short side and centre
    cropping keeps leaf geometry intact, which is what the model was trained on.
    """
    return ImageOps.fit(image, (img_size, img_size), method=Image.BICUBIC)


def get_dataloaders(
    data_dir: str,
    batch_size: int = 32,
    img_size: int = 224,
    num_workers: int = 4,
    splits: tuple[str, ...] = ("train", "val"),
    manifest: str | Path | dict | None = DEFAULT_MANIFEST,
) -> tuple[dict, dict]:
    """Build loaders for *only* the requested splits.

    Evaluation asks for one split; building the 60k-image training set to score
    the test set would be pure waste, and would fail on a machine that only has
    the evaluation data.
    """
    datasets = {}
    loaders = {}

    for split in splits:
        canonical = _SPLIT_ALIASES.get(split, split)
        transform_kind = "train" if canonical == "train" else "val"
        dataset = PlantVillageDataset(
            root_dir=data_dir,
            split=canonical,
            transform=get_transforms(transform_kind, img_size),
            manifest=manifest,
        )
        datasets[split] = dataset
        loaders[split] = DataLoader(
            dataset,
            batch_size=batch_size,
            shuffle=(canonical == "train"),
            num_workers=num_workers,
            pin_memory=True,
        )

    return loaders, datasets
