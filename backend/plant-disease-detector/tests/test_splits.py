"""Tests for the leakage-free split builder.

These guard the property the whole results section rests on: no augmented copy
of a validation or test leaf may appear in training.
"""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts.make_splits import (
    build_splits,
    is_original,
    representative,
    source_key,
    verify_no_leakage,
)


class TestSourceKey:

    @pytest.mark.parametrize("filename", [
        "00075aa8-d81a-4184-8541-b692b78d398a___FREC_Scab 3335.JPG",
        "00075aa8-d81a-4184-8541-b692b78d398a___FREC_Scab 3335_90deg.JPG",
        "00075aa8-d81a-4184-8541-b692b78d398a___FREC_Scab 3335_270deg.JPG",
        "00075aa8-d81a-4184-8541-b692b78d398a___FREC_Scab 3335_180deg.JPG",
        "00075aa8-d81a-4184-8541-b692b78d398a___FREC_Scab 3335_flipLR.JPG",
        "00075aa8-d81a-4184-8541-b692b78d398a___FREC_Scab 3335_flipTB.JPG",
        "00075aa8-d81a-4184-8541-b692b78d398a___FREC_Scab 3335_new30degFlipLR.JPG",
        "00075aa8-d81a-4184-8541-b692b78d398a___FREC_Scab 3335_new200degFlipTB.JPG",
        "00075aa8-d81a-4184-8541-b692b78d398a___FREC_Scab 3335_newPixel25.JPG",
        "00075aa8-d81a-4184-8541-b692b78d398a___FREC_Scab 3335_newGRR.JPG",
    ])
    def test_every_augmented_copy_collapses_to_one_key(self, filename):
        """This exact leaf is split across train/ and valid/ in the shipped
        Kaggle folders -- the concrete case the grouped split exists to stop."""
        expected = "00075aa8-d81a-4184-8541-b692b78d398a___FREC_Scab 3335"
        assert source_key(filename) == expected

    def test_distinct_leaves_keep_distinct_keys(self):
        a = source_key("01a66316-0e98-4d3b-a56f-d78752cd043f___FREC_Scab 3003.JPG")
        b = source_key("01f3deaa-6143-4b6c-9c22-620a46d8be04___FREC_Scab 3112.JPG")
        assert a != b

    def test_handles_the_class_with_no_uuid_prefix(self):
        """Corn common rust files are named "RS_Rust 1563.JPG" with no UUID."""
        assert source_key("RS_Rust 1563_flipLR.JPG") == "RS_Rust 1563"
        assert source_key("RS_Rust 1563.JPG") == "RS_Rust 1563"
        assert source_key("RS_Rust 1564.JPG") != source_key("RS_Rust 1563.JPG")

    def test_does_not_strip_digits_that_are_part_of_the_name(self):
        assert source_key("RS_Rust 1563.JPG").endswith("1563")

    def test_is_original_detects_augmentation_markers(self):
        assert is_original("uuid___Leaf 1.JPG")
        assert not is_original("uuid___Leaf 1_90deg.JPG")
        assert not is_original("uuid___Leaf 1_newPixel25.JPG")

    def test_representative_prefers_the_unaugmented_file(self):
        paths = [
            "train/C/uuid___Leaf 1_90deg.JPG",
            "train/C/uuid___Leaf 1.JPG",
            "train/C/uuid___Leaf 1_flipLR.JPG",
        ]
        assert representative(paths) == "train/C/uuid___Leaf 1.JPG"

    def test_representative_falls_back_deterministically(self):
        paths = ["train/C/uuid___Leaf 1_flipLR.JPG", "train/C/uuid___Leaf 1_90deg.JPG"]
        assert representative(paths) == representative(list(reversed(paths)))


def _fake_groups(n_classes=3, n_sources=40, copies=3):
    """class -> source key -> file paths, in the shape collect_groups returns."""
    groups = {}
    for c in range(n_classes):
        class_name = f"Class_{c}"
        # Source keys are unique across classes, as the dataset's UUIDs are.
        groups[class_name] = {
            f"uuid{c}-{s}___Leaf {s}": (
                [f"train/{class_name}/uuid{c}-{s}___Leaf {s}.JPG"]
                + [f"train/{class_name}/uuid{c}-{s}___Leaf {s}_{d}deg.JPG"
                   for d in (90, 180, 270)[:copies - 1]]
            )
            for s in range(n_sources)
        }
    return groups


class TestBuildSplits:

    def test_no_source_image_crosses_a_split(self):
        manifest, _ = build_splits(_fake_groups(), seed=42, val_frac=0.15, test_frac=0.15)
        verify_no_leakage(manifest)  # raises on overlap

    def test_verify_no_leakage_actually_catches_an_overlap(self):
        """A guard that cannot fail is not a guard."""
        leaky = {
            "train": ["train/C/uuid1___Leaf 1.JPG"],
            "val": ["train/C/uuid1___Leaf 1_90deg.JPG"],  # same leaf, rotated
            "test": [],
        }
        with pytest.raises(AssertionError, match="both train and val"):
            verify_no_leakage(leaky)

    def test_every_class_appears_in_every_split(self):
        _, per_class = build_splits(_fake_groups(), seed=42, val_frac=0.15, test_frac=0.15)
        for class_name, counts in per_class.items():
            for key in ("train_sources", "val_sources", "test_sources"):
                assert counts[key] > 0, f"{class_name} has no {key}"

    def test_val_and_test_hold_one_file_per_source_image(self):
        """Scoring several rotations of one leaf counts that leaf many times."""
        manifest, _ = build_splits(_fake_groups(), seed=42, val_frac=0.15, test_frac=0.15)
        for split in ("val", "test"):
            keys = [source_key(Path(p).name) for p in manifest[split]]
            assert len(keys) == len(set(keys)), f"{split} scores a leaf more than once"

    def test_train_keeps_every_augmented_copy(self):
        groups = _fake_groups(n_classes=1, n_sources=40, copies=3)
        _, per_class = build_splits(groups, seed=42, val_frac=0.15, test_frac=0.15)
        counts = per_class["Class_0"]
        assert counts["train_files"] == counts["train_sources"] * 3

    def test_split_is_deterministic_for_a_seed(self):
        a, _ = build_splits(_fake_groups(), seed=7, val_frac=0.15, test_frac=0.15)
        b, _ = build_splits(_fake_groups(), seed=7, val_frac=0.15, test_frac=0.15)
        assert a == b

    def test_different_seeds_give_different_splits(self):
        a, _ = build_splits(_fake_groups(), seed=1, val_frac=0.15, test_frac=0.15)
        b, _ = build_splits(_fake_groups(), seed=2, val_frac=0.15, test_frac=0.15)
        assert a["test"] != b["test"]

    def test_every_file_lands_in_exactly_one_split(self):
        groups = _fake_groups()
        manifest, _ = build_splits(groups, seed=42, val_frac=0.15, test_frac=0.15)
        placed = manifest["train"] + manifest["val"] + manifest["test"]
        assert len(placed) == len(set(placed))

    def test_a_class_too_small_to_split_raises(self):
        tiny = {"Class_0": {"uuid0___Leaf 0": ["train/Class_0/uuid0___Leaf 0.JPG"]}}
        with pytest.raises(ValueError, match="too few to split"):
            build_splits(tiny, seed=42, val_frac=0.15, test_frac=0.15)
