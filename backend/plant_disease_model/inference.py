import os
import sys
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from datetime import datetime
from tensorflow.keras.preprocessing import image as kimage
from tensorflow.keras.applications.efficientnet import preprocess_input
from sklearn.metrics import classification_report, confusion_matrix

# Load the trained model
MODEL_PATH = "plant_disease_efficientnet.keras"

# Class names mapping (Plant Village dataset)
CLASS_NAMES_FILE = "class_names.txt"

# Mapping from test folder names to class indices
# This handles variations in spelling found in the test directories
FOLDER_TO_IDX = {
    "Apple - Scab": 0,
    "Apple - Black Rot": 1,
    "Apple - Ceder Rust Leaf": 2,
    "Apple - Cedar Rust Leaf": 2,
    "Apple - Healthy": 3,
    "Blueberry - Healthy": 4,
    "Cherry - Powdery": 5,
    "Cherry - Healthy": 6,
    "Corn - Gray Leaf Spot": 7,
    "Corn - Common Rust": 8,
    "Corn - Leaf Blight": 9,
    "Corn - Healthy": 10,
    "Grape - Black Rot": 11,
    "Grape - Black Measles": 12,
    "Grape - Isariopsis Leaf Spot": 13,
    "Grape - Healthy": 14,
    "Orange - Citrus Greening": 15,
    "Peach - Bacterial Spot": 16,
    "Peach - Healthy": 17,
    "Pepper - Bacterial Spot": 18,
    "Pepper - Healthy": 19,
    "Potato - Early Blight": 20,
    "Potato - Late Blight": 21,
    "Potato - Healthy": 22,
    "Rasberry - Healthy": 23,
    "Raspberry - Healthy": 23,
    "Soybean - Healthy": 24,
    "Squash - Powdery": 25,
    "Strawberry - Leaf Scorch": 26,
    "Strawberry - Healthy": 27,
    "Tomato - Bacterial Spot": 28,
    "Tomato - Early Blight": 29,
    "Tomato - Late Blight": 30,
    "Tomato - Leaf Mold": 31,
    "Tomato - Mosaic Virus": 36,
    "Tomato - Septoria Leaf Spot": 32,
    "Tomato - Spider Mite": 33,
    "Tomato - Target Spot": 34,
    "Tomato - Yellow Leaf Curl Virus": 35,
    "Tomato - Healthy": 37,
}


def load_class_names():
    """Load class names from file."""
    if os.path.exists(CLASS_NAMES_FILE):
        class_names = {}
        with open(CLASS_NAMES_FILE, "r") as f:
            for line in f:
                line = line.strip()
                if ":" in line:
                    idx, name = line.split(":", 1)
                    class_names[int(idx.strip())] = name.strip()
        return class_names
    return {}


def load_model():
    """Load the trained plant disease detection model."""
    from tensorflow.keras.models import load_model

    if not os.path.exists(MODEL_PATH):
        print(f"❌ Error: Model file '{MODEL_PATH}' not found!")
        sys.exit(1)

    model = load_model(MODEL_PATH)
    print(f"✅ Model loaded from: {MODEL_PATH}")
    return model


def predict_image(model, img_path, target_size=(224, 224), top_k=5):
    """
    Predict disease for a single image.
    """
    try:
        # Load and preprocess the image
        img = kimage.load_img(img_path, target_size=target_size)
        x = kimage.img_to_array(img)
        x = np.array([x])  # Add batch dimension
        x = preprocess_input(x)

        # Make prediction
        probs = model.predict(x, verbose=0)[0]

        # Get top-k predictions
        top_indices = probs.argsort()[-top_k:][::-1]
        top_predictions = []

        # Get class names
        class_name_map = load_class_names()

        for idx in top_indices:
            class_name = class_name_map.get(idx, f"Class {idx}")
            confidence = probs[idx] * 100
            top_predictions.append(
                {
                    "class": class_name,
                    "confidence": confidence,
                    "probability": probs[idx],
                    "index": idx,
                }
            )

        return {
            "image_path": img_path,
            "predictions": top_predictions,
            "top_prediction": top_predictions[0],
            "all_probs": probs,
        }
    except Exception as e:
        print(f"❌ Error predicting image {img_path}: {e}")
        return None


def run_evaluation(model):
    """
    Evaluate the model using images from the specified test directories.
    Saves results to CSV and Markdown files.
    """
    test_dirs = [
        "Test Leaves - Mun Suen/",
        "Test Leaves - Zoey/",
        "Test Leaves - Yihan/Test/",
        "Test Leaves - Sze Ching/",
    ]

    image_extensions = (".jpg", ".jpeg", ".png", ".webp", ".bmp")

    y_true = []
    y_pred = []
    detailed_results = []

    print("\n🚀 Starting automated model evaluation...")
    print("=" * 60)

    total_images = 0
    correct_images = 0

    class_names_map = load_class_names()
    class_names = [
        class_names_map.get(i, f"Class {i}") for i in range(len(class_names_map))
    ]

    for base_dir in test_dirs:
        if not os.path.exists(base_dir):
            print(f"⚠️ Warning: Directory '{base_dir}' not found. Skipping...")
            continue

        print(f"\n📂 Evaluating directory: {base_dir}")

        # Iterate through class subdirectories
        subdirs = sorted(
            [
                d
                for d in os.listdir(base_dir)
                if os.path.isdir(os.path.join(base_dir, d))
            ]
        )

        for subdir in subdirs:
            if subdir not in FOLDER_TO_IDX:
                print(f"  ⚠️ Skipping unknown category: {subdir}")
                continue

            true_idx = FOLDER_TO_IDX[subdir]
            subdir_path = os.path.join(base_dir, subdir)

            # Get images in this subdirectory
            img_files = [
                f
                for f in os.listdir(subdir_path)
                if f.lower().endswith(image_extensions)
            ]

            if not img_files:
                continue

            print(f"  📄 Processing {subdir} ({len(img_files)} images)...")

            for img_file in img_files:
                img_path = os.path.join(subdir_path, img_file)
                result = predict_image(model, img_path)

                if result:
                    pred_idx = result["top_prediction"]["index"]
                    y_true.append(true_idx)
                    y_pred.append(pred_idx)

                    is_correct = pred_idx == true_idx
                    total_images += 1
                    if is_correct:
                        correct_images += 1

                    detailed_results.append(
                        {
                            "Source Directory": base_dir,
                            "Category": subdir,
                            "Image File": img_file,
                            "True Class": class_names[true_idx],
                            "Predicted Class": result["top_prediction"]["class"],
                            "Confidence (%)": f"{result['top_prediction']['confidence']:.2f}",
                            "Result": "CORRECT" if is_correct else "INCORRECT",
                        }
                    )

    if not y_true:
        print("❌ No images found for evaluation.")
        return

    # Calculate overall accuracy
    accuracy = (correct_images / total_images) * 100
    report_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    print("\n" + "=" * 60)
    print("EVALUATION RESULTS")
    print("=" * 60)
    print(f"Total Images Processed: {total_images}")
    print(f"Correct Predictions:    {correct_images}")
    print(f"Overall Accuracy:       {accuracy:.2f}%")

    # Generate Classification Report
    clf_report_str = classification_report(
        y_true,
        y_pred,
        target_names=class_names,
        labels=range(len(class_names)),
        digits=3,
        zero_division=0,
    )
    print("\n── Classification Report ──────────────────────────────────")
    print(clf_report_str)

    # Plot Confusion Matrix
    cm = confusion_matrix(y_true, y_pred, labels=range(len(class_names)))
    # Normalise
    with np.errstate(divide="ignore", invalid="ignore"):
        cm_norm = cm.astype("float") / cm.sum(axis=1)[:, np.newaxis]
        cm_norm = np.nan_to_num(cm_norm)

    plt.figure(figsize=(18, 15))
    sns.heatmap(
        cm_norm,
        annot=False,
        cmap="YlOrRd",
        xticklabels=class_names,
        yticklabels=class_names,
    )
    plt.title(f"Normalized Confusion Matrix (Accuracy: {accuracy:.2f}%)")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.xticks(rotation=45, ha="right", fontsize=8)
    plt.yticks(fontsize=8)
    plt.tight_layout()

    # Save confusion matrix image
    cm_image_path = "evaluation_confusion_matrix.png"
    plt.savefig(cm_image_path)
    print(f"\n✅ Confusion matrix saved to: {cm_image_path}")
    plt.close()

    # Save detailed results to CSV
    df = pd.DataFrame(detailed_results)
    csv_path = "evaluation_results.csv"
    df.to_csv(csv_path, index=False)
    print(f"✅ Detailed results saved to: {csv_path}")

    # Generate and save Markdown report
    md_path = "evaluation_report.md"
    with open(md_path, "w") as f:
        f.write(f"# Model Evaluation Report\n\n")
        f.write(f"- **Date:** {report_timestamp}\n")
        f.write(f"- **Model:** `{MODEL_PATH}`\n")
        f.write(f"- **Total Images:** {total_images}\n")
        f.write(f"- **Overall Accuracy:** **{accuracy:.2f}%**\n\n")

        f.write(f"## Summary Metrics\n\n")
        f.write(f"| Metric | Value |\n")
        f.write(f"| :--- | :--- |\n")
        f.write(f"| Total Images | {total_images} |\n")
        f.write(f"| Correct Predictions | {correct_images} |\n")
        f.write(f"| Accuracy | {accuracy:.2f}% |\n\n")

        f.write(f"## Classification Report\n\n")
        f.write(f"```text\n{clf_report_str}\n```\n\n")

        f.write(f"## Confusion Matrix\n\n")
        f.write(f"![Confusion Matrix]({cm_image_path})\n\n")

        f.write(f"---\n")
        f.write(f"*Detailed predictions can be found in [{csv_path}](./{csv_path})*")

    print(f"✅ Summary report saved to: {md_path}")
    print("\n" + "=" * 60)


def main():
    """Main function to run the plant disease detection inference."""
    print("=" * 60)
    print("🌿 PLANT DISEASE DETECTION - INFERENCE & EVALUATION")
    print("=" * 60)

    # Load model
    model = load_model()

    # Get class names
    class_name_map = load_class_names()
    print(f"📋 Loaded {len(class_name_map)} class names")

    while True:
        print("\n" + "-" * 60)
        print("OPTIONS:")
        print("  1. Predict a single image")
        print("  2. Run full evaluation on test directories")
        print("  3. Exit")
        print("-" * 60)

        choice = input("\nSelect option (1/2/3): ").strip()

        if choice == "1":
            img_path = input("\nEnter the path to the image file: ").strip()
            if not os.path.exists(img_path):
                print(f"❌ Error: File '{img_path}' not found!")
                continue

            result = predict_image(model, img_path)
            if result:
                print("\n" + "=" * 60)
                print("PREDICTION RESULTS")
                print("=" * 60)
                print(f"🏆 Top Prediction: {result['top_prediction']['class']}")
                print(
                    f"   Confidence:     {result['top_prediction']['confidence']:.2f}%"
                )

                print(f"\n📊 Top 5 Predictions:")
                for i, pred in enumerate(result["predictions"], 1):
                    print(f"   {i}. {pred['class']}: {pred['confidence']:.2f}%")
        elif choice == "2":
            run_evaluation(model)
        elif choice == "3":
            print("\n👋 Goodbye!")
            break
        else:
            print("❌ Invalid option. Please choose 1, 2, or 3.")


if __name__ == "__main__":
    main()
