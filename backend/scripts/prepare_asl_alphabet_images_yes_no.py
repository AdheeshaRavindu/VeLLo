import argparse
import json
from pathlib import Path

import cv2
from mediapipe.solutions import hands


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

    hands_detector = hands.Hands(
        static_image_mode=True,
        max_num_hands=1,
        min_detection_confidence=0.1,
    )

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
                results = hands_detector.process(rgb)
                if not results.multi_hand_landmarks:
                    skipped += 1
                    continue

                landmarks = [
                    [landmark.x, landmark.y, landmark.z]
                    for landmark in results.multi_hand_landmarks[0].landmark
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

    hands_detector.close()
    print(f"Output: {output_path}")
    print(f"Total rows: {total_written}")
    print(f"Per-label: {per_label_counts}")
    print(f"Skipped images: {skipped}")


if __name__ == "__main__":
    main()
