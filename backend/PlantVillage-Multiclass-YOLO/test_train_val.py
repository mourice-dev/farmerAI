import os
import shutil
import random
from pathlib import Path
from tqdm import tqdm

# Set random seed for reproducibility
random.seed(42)

# Input folders
IMAGE_DIR = Path("augmented/images")
LABEL_DIR = Path("augmented/labels")

# Output base path
BASE_PATH = Path("/home/ashres34/Desktop/cosc591/plantdisease_yolo_split3")

# Output image and label paths
output_dirs = {
    "train": {
        "images": BASE_PATH / "images/train",
        "labels": BASE_PATH / "labels/train"
    },
    "val": {
        "images": BASE_PATH / "images/val",
        "labels": BASE_PATH / "labels/val"
    },
    "test": {
        "images": BASE_PATH / "images/test",
        "labels": BASE_PATH / "labels/test"
    }
}

# Make sure output directories exist
for split in output_dirs.values():
    split["images"].mkdir(parents=True, exist_ok=True)
    split["labels"].mkdir(parents=True, exist_ok=True)

# Get and shuffle image files
image_files = list(IMAGE_DIR.glob("*"))
random.shuffle(image_files)

# Split
total = len(image_files)
train_split = int(0.8 * total)
val_split = int(0.1 * total)

splits = {
    "train": image_files[:train_split],
    "val": image_files[train_split:train_split + val_split],
    "test": image_files[train_split + val_split:]
}

# Copy images and corresponding labels
for split_name, files in splits.items():
    print(f"Processing {split_name} set with {len(files)} images...")
    for img_file in tqdm(files):
        # Copy image
        dst_img = output_dirs[split_name]["images"] / img_file.name
        shutil.copy(img_file, dst_img)

        # Copy corresponding label
        label_file = LABEL_DIR / (img_file.stem + ".txt")
        dst_label = output_dirs[split_name]["labels"] / (img_file.stem + ".txt")

        if label_file.exists():
            shutil.copy(label_file, dst_label)
        else:
            print(f"⚠️ Warning: Label not found for {img_file.name}")
