# PlantVillage-Multiclass-YOLO
🌱 Plant Disease Detection with YOLOv12-L (Multiclass Object Detection)

📌 Overview
This project implements state-of-the-art YOLOv12-L for multiclass object detection to identify plant species and classify leaf diseases from images.
The system aims to assist farmers, researchers, and agricultural AI systems by providing real-time plant disease recognition from a simple leaf photograph.

A temporary interactive web application has already been deployed using Google Colab + Streamlit + Cloudflared, allowing live testing of the model.
The Colab notebook is included in this repository for easy setup and testing.

🎯 Project Goals
Build a robust, real-world-ready detection model for plant diseases.

Use YOLOv12-L for its speed, accuracy, and ability to generalize across multiple classes.

Create a dataset capable of handling non-natural environments through data cleaning and augmentation.

Provide an accessible, browser-based demo for testing without requiring local setup.

🗂 Dataset
The dataset contains 15 classes across three crops (Pepper (Bell), Potato, Tomato) and various health/disease conditions:

Crop	Classes
Pepper	Pepper__bell___Bacterial_spot, Pepper__bell___healthy
Potato	Potato___Early_blight, Potato___Late_blight, Potato___healthy
Tomato	Tomato_Bacterial_spot, Tomato_Early_blight, Tomato_Late_blight, Tomato_Leaf_Mold, Tomato_Septoria_leaf_spot, Tomato_Spider_mites_Two_spotted_spider_mite, Tomato__Target_Spot, Tomato__Tomato_YellowLeaf__Curl_Virus, Tomato__Tomato_mosaic_virus, Tomato_healthy

### Download the Dataset  
The dataset is hosted on Kaggle and can be accessed here:  
➡️ [Plant Village Augmented Dataset on Kaggle](https://www.kaggle.com/anishshrestha07/plant-village-augumented-yolov12-l-model)

You can download it manually from Kaggle or use the Kaggle API as described in the **Model & Dataset Download Instructions** section.


Dataset Challenges & Solutions
Non-natural backgrounds (lab environment images) → Solved via data augmentation to mimic real-life conditions.

Large dataset but still required augmentation for robustness in varying lighting, angles, and backgrounds.

Used a random Kaggle grass dataset to replace backgrounds and simulate outdoor environments.

⚙️ Data Preparation
Data Cleaning: Removed mislabeled images, duplicates, and low-quality samples.

Data Augmentation:

Random background replacement (natural grass textures)

Rotations, brightness/contrast adjustments, scaling

Simulated real-world environmental noise

Dataset Split: Balanced train/validation/test sets.

🧠 Model Architecture: YOLOv12-L
Model Size: 283 layers, 25.87M parameters

GFLOPs: 81.1

Device: NVIDIA A100 40GB GPU

Framework: Ultralytics YOLOv12

Epochs: 100

Training Time: ~20.05 hours

📊 Results
Metric	Value
Precision (P)	0.995
Recall (R)	0.998
mAP@50	0.995
mAP@50-95	0.995
Inference Speed	4.7 ms/image
Preprocessing Time	0.1 ms/image

Per-Class mAP@50: All classes achieved 0.995 with high precision and recall, ensuring excellent performance in detection and classification tasks.

🌐 Web Application Demo
A temporary web app is deployed using:

Google Colab — to host model execution

Streamlit — for a user-friendly web interface

Cloudflared — to expose the Colab app to the internet

Features:

Upload an image of a plant leaf

Receive plant type + disease classification in real time

Visual bounding boxes for detected leaves

Note: The Colab app is for demonstration purposes only. Permanent deployment (e.g., on Hugging Face Spaces or AWS) is planned.

📂 Repository Contents
train.py — YOLOv12-L training script

best.pt — Trained model weights (52.6 MB)

plant_disease_detection_colab.ipynb — Colab-based demo web app

runs/detect/ — Training logs and validation reports

data/ — Dataset configuration and augmentation scripts

requirements.txt — Full environment dependencies

📦 Installation
Clone the repository:

bash
Copy
Edit
git clone https://github.com/your-username/plant-disease-detection-yolov12.git
cd plant-disease-detection-yolov12
Install dependencies:

bash
Copy
Edit
pip install -r requirements.txt
Run the demo (Colab):

bash
Copy
Edit
streamlit run plant_disease_detection_colab.ipynb
📜 Requirements
requirements.txt

ini
Copy
Edit
absl-py==2.2.2
altair==5.5.0
blinker==1.9.0
certifi==2025.4.26
charset-normalizer==3.3.2
click==8.1.8
Django==4.2.23
GitPython==3.1.45
idna==3.10
streamlit==1.47.1
torch==2.3.0
torchaudio==2.3.0
torchvision==0.16.0
tqdm==4.67.1
ultralytics==8.3.170
Additional CLI installs for demo deployment:

bash
Copy
Edit
pip install -q streamlit ultralytics
npm install -g localtunnel
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O cloudflared
chmod +x cloudflared
🚀 Key Achievements
99.5% mAP across all 15 classes.

Real-time inference suitable for mobile and edge deployment.

Successfully bridged lab-to-field gap via domain-specific augmentation.

Built an interactive web app for hands-on testing.

🔮 Future Work
Add more crop species and diseases to the dataset.

Improve background replacement realism using GAN-based augmentation.

Deploy a permanent online version with cloud hosting.

Explore gesture-based image capture for field annotation.

📚 Blog & Articles
For a deeper dive into the development process, challenges, and insights gained from this project, read the full blog post:

👉 Building a Plant Disease Detection System: My Experience Managing and Developing with YOLOv12 on UNE HPC
https://medium.com/@anishkumar.shrestha07/building-a-plant-disease-detection-system-my-experience-managing-and-developing-with-yolov12-on-01ec31ba1ed6


💡 Inspiration
Agriculture is the backbone of many economies. Early disease detection can prevent crop losses, ensure food security, and support farmers worldwide.
This project merges cutting-edge computer vision with practical deployment strategies to make AI-driven agriculture accessible to everyone.
