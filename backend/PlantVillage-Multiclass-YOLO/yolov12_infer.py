import os
import tkinter as tk
from tkinter import filedialog
from PIL import Image, ImageTk, ImageDraw, ImageFont
from ultralytics import YOLO

# Paths
MODEL_PATH = "/home/ashres34/Desktop/cosc591/runs/detect/plant_yolov12-l-3split/weights/best.pt"
LABEL_ROOT = "/home/ashres34/Desktop/cosc591/plantdisease_yolo_split2/labels/train"
IMAGE_ROOT = "/home/ashres34/Desktop/cosc591/plantdisease_yolo_split2/images/train"

# Load YOLOv12 model
model = YOLO(MODEL_PATH)

# Tkinter setup
root = tk.Tk()
root.title("YOLOv12 Image Evaluator")
root.geometry("1000x700")

# UI elements
top_frame = tk.Frame(root)
top_frame.pack()

image_label = tk.Label(top_frame)
image_label.pack(side=tk.LEFT, padx=10)

btn_choose = tk.Button(top_frame, text="📷 Choose Image", command=lambda: choose_image())
btn_choose.pack(side=tk.LEFT, padx=10, pady=10)

text_box = tk.Text(root, height=15, width=100)
text_box.pack(pady=10)

# Draw predictions and ground truth in bounding boxes
def draw_boxes(image_path, predictions, label_path=None):
    image = Image.open(image_path).convert("RGB")
    draw = ImageDraw.Draw(image)
    width, height = image.size

    try:
        font = ImageFont.truetype("arial.ttf", 16)
    except:
        font = ImageFont.load_default()

    # Parse ground truth boxes from YOLO .txt file
    gt_boxes = []
    if label_path and os.path.exists(label_path):
        with open(label_path, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) == 5:
                    cls_id, x_center, y_center, w, h = map(float, parts)
                    x0 = (x_center - w / 2) * width
                    y0 = (y_center - h / 2) * height
                    x1 = (x_center + w / 2) * width
                    y1 = (y_center + h / 2) * height
                    gt_boxes.append((int(cls_id), x0, y0, x1, y1))

    # Draw predictions and match with ground truth
    for box in predictions.boxes:
        cls_pred = int(box.cls)
        conf = float(box.conf)
        x0, y0, x1, y1 = box.xyxy[0].tolist()

        matched_gt = None
        for gt_cls, gx0, gy0, gx1, gy1 in gt_boxes:
            # Match by overlapping box centers (simple heuristic)
            if gx0 < (x0 + x1)/2 < gx1 and gy0 < (y0 + y1)/2 < gy1:
                matched_gt = (gt_cls, gx0, gy0, gx1, gy1)
                break

        draw.rectangle([x0, y0, x1, y1], outline='blue', width=2)

        # Top label = Real (if available)
        if matched_gt:
            real_cls_name = model.names[matched_gt[0]]
            draw.text((x0 + 2, y0 + 2), f"Real: {real_cls_name}", fill='green', font=font)
        else:
            draw.text((x0 + 2, y0 + 2), "Real: Unknown", fill='orange', font=font)

        # Bottom label = Predicted
        draw.text((x0 + 2, y1 - 20), f"Predicted: {model.names[cls_pred]} ({conf:.2f})", fill='red', font=font)

    return image.resize((500, 500))

# Main function
def choose_image():
    file_path = filedialog.askopenfilename(initialdir=IMAGE_ROOT, title="Select Image",
                                           filetypes=[("All Files", "*.*")])

    if not file_path:
        return

    label_filename = os.path.splitext(os.path.basename(file_path))[0] + '.txt'
    label_path = os.path.join(LABEL_ROOT, label_filename)

    # Run YOLO inference
    results = model(file_path)
    prediction = results[0]

    # Draw
    result_image = draw_boxes(file_path, prediction, label_path)
    img_tk = ImageTk.PhotoImage(result_image)
    image_label.configure(image=img_tk)
    image_label.image = img_tk

    # Show details
    text_box.delete('1.0', tk.END)
    pred_ids = set()
    text_box.insert(tk.END, "🔍 Predicted Classes:\n")
    for box in prediction.boxes:
        cls = int(box.cls)
        conf = float(box.conf)
        pred_ids.add(cls)
        text_box.insert(tk.END, f"• {model.names[cls]} ({conf:.2f})\n")

    # Display ground truth classes
    if os.path.exists(label_path):
        text_box.insert(tk.END, "\n📄 Ground Truth Classes:\n")
        with open(label_path, 'r') as f:
            gt_ids = set(int(line.strip().split()[0]) for line in f)
            for cls_id in gt_ids:
                text_box.insert(tk.END, f"• {model.names[cls_id]}\n")

        # Match check
        if gt_ids == pred_ids:
            text_box.insert(tk.END, "\n✅ Prediction matches ground truth.\n")
        else:
            text_box.insert(tk.END, "\n❌ Prediction does NOT match ground truth.\n")
            text_box.insert(tk.END, f"Expected: {[model.names[i] for i in gt_ids]}\n")
            text_box.insert(tk.END, f"Predicted: {[model.names[i] for i in pred_ids]}\n")
    else:
        text_box.insert(tk.END, "\n⚠️ No label file found for this image.\n")

# Start the UI
root.mainloop()
