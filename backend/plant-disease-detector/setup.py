from setuptools import find_packages, setup

# Kept in step with requirements.txt on purpose: an earlier version pinned
# `opencv-python` here and `opencv-python-headless` there, so `pip install -e .`
# pulled the GUI build and broke `import cv2` on headless hosts.
RUNTIME = [
    "torch>=2.1.0",
    "torchvision>=0.16.0",
    "numpy>=1.24.0",
    "Pillow>=10.0.0",
    "opencv-python-headless>=4.8.0",
    "scikit-learn>=1.3.0",
    "matplotlib>=3.7.0",
    "huggingface_hub>=0.19.0",
    "streamlit>=1.28.0",
    "PyYAML>=6.0",
]

# Training and evaluation only. `seaborn` backs the confusion-matrix heatmap in
# src/evaluate.py; `tqdm` the training progress bar.
DEV = [
    "seaborn>=0.12.0",
    "tqdm>=4.65.0",
    "pandas>=2.0.0",
    "kaggle>=1.5.16",
    "pytest>=7.4.0",
    "ruff>=0.6.0",
]

setup(
    name="plant-disease-detector",
    version="1.1.0",
    author="Abeer Ashraf",
    description="EfficientNet-B4 plant disease classifier with Grad-CAM explainability",
    packages=find_packages(include=["src", "src.*"]),
    python_requires=">=3.10",
    install_requires=RUNTIME,
    extras_require={"dev": DEV},
)
