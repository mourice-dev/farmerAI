"""Tests for PlantVillageDataset, class-balance helpers, and preprocessing."""

import json
import sys
from pathlib import Path

import numpy as np
import pytest
import torch
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.dataset import (
    CLASSES,
    PlantVillageDataset,
    get_dataloaders,
    get_transforms,
    prepare_input_image,
)

# A handful of real classes, with deliberately uneven counts so the weighting
# helpers have something to correct.
FIXTURE_COUNTS = {
    "Apple___Apple_scab": 6,
    "Apple___healthy": 3,
    "Tomato___Late_blight": 1,
}


def _write_image(path: Path, size=(32, 32)):
    path.parent.mkdir(parents=True, exist_ok=True)
    array = np.random.randint(0, 255, (*size, 3), dtype=np.uint8)
    Image.fromarray(array).save(path, format="JPEG")


@pytest.fixture
def tiny_dataset_root(tmp_path):
    """A miniature train/valid tree in the raw Kaggle folder layout."""
    for split in ("train", "valid"):
        for class_name, count in FIXTURE_COUNTS.items():
            n = count if split == "train" else 1
            for i in range(n):
                _write_image(tmp_path / split / class_name / f"{class_name}_{i}.jpg")
    return tmp_path


class TestFolderMode:

    def test_loads_every_image(self, tiny_dataset_root):
        ds = PlantVillageDataset(tiny_dataset_root, split="train")
        assert len(ds) == sum(FIXTURE_COUNTS.values())

    def test_labels_match_the_canonical_index(self, tiny_dataset_root):
        ds = PlantVillageDataset(tiny_dataset_root, split="train")
        for path, label in ds.samples:
            assert CLASSES[label] == Path(path).parent.name

    def test_getitem_returns_image_and_label(self, tiny_dataset_root):
        ds = PlantVillageDataset(
            tiny_dataset_root, split="train", transform=get_transforms("val")
        )
        image, label = ds[0]
        assert image.shape == (3, 224, 224)
        assert isinstance(label, int)

    def test_ignores_directories_that_are_not_known_classes(self, tiny_dataset_root):
        _write_image(tiny_dataset_root / "train" / "Not_A_Class" / "x.jpg")
        ds = PlantVillageDataset(tiny_dataset_root, split="train")
        assert len(ds) == sum(FIXTURE_COUNTS.values())

    def test_does_not_double_count_case_variant_suffixes(self, tiny_dataset_root):
        """`glob("*.jpg") + glob("*.JPG")` returns each file twice on Windows
        and macOS. The loader iterates once and filters by suffix instead."""
        class_dir = tiny_dataset_root / "train" / "Apple___healthy"
        _write_image(class_dir / "upper.JPG")
        ds = PlantVillageDataset(tiny_dataset_root, split="train")
        paths = [p for p, _ in ds.samples]
        assert len(paths) == len(set(paths))
        assert len(ds) == sum(FIXTURE_COUNTS.values()) + 1

    def test_missing_split_raises(self, tiny_dataset_root):
        with pytest.raises(FileNotFoundError, match="Split directory not found"):
            PlantVillageDataset(tiny_dataset_root, split="test")


class TestManifestMode:

    def test_reads_paths_from_a_manifest(self, tiny_dataset_root):
        manifest = {
            "splits": {
                "train": ["train/Apple___Apple_scab/Apple___Apple_scab_0.jpg"],
                "val": ["valid/Apple___healthy/Apple___healthy_0.jpg"],
                "test": ["valid/Tomato___Late_blight/Tomato___Late_blight_0.jpg"],
            }
        }
        for split, expected_class in (
            ("train", "Apple___Apple_scab"),
            ("val", "Apple___healthy"),
            ("test", "Tomato___Late_blight"),
        ):
            ds = PlantVillageDataset(tiny_dataset_root, split=split, manifest=manifest)
            assert len(ds) == 1
            assert CLASSES[ds.targets[0]] == expected_class

    def test_test_split_is_reachable(self, tiny_dataset_root):
        """There was no held-out test path in the codebase at all."""
        manifest = {"splits": {"test": ["valid/Apple___healthy/Apple___healthy_0.jpg"]}}
        ds = PlantVillageDataset(tiny_dataset_root, split="test", manifest=manifest)
        assert ds.split == "test"

    def test_valid_is_an_alias_for_val(self, tiny_dataset_root):
        manifest = {"splits": {"val": ["valid/Apple___healthy/Apple___healthy_0.jpg"]}}
        ds = PlantVillageDataset(tiny_dataset_root, split="valid", manifest=manifest)
        assert ds.split == "val" and len(ds) == 1

    def test_manifest_can_be_a_file(self, tiny_dataset_root, tmp_path):
        manifest_path = tmp_path / "splits.json"
        manifest_path.write_text(json.dumps(
            {"splits": {"val": ["valid/Apple___healthy/Apple___healthy_0.jpg"]}}
        ))
        ds = PlantVillageDataset(tiny_dataset_root, split="val", manifest=manifest_path)
        assert len(ds) == 1

    def test_missing_manifest_file_raises_with_the_fix(self, tiny_dataset_root, tmp_path):
        with pytest.raises(FileNotFoundError, match="make_splits"):
            PlantVillageDataset(
                tiny_dataset_root, split="val", manifest=tmp_path / "absent.json"
            )

    def test_unknown_split_lists_what_is_available(self, tiny_dataset_root):
        with pytest.raises(KeyError, match="train"):
            PlantVillageDataset(
                tiny_dataset_root, split="holdout",
                manifest={"splits": {"train": ["train/Apple___healthy/x.jpg"]}},
            )


class TestClassBalanceHelpers:

    def test_class_weights_are_inverse_to_frequency(self, tiny_dataset_root):
        ds = PlantVillageDataset(tiny_dataset_root, split="train")
        weights = ds.get_class_weights()
        scab = CLASSES.index("Apple___Apple_scab")      # 6 images
        healthy = CLASSES.index("Apple___healthy")      # 3 images
        blight = CLASSES.index("Tomato___Late_blight")  # 1 image
        assert weights[blight] > weights[healthy] > weights[scab]

    def test_class_weights_shape_and_positivity(self, tiny_dataset_root):
        weights = PlantVillageDataset(tiny_dataset_root, split="train").get_class_weights()
        assert weights.shape == (len(CLASSES),)
        assert torch.all(weights > 0), "Absent classes must not produce zero or inf"

    def test_absent_classes_do_not_divide_by_zero(self, tiny_dataset_root):
        weights = PlantVillageDataset(tiny_dataset_root, split="train").get_class_weights()
        assert torch.isfinite(weights).all()

    def test_sample_weights_align_with_targets(self, tiny_dataset_root):
        ds = PlantVillageDataset(tiny_dataset_root, split="train")
        class_weights = ds.get_class_weights()
        sample_weights = ds.get_sample_weights()
        assert len(sample_weights) == len(ds)
        for weight, target in zip(sample_weights, ds.targets, strict=True):
            assert weight == pytest.approx(float(class_weights[target]))

    def test_class_distribution_counts(self, tiny_dataset_root):
        dist = PlantVillageDataset(tiny_dataset_root, split="train").class_distribution()
        assert dist == FIXTURE_COUNTS


class TestGetDataloaders:

    def test_builds_only_the_requested_splits(self, tiny_dataset_root):
        """Evaluating one split must not construct the training set."""
        manifest = {
            "splits": {
                "train": ["train/Apple___Apple_scab/Apple___Apple_scab_0.jpg"],
                "test": ["valid/Apple___healthy/Apple___healthy_0.jpg"],
            }
        }
        loaders, datasets = get_dataloaders(
            tiny_dataset_root, batch_size=1, num_workers=0,
            splits=("test",), manifest=manifest,
        )
        assert set(loaders) == {"test"} == set(datasets)

    def test_train_loader_shuffles_and_eval_loaders_do_not(self, tiny_dataset_root):
        manifest = {
            "splits": {
                "train": [f"train/Apple___Apple_scab/Apple___Apple_scab_{i}.jpg"
                          for i in range(6)],
                "test": ["valid/Apple___healthy/Apple___healthy_0.jpg"],
            }
        }
        loaders, _ = get_dataloaders(
            tiny_dataset_root, batch_size=2, num_workers=0,
            splits=("train", "test"), manifest=manifest,
        )
        assert isinstance(loaders["train"].sampler, torch.utils.data.RandomSampler)
        assert isinstance(loaders["test"].sampler, torch.utils.data.SequentialSampler)


class TestPrepareInputImage:

    @pytest.mark.parametrize("size", [(640, 480), (480, 640), (224, 224), (100, 900)])
    def test_always_returns_the_model_input_square(self, size):
        image = Image.fromarray(
            np.random.randint(0, 255, (size[1], size[0], 3), dtype=np.uint8)
        )
        assert prepare_input_image(image).size == (224, 224)

    def test_does_not_squash_a_wide_image(self):
        """A plain Resize((224, 224)) distorts geometry; scale-and-crop must not.

        A circle in a 400x100 frame stays a circle under a centre crop and
        becomes an ellipse under an anisotropic resize.
        """
        canvas = Image.new("L", (400, 100), 0)
        ImageDraw.Draw(canvas).ellipse((160, 10, 240, 90), fill=255)

        def bbox_aspect(img):
            ys, xs = np.nonzero(np.array(img) > 127)
            return (xs.max() - xs.min() + 1) / (ys.max() - ys.min() + 1)

        fitted = prepare_input_image(canvas.convert("RGB")).convert("L")
        squashed = canvas.resize((224, 224), Image.BICUBIC)

        assert bbox_aspect(fitted) == pytest.approx(1.0, abs=0.05), (
            "centre crop should keep the circle circular"
        )
        assert bbox_aspect(squashed) < 0.7, "sanity: a plain resize does distort"

    def test_preserves_a_square_image_unchanged_in_shape(self):
        array = np.random.randint(0, 255, (256, 256, 3), dtype=np.uint8)
        assert prepare_input_image(Image.fromarray(array)).size == (224, 224)
