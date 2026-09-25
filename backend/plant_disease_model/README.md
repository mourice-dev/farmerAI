# Plant Disease Detection using EfficientNet

This project implements a deep learning model to detect 38 different types of plant diseases using the PlantVillage dataset. The model is a fine-tuned model based on the EfficientNet architecture to achieve a balance between computational efficiency and accuracy as it can be run on wide range of devices after training. 

## Features
- Detects diseases across various crops (Apple, Corn, Tomato, Potato, etc.).
- Includes 38 distinct classes (diseased and healthy).
- Inference script for single image prediction and full test set evaluation.

## Environment Setup

### Using uv (Recommended)
```bash
uv sync
```
This will install dependencies from `pyproject.toml` and `uv.lock`.

### Using pip
```bash
pip install -r requirements.txt
```

## Project Structure
- `Plant_Disease_Detection.ipynb`: Training and experimentation notebook.
- `inference.py`: Script for single-image prediction and full evaluation.
- `plant_disease_efficientnet.keras`: The trained model file (not included in the repository, download from Hugging Face).
- `class_names.txt`: Mapping of class indices to human-readable names.
- `evaluation_report.md`: Detailed performance metrics and classification report.
- `requirements.txt`: List of Python dependencies.
- `pyproject.toml`: Project metadata and dependency configuration.

## Model Training Process

The model training is executed inside Plant_Disease_Detection.ipynb using **Transfer Learning** and a **Two-Phase Fine-Tuning** strategy. The model architecture used a pre-trained **EfficientNetB0** model backboned added with a customized multi-layer classifier head.

### 1. Dataset & Preprocessing

* **Dataset**: The model is trained on the color images of the **PlantVillage dataset** (containing color images of healthy and diseased leaves) downloaded from Kaggle.
* **Data Split**: The dataset is split into **80% Training** (43,456 images) and **20% Validation** (10,849 images).
* **Input Resolution**: Images are resized to $224 \times 224$ pixels and normalized using the default EfficientNet preprocessing pipeline method from TensorFlow library (`preprocess_input`).
* **Data Augmentation**: To prevent overfitting by exposing various kind of images to the model to learn, the training data is augmented with the following transformations:
  - Random rotations (up to 30°)
  - Width and height shifts (up to 15%)
  - Shear transformations, which we slant the images along the x-axis or y-axis (up to 15%)
  - Random zooms (up to 20%)
  - Horizontal and vertical flips

### 2. Model Architecture

The classifier is built by combining a pre-trained **EfficientNetB0** with learned image features with a custom classification head designed to adapt the model to our dataset and task to predict 38 classes.

| Layer | Type | Output Shape | Parameters / Details |
| :--- | :--- | :--- | :--- |
| **Backbone** | `EfficientNetB0` | `(None, 7, 7, 1280)` | Pre-trained on ImageNet (frozen/partially frozen) |
| **GAP** | `GlobalAveragePooling2D` | `(None, 1280)` | Spatial dimensionality reduction |
| **BatchNorm** | `BatchNormalization` | `(None, 1280)` | Stabilizes activations |
| **Dense 1** | `Dense` (ReLU) | `(None, 512)` | Fully connected layer (512 units) |
| **Dropout 1**| `Dropout` (0.45) | `(None, 512)` | Rate of 45% to prevent overfitting |
| **Dense 2** | `Dense` (ReLU) | `(None, 256)` | Fully connected layer (256 units) |
| **Dropout 2**| `Dropout` (0.35) | `(None, 256)` | Rate of 35% to prevent overfitting |
| **Output** | `Dense` (Softmax) | `(None, 38)` | 38 distinct crop-disease classes |

There are a total of 799526 trainable parameters in this newly added classifier head.
### 3. Training Strategy & Callbacks

The training pipeline uses Keras callbacks to optimize training convergence and stability:
* **Model Checkpoint**: Automatically saves the best weights dynamically to `best_phase1.keras` and `best_phase2.keras` based on validation accuracy.
* **Early Stopping**: Stop the training process if validation accuracy doesn't improve for **5 consecutive epochs** (`patience=5`) and save the absolute best weights at that time.
* **Reduce Learning Rate on Plateau**: Decreases the learning rate by a factor of 0.5 (`factor=0.5`) if the validation loss plateaus for **3 consecutive epochs**, stopping at a minimum learning rate of $10^{-7}$.

### 4. Two-Phase Training Strategy

To effectively adapt the ImageNet-trained backbone to leaf disease features, a two-phase training strategy is implemented:

#### Phase 1: Feature Extraction (Classifier Head Training)
* **Concept**: The entire pre-trained EfficientNetB0 backbone is **frozen** (`base_model.trainable = False`). Only the custom classification head is trained to learn leaf-specific features.
* **Optimizer**: Adam with learning rate of **$0.001$**.
* **Epochs**: 10.
* **Result**: Achieved **96.05% validation accuracy** (saved to `best_phase1.keras`).

#### Phase 2: Fine-Tuning
* **Concept**: The backbone is unfrozen, but **only the last 30 layers** of the EfficientNetB0 base model are set to trainable (`base_model.layers[-30:]`), keeping the lower general feature layers frozen.
* **Optimizer**: Adam with a very small learning rate of **$0.00001$** to make very small adjustments without destroying the pre-trained ImageNet representations.
* **Epochs**: 10 (Restored weights from Epoch 9 due to Early Stopping).
* **Result**: Achieved **97.35% validation accuracy** (saved as `plant_disease_efficientnet.keras`).

## Usage

### Predict a Single Image
```bash
python inference.py
```
Select option `1` and provide the path to your image.

### Run Full Evaluation
```bash
python inference.py
```
Select option `2` to run evaluation on the test directories.

## Evaluation Results

The model was evaluated on a test set of 511 images.

- **Overall Accuracy:** 41.68%

### Classification Report (Summary)
| Metric | Value |
| :--- | :--- |
| Total Images | 511 |
| Correct Predictions | 213 |
| Accuracy | 41.68% |

### Confusion Matrix
![Confusion Matrix](evaluation_confusion_matrix.png)

## Model Hosting
The trained model is hosted on Hugging Face: [Nefflymicn/PlantVillage-plant-disease-detection](https://huggingface.co/Nefflymicn/PlantVillage-plant-disease-detection)

## License
Apache-2.0
