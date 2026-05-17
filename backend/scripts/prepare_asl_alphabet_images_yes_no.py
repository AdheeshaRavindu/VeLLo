import argparse
import json
from pathlib import Path

import cv2
import mediapipe as mp
from mediapipe.tasks.python.vision.hand_landmarker import HandLandmarker, HandLandmarkerOptions
from mediapipe.tasks.python.core.base_options import BaseOptions


def image_paths_for_label(root_dir: Path, label: str) -> list[Path]:
    paths: list[Path] = []
    for split_dir in ("asl_alphabet_train", "asl_alphabet_test"):
        folder = root_dir / split_dir / label
        if not folder.exists():
            continue
        paths.extend(sorted(folder.glob("*.jpg")))
    return paths


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract yes/no landmark samples from Kaggle ASL alphabet images."
    )
    parser.add_argument(
        "--dataset-root",
        required=True,
        help="Path to dataset root that contains asl_alphabet_train and asl_alphabet_test.",
    )
    parser.add_argument(
        "--output-jsonl",
        default="app/data/gesture_samples_from_kaggle_yes_no.jsonl",
        help="Output JSONL file path.",
    )
    args = parser.parse_args()

    dataset_root = Path(args.dataset_root).resolve()
    if not dataset_root.exists():
        raise FileNotFoundError(f"Dataset root not found: {dataset_root}")

    label_map = {"Y": "yes", "N": "no"}
    output_path = Path(args.output_jsonl).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Get the path to the hand landmarker model
    model_path = Path(__file__).parent.parent / "models" / "hand_landmarker.task"
    
    if not model_path.exists():
        raise FileNotFoundError(f"Hand landmarker model not found at {model_path}")
    
    # Create the detector options
    base_options = BaseOptions(model_asset_path=str(model_path))
    options = HandLandmarkerOptions(
        base_options=base_options,
        num_hands=1,
        min_hand_detection_confidence=0.1,
        min_hand_presence_confidence=0.1,
        min_tracking_confidence=0.1,
    )
    
    # Create the detector
    hands_detector = HandLandmarker.create_from_options(options)

    total_written = 0
    per_label_counts = {"yes": 0, "no": 0}
    skipped = 0

    with output_path.open("w", encoding="utf-8") as outfile:
        for dataset_label, intent_label in label_map.items():
            for image_path in image_paths_for_label(dataset_root, dataset_label):
                image = cv2.imread(str(image_path))
                if image is None:
                    skipped += 1
                    continue
                rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                
                # Create MediaPipe Image object
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
                
                # Detect hands
                results = hands_detector.detect(mp_image)
                
                if not results.hand_landmarks:
                    skipped += 1
                    continue

                landmarks = [
                    [landmark.x, landmark.y, landmark.z]
                    for landmark in results.hand_landmarks[0]
                ]
                if len(landmarks) != 21:
                    skipped += 1
                    continue

                payload = {
                    "timestamp": None,
                    "label": intent_label,
                    "handedness": "Right",
                    "handedness_score": 1.0,
                    "predicted_intent": None,
                    "predicted_confidence": 0.0,
                    "landmarks": landmarks,
                }
                outfile.write(json.dumps(payload) + "\n")
                total_written += 1
                per_label_counts[intent_label] += 1

    print(f"Output: {output_path}")
    print(f"Total rows: {total_written}")
    print(f"Per-label: {per_label_counts}")
    print(f"Skipped images: {skipped}")


if __name__ == "__main__":
    main()
