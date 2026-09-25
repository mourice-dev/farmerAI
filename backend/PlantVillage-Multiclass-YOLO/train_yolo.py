import os
from ultralytics import YOLO

# Optional: Environment settings for debugging/stability
os.environ["CUDA_LAUNCH_BLOCKING"] = "1"
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

# Set model path (change to another YAML for larger model)
model_path = '/home/ashres34/Desktop/cosc591/yolov12/ultralytics/cfg/models/v12/yolov12l.yaml'

# Set data config path
data_path = '/home/ashres34/Desktop/cosc591/plantdisease_yolo_split3/plant.yaml'

# Load YOLO model
model = YOLO(model_path)

# Train
model.train(
    data=data_path,
    epochs=100,           # or more, adjust based on performance
    batch=36,             # increase if memory allows
    imgsz=640,
    device=0,            # use GPU 0
    workers=4,           # optional: multi-process data loading
    name='plant_yolov12-l-3split' # experiment name
)

# Optional: Save model path
print("✅ Training complete. Model saved to:", model.trainer.best)
