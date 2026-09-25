import os
import random
import cv2
import numpy as np
from PIL import Image
from tqdm import tqdm
import shutil
import kagglehub
from pathlib import Path

# ------------------- Setup -------------------

BASE_PATH = "/home/ashres34/Desktop/cosc591/plantdisease_yolo_split2"
IMAGE_ROOT = Path(f"{BASE_PATH}/images")
LABEL_ROOT = Path(f"{BASE_PATH}/labels")

OUTPUT_IMG_DIR = "augmented/images"
OUTPUT_LBL_DIR = "augmented/labels"
os.makedirs(OUTPUT_IMG_DIR, exist_ok=True)
os.makedirs(OUTPUT_LBL_DIR, exist_ok=True)

# ------------------- Download Kaggle Background Dataset -------------------

print("📥 Downloading background images from Kaggle...")
kaggle_path = kagglehub.dataset_download("usharengaraju/grassclover-dataset")
bg_images = []

for root, dirs, files in os.walk(kaggle_path):
    for file in files:
        if file.lower().endswith(("", ".png")):
            bg_images.append(os.path.join(root, file))

print(f"✅ Found {len(bg_images)} background images.")

# ------------------- Helper Functions -------------------

def yolo_to_bbox(yolo_line, img_width, img_height):
    cls, x_center, y_center, w, h = map(float, yolo_line.strip().split())
    x1 = int((x_center - w / 2) * img_width)
    y1 = int((y_center - h / 2) * img_height)
    x2 = int((x_center + w / 2) * img_width)
    y2 = int((y_center + h / 2) * img_height)
    return int(cls), x1, y1, x2, y2

def bbox_to_yolo(cls, x1, y1, x2, y2, img_width, img_height):
    x_center = ((x1 + x2) / 2) / img_width
    y_center = ((y1 + y2) / 2) / img_height
    w = (x2 - x1) / img_width
    h = (y2 - y1) / img_height
    return f"{cls} {x_center:.6f} {y_center:.6f} {w:.6f} {h:.6f}"

# ------------------- Main Loop -------------------

# Get all files regardless of extension
all_image_files = [p for p in IMAGE_ROOT.rglob("*") if p.is_file()]
print(f"🖼️ Found {len(all_image_files)} total images.")

counter = 0
for img_path in tqdm(all_image_files, desc="Processing images"):
    img_path = str(img_path)
    base_name = os.path.splitext(os.path.relpath(img_path, IMAGE_ROOT))[0]
    label_path = LABEL_ROOT / f"{base_name}.txt"

    if not os.path.exists(label_path):
        print(f"⚠️ Label missing for: {img_path}")
        continue

    # Copy original image and label
    original_img_name = f"original_{counter:06d}.jpg"
    original_lbl_name = f"original_{counter:06d}.txt"
    shutil.copy(img_path, os.path.join(OUTPUT_IMG_DIR, original_img_name))
    shutil.copy(label_path, os.path.join(OUTPUT_LBL_DIR, original_lbl_name))

    # Load image and label
    img = cv2.imread(img_path)
    if img is None:
        print(f"⚠️ Could not read image: {img_path}")
        continue
    h_img, w_img = img.shape[:2]

    with open(label_path, "r") as f:
        lines = f.readlines()

    # Crop each object
    objects = []
    for line in lines:
        try:
            cls, x1, y1, x2, y2 = yolo_to_bbox(line, w_img, h_img)
            cropped = img[y1:y2, x1:x2]
            if cropped.size > 0:
                objects.append((cls, cropped))
        except:
            continue

    if not objects:
        counter += 1
        continue

    # Augment 1–3 times
    for _ in range(random.randint(1, 3)):
        bg_path = random.choice(bg_images)
        bg = cv2.imread(bg_path)
        if bg is None:
            continue
        bg = cv2.resize(bg, (640, 640))
        h_bg, w_bg = bg.shape[:2]

        new_labels = []
        for cls, obj in objects:
            try:
                scale = random.uniform(0.5, 1.2)
                angle = random.choice([0, 90, 180, 270])
                obj = cv2.resize(obj, (0, 0), fx=scale, fy=scale)
                obj = Image.fromarray(cv2.cvtColor(obj, cv2.COLOR_BGR2RGB)).rotate(angle, expand=True)
                obj = cv2.cvtColor(np.array(obj), cv2.COLOR_RGB2BGR)

                h_obj, w_obj = obj.shape[:2]
                max_x = w_bg - w_obj
                max_y = h_bg - h_obj
                if max_x <= 0 or max_y <= 0:
                    continue
                x = random.randint(0, max_x)
                y = random.randint(0, max_y)

                # Paste object onto background
                bg[y:y + h_obj, x:x + w_obj] = obj
                new_labels.append(bbox_to_yolo(cls, x, y, x + w_obj, y + h_obj, w_bg, h_bg))
            except:
                continue

        # Save new augmented image and label
        aug_img_name = f"aug_{counter:06d}.jpg"
        aug_lbl_name = f"aug_{counter:06d}.txt"
        cv2.imwrite(os.path.join(OUTPUT_IMG_DIR, aug_img_name), bg)
        with open(os.path.join(OUTPUT_LBL_DIR, aug_lbl_name), "w") as f:
            f.write("\n".join(new_labels))

    counter += 1

print(f"\n✅ Completed: {counter} original images processed with 1–3 augmentations each.")
print(f"📂 All data saved in: {OUTPUT_IMG_DIR} and {OUTPUT_LBL_DIR}")
