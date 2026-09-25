"""Build a leakage-free train/val/test split manifest.

Why this exists
---------------
The Kaggle build of PlantVillage (`new-plant-diseases-dataset`) ships a
`train/` and a `valid/` folder that are an 80/20 split of the *already
augmented* image pool. Augmentation happened before the split, so rotated and
flipped copies of the same physical leaf land on both sides of it:

    train/Apple___Apple_scab/00075aa8-...___FREC_Scab 3335.JPG
    valid/Apple___Apple_scab/00075aa8-...___FREC_Scab 3335_90deg.JPG

Measured on the shipped folders, 9,066 of the 14,732 distinct source images in
`valid/` (61.5%) also appear in `train/`, and 7 of the 38 classes have no clean
validation images at all. A model selected on that split is being scored on
rotations of its own training data.

What this script does
---------------------
Groups every file by the source image it was derived from, then splits the
*groups* -- never the files -- into train/val/test. No augmented copy of a
validation or test leaf can appear in training.

Validation and test take one representative file per group (the un-augmented
original where one exists), so a single leaf is scored once rather than up to
fifteen times. Training keeps every augmented copy of its own groups.

Usage
-----
    python scripts/make_splits.py
    python scripts/make_splits.py --data-dir data/plantvillage --seed 42
"""

import argparse
import json
import random
import re
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.dataset import CLASSES

IMAGE_SUFFIXES = (".jpg", ".jpeg", ".png")

# Augmentation markers used by the Kaggle build, e.g. "_90deg", "_flipLR",
# "_new30degFlipTB", "_newPixel25", "_newGRR". Stripping the marker leaves the
# identity of the source leaf.
AUG_SUFFIX_RE = re.compile(
    r"_(?:new\d+degFlip(?:LR|TB)|\d+deg|flipLR|flipTB|newPixel\d+|newGRR)$"
)


def source_key(filename: str) -> str:
    """Return the identity of the source leaf a file was derived from.

    Strips the augmentation marker from the stem, so every copy of one leaf
    collapses to a single key while distinct leaves keep distinct keys.
    """
    return AUG_SUFFIX_RE.sub("", Path(filename).stem)


def is_original(filename: str) -> bool:
    """True if the file carries no augmentation marker."""
    return AUG_SUFFIX_RE.search(Path(filename).stem) is None


def collect_groups(data_dir: Path, source_splits=("train", "valid")) -> dict:
    """Map class -> source key -> list of paths relative to *data_dir*."""
    groups: dict[str, dict[str, list[str]]] = defaultdict(lambda: defaultdict(list))
    found_any = False

    for split in source_splits:
        split_dir = data_dir / split
        if not split_dir.exists():
            continue
        found_any = True
        for class_dir in sorted(split_dir.iterdir()):
            if not class_dir.is_dir() or class_dir.name not in CLASSES:
                continue
            # Iterate once and filter by suffix: globbing "*.jpg" and "*.JPG"
            # separately double-counts on case-insensitive filesystems.
            for path in sorted(class_dir.iterdir()):
                if path.is_file() and path.suffix.lower() in IMAGE_SUFFIXES:
                    rel = f"{split}/{class_dir.name}/{path.name}"
                    groups[class_dir.name][source_key(path.name)].append(rel)

    if not found_any:
        raise FileNotFoundError(
            f"No source splits found under {data_dir}. "
            "Run `python scripts/download_data.py` first."
        )
    return groups


def representative(paths: list[str]) -> str:
    """Pick one file to stand for a source leaf: the original if present."""
    originals = [p for p in paths if is_original(p)]
    return sorted(originals or paths)[0]


def build_splits(
    groups: dict, seed: int, val_frac: float, test_frac: float
) -> tuple[dict, dict]:
    """Split source groups per class, then expand the groups to file lists."""
    rng = random.Random(seed)
    manifest: dict[str, list[str]] = {"train": [], "val": [], "test": []}
    per_class = {}

    for class_name in sorted(groups):
        keys = sorted(groups[class_name])
        rng.shuffle(keys)
        n = len(keys)
        n_val = max(1, round(n * val_frac))
        n_test = max(1, round(n * test_frac))
        if n_val + n_test >= n:
            raise ValueError(
                f"Class {class_name} has only {n} source images -- too few to split."
            )
        test_keys = keys[:n_test]
        val_keys = keys[n_test:n_test + n_val]
        train_keys = keys[n_test + n_val:]

        # Train keeps every augmented copy; val and test score each leaf once.
        train_files = [p for k in train_keys for p in sorted(groups[class_name][k])]
        val_files = [representative(groups[class_name][k]) for k in val_keys]
        test_files = [representative(groups[class_name][k]) for k in test_keys]

        manifest["train"].extend(train_files)
        manifest["val"].extend(val_files)
        manifest["test"].extend(test_files)
        per_class[class_name] = {
            "source_images": n,
            "train_sources": len(train_keys),
            "val_sources": len(val_keys),
            "test_sources": len(test_keys),
            "train_files": len(train_files),
        }

    for split in manifest:
        manifest[split].sort()
    return manifest, per_class


def verify_no_leakage(manifest: dict) -> None:
    """Assert that no source leaf appears in more than one split."""
    keys = {
        split: {source_key(Path(p).name) for p in paths}
        for split, paths in manifest.items()
    }
    for a, b in (("train", "val"), ("train", "test"), ("val", "test")):
        overlap = keys[a] & keys[b]
        if overlap:
            raise AssertionError(
                f"{len(overlap)} source images appear in both {a} and {b}: "
                f"{sorted(overlap)[:3]}"
            )


def main(
    data_dir: str = "data/plantvillage",
    out: str = "data/splits.json",
    seed: int = 42,
    val_frac: float = 0.15,
    test_frac: float = 0.15,
):
    data_path = Path(data_dir)
    groups = collect_groups(data_path)

    total_groups = sum(len(v) for v in groups.values())
    total_files = sum(len(f) for v in groups.values() for f in v.values())
    print(f"Scanned {total_files:,} files -> {total_groups:,} distinct source images")
    print(f"  mean augmented copies per source image: {total_files / total_groups:.2f}")

    manifest, per_class = build_splits(groups, seed, val_frac, test_frac)
    verify_no_leakage(manifest)
    print("Leakage check passed: no source image appears in two splits.")

    payload = {
        "seed": seed,
        "val_frac": val_frac,
        "test_frac": test_frac,
        "grouping": "source image (augmentation suffix stripped from filename)",
        "note": (
            "train keeps every augmented copy of its own source images; "
            "val and test keep one representative file per source image."
        ),
        "counts": {k: len(v) for k, v in manifest.items()},
        "per_class": per_class,
        "splits": manifest,
    }
    out_path = Path(out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(payload, f, indent=1)

    print("-" * 62)
    for split in ("train", "val", "test"):
        n_files = len(manifest[split])
        n_src = len({source_key(Path(p).name) for p in manifest[split]})
        print(f"  {split:5s}: {n_files:7,} files  ({n_src:,} source images)")
    print("-" * 62)
    thin = sorted(per_class.items(), key=lambda kv: kv[1]["test_sources"])[:3]
    print("Smallest test classes:")
    for name, counts in thin:
        print(f"  {counts['test_sources']:4d}  {name}")
    print(f"\nManifest written to: {out_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build a leakage-free split manifest")
    parser.add_argument("--data-dir", default="data/plantvillage")
    parser.add_argument("--out", default="data/splits.json")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--val-frac", type=float, default=0.15)
    parser.add_argument("--test-frac", type=float, default=0.15)
    args = parser.parse_args()
    main(args.data_dir, args.out, args.seed, args.val_frac, args.test_frac)
