"""
Download the PlantVillage plant disease dataset from Kaggle.

Prerequisites
-------------
1.  pip install kaggle
2.  Create your API key at https://www.kaggle.com/settings -> API -> Create New Token
3.  Place kaggle.json in ~/.kaggle/   (Linux/Mac) or %USERPROFILE%\\.kaggle\\  (Windows)
4.  chmod 600 ~/.kaggle/kaggle.json   (Linux/Mac only)

Usage
-----
    python scripts/download_data.py
    python scripts/download_data.py --dest data
    python scripts/download_data.py --keep-archive     # keep the 3 GB zip

Next step
---------
    python scripts/make_splits.py

The shipped train/valid folders split an already-augmented image pool, so
rotated copies of the same leaf sit on both sides of the split. `make_splits.py`
rebuilds train/val/test grouped on source image; see its docstring for the
measurement.
"""

import argparse
import re
import shutil
import sys
import zipfile
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.dataset import CLASSES, IMAGE_SUFFIXES

DATASET = "vipoooool/new-plant-diseases-dataset"
DEFAULT_DEST = Path("data")
TARGET_NAME = "plantvillage"

# The Kaggle archive also ships a small unlabelled-looking `test/` folder. Its
# labels are not missing -- they are encoded in the filenames, e.g.
# "AppleCedarRust1.JPG", "TomatoYellowCurlVirus3.JPG". An earlier version of
# this script deleted the folder as "no ground-truth labels"; it is in fact the
# only part of the dataset Kaggle never augmented, which makes it a useful
# independent sanity check even though it is far too small (a few dozen images
# over a handful of classes) to headline.
TEST_NAME_TO_CLASS = {
    "applecedarrust": "Apple___Cedar_apple_rust",
    "applescab": "Apple___Apple_scab",
    "appleblackrot": "Apple___Black_rot",
    "applehealthy": "Apple___healthy",
    "corncommonrust": "Corn_(maize)___Common_rust_",
    "cornhealthy": "Corn_(maize)___healthy",
    "cornnorthernleafblight": "Corn_(maize)___Northern_Leaf_Blight",
    "potatoearlyblight": "Potato___Early_blight",
    "potatolateblight": "Potato___Late_blight",
    "potatohealthy": "Potato___healthy",
    "tomatoearlyblight": "Tomato___Early_blight",
    "tomatolateblight": "Tomato___Late_blight",
    "tomatohealthy": "Tomato___healthy",
    "tomatoyellowcurlvirus": "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "tomatomosaicvirus": "Tomato___Tomato_mosaic_virus",
    "tomatoleafmold": "Tomato___Leaf_Mold",
    "tomatobacterialspot": "Tomato___Bacterial_spot",
    "tomatoseptorialeafspot": "Tomato___Septoria_leaf_spot",
    "tomatotargetspot": "Tomato___Target_Spot",
    "squashpowderymildew": "Squash___Powdery_mildew",
    "strawberryleafscorch": "Strawberry___Leaf_scorch",
    "strawberryhealthy": "Strawberry___healthy",
    "grapeblackrot": "Grape___Black_rot",
    "grapehealthy": "Grape___healthy",
    "peppperbellbacterialspot": "Pepper,_bell___Bacterial_spot",
    "pepperbellbacterialspot": "Pepper,_bell___Bacterial_spot",
    "pepperbellhealthy": "Pepper,_bell___healthy",
    "orangehaunglongbing": "Orange___Haunglongbing_(Citrus_greening)",
    "peachbacterialspot": "Peach___Bacterial_spot",
    "peachhealthy": "Peach___healthy",
    "blueberryhealthy": "Blueberry___healthy",
    "raspberryhealthy": "Raspberry___healthy",
    "soybeanhealthy": "Soybean___healthy",
    "cherrypowderymildew": "Cherry_(including_sour)___Powdery_mildew",
    "cherryhealthy": "Cherry_(including_sour)___healthy",
}


def class_from_test_filename(filename: str) -> str | None:
    """Map a Kaggle test filename like 'AppleCedarRust1.JPG' to a class name."""
    stem = Path(filename).stem
    key = re.sub(r"[^a-z]", "", stem.lower())  # drop digits, spaces, separators
    return TEST_NAME_TO_CLASS.get(key)


def count_images(directory: Path) -> int:
    """Count image files under *directory*.

    Iterating once and filtering by suffix, rather than summing glob("*.jpg")
    and glob("*.JPG"): on Windows and macOS those patterns match the same files
    and the totals double.
    """
    return sum(
        1 for p in directory.rglob("*")
        if p.is_file() and p.suffix.lower() in IMAGE_SUFFIXES
    )


def is_extracted(target: Path) -> bool:
    """True if both shipped splits are already in place under *target*."""
    return all((target / split).is_dir() and any((target / split).iterdir())
               for split in ("train", "valid"))


def organise_test_folder(extracted_test: Path, target: Path) -> None:
    """Copy the Kaggle test images into class folders using their filenames."""
    images = [
        p for p in extracted_test.rglob("*")
        if p.is_file() and p.suffix.lower() in IMAGE_SUFFIXES
    ]
    if not images:
        return

    mapped: Counter[str] = Counter()
    unmapped: list[str] = []
    out_root = target / "kaggle_test"

    for path in images:
        class_name = class_from_test_filename(path.name)
        if class_name is None or class_name not in CLASSES:
            unmapped.append(path.name)
            continue
        class_dir = out_root / class_name
        class_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, class_dir / path.name)
        mapped[class_name] += 1

    print(f"\nKaggle test folder: {len(images)} images")
    print(f"  labelled from filenames : {sum(mapped.values())} "
          f"across {len(mapped)} classes -> {out_root}")
    if unmapped:
        # Reported rather than silently dropped: an unmapped name means this
        # script's filename table needs a new entry, not that the image is junk.
        print(f"  unrecognised filenames  : {len(unmapped)}")
        for name in sorted(unmapped)[:10]:
            print(f"      {name}")
        if len(unmapped) > 10:
            print(f"      ... and {len(unmapped) - 10} more")
        print("  -> add the pattern to TEST_NAME_TO_CLASS in this script.")


def download(dest: Path = DEFAULT_DEST, keep_archive: bool = False):
    dest.mkdir(parents=True, exist_ok=True)
    zip_path = dest / "new-plant-diseases-dataset.zip"
    target = dest / TARGET_NAME

    # Check the extracted data first. The previous order checked only for the
    # archive, which the script then deleted after extracting -- so its
    # "archive already exists, skipping download" branch could never fire and
    # every re-run fetched 3 GB again. Checking the data first also stops
    # --keep-archive from re-extracting 3 GB on every run.
    if is_extracted(target):
        print(f"Dataset already extracted at {target} - nothing to do.")
        report(dest)
        return

    if zip_path.exists():
        print(f"Archive already exists at {zip_path} - skipping download.")
    else:
        print(f"Downloading '{DATASET}' from Kaggle ...")
        import kaggle
        api = kaggle.KaggleApi()
        api.authenticate()
        api.dataset_download_files(DATASET, path=str(dest), unzip=False)
        print("Download complete.")

    print("Extracting ...")
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(dest)

    # Normalise the awkward nested directory structure produced by Kaggle
    if target.exists() and any((target / s).exists() for s in ("train", "valid")):
        print(f"Target directory already populated: {target} - skipping move.")
    else:
        # Kaggle extracts to: New Plant Diseases Dataset(Augmented)/New Plant Diseases Dataset(Augmented)/
        augmented_root = dest / "New Plant Diseases Dataset(Augmented)"
        inner = augmented_root / "New Plant Diseases Dataset(Augmented)"
        source_root = inner if inner.exists() else augmented_root

        if source_root.exists():
            target.mkdir(parents=True, exist_ok=True)
            for split in ("train", "valid"):
                src = source_root / split
                if src.exists():
                    shutil.move(str(src), str(target / split))

        if augmented_root.exists():
            shutil.rmtree(str(augmented_root), ignore_errors=True)

    # Keep the test folder. Its labels live in the filenames.
    for candidate in (dest / "test", dest / "Test", target / "test"):
        if candidate.exists():
            organise_test_folder(candidate, target)
            shutil.rmtree(str(candidate), ignore_errors=True)
            break

    if keep_archive:
        print(f"\nKeeping archive at {zip_path} (re-runs will skip the download).")
    else:
        zip_path.unlink(missing_ok=True)

    report(dest)


def report(dest: Path) -> None:
    target = dest / TARGET_NAME
    print(f"\nDataset ready at: {target.resolve()}")
    print("-" * 62)
    for split in ("train", "valid", "kaggle_test"):
        split_dir = target / split
        if not split_dir.exists():
            continue
        class_dirs = [p for p in split_dir.iterdir() if p.is_dir()]
        total = count_images(split_dir)
        print(f"  {split:11s}: {total:7,} images across {len(class_dirs):2d} classes")
    print("-" * 62)
    print("\nNext: python scripts/make_splits.py")
    print("      (the shipped train/valid folders share source images - "
          "see that script's docstring)")


def main():
    parser = argparse.ArgumentParser(description="Download PlantVillage dataset from Kaggle")
    parser.add_argument(
        "--dest", default=str(DEFAULT_DEST),
        help="Directory to save the dataset (default: data/)",
    )
    parser.add_argument(
        "--keep-archive", action="store_true",
        help="Keep the downloaded zip so a re-run does not fetch 3 GB again.",
    )
    args = parser.parse_args()
    download(Path(args.dest), args.keep_archive)


if __name__ == "__main__":
    main()
