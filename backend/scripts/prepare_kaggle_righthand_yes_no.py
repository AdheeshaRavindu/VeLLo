import argparse
import csv
import json
from pathlib import Path

import pandas as pd


def build_landmarks_from_row(row: pd.Series) -> list[list[float]] | None:
    values: list[list[float]] = []
    for index in range(21):
        x_key = f"x_right_hand_{index}"
        y_key = f"y_right_hand_{index}"
        z_key = f"z_right_hand_{index}"
        if x_key not in row or y_key not in row or z_key not in row:
            return None
        x_val = row.get(x_key)
        y_val = row.get(y_key)
        z_val = row.get(z_key)
        if pd.isna(x_val) or pd.isna(y_val) or pd.isna(z_val):
            return None
        values.append([float(x_val), float(y_val), float(z_val)])
    return values


def infer_label(row: pd.Series) -> str | None:
    value = row.get("label")
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"y", "yes"}:
            return "yes"
        if normalized in {"n", "no"}:
            return "no"

    for key in ("character", "phrase", "sign", "target"):
        candidate = row.get(key)
        if not isinstance(candidate, str):
            continue
        normalized = candidate.strip().lower()
        if normalized in {"y", "yes"}:
            return "yes"
        if normalized in {"n", "no"}:
            return "no"
    return None


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert Kaggle right-hand landmark CSV to gesture_samples.jsonl for yes/no."
    )
    parser.add_argument("--input-csv", required=True, help="Path to source CSV file.")
    parser.add_argument(
        "--output-jsonl",
        default="app/data/gesture_samples_from_kaggle_yes_no.jsonl",
        help="Output JSONL path.",
    )
    parser.add_argument(
        "--max-per-label",
        type=int,
        default=5000,
        help="Maximum rows to keep per label.",
    )
    args = parser.parse_args()

    input_path = Path(args.input_csv).resolve()
    if not input_path.exists():
        raise FileNotFoundError(f"Input CSV not found: {input_path}")

    dataframe = pd.read_csv(input_path)
    label_counts = {"yes": 0, "no": 0}
    kept = 0
    skipped = 0

    output_path = Path(args.output_jsonl).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w", encoding="utf-8", newline="") as outfile:
        writer = csv.writer(outfile, delimiter="\n", quoting=csv.QUOTE_NONE, escapechar="\\")
        for _, row in dataframe.iterrows():
            label = infer_label(row)
            if label is None:
                skipped += 1
                continue
            if label_counts[label] >= max(1, args.max_per_label):
                continue
            landmarks = build_landmarks_from_row(row)
            if landmarks is None:
                skipped += 1
                continue

            payload = {
                "timestamp": None,
                "label": label,
                "handedness": "Right",
                "handedness_score": 1.0,
                "predicted_intent": None,
                "predicted_confidence": 0.0,
                "landmarks": landmarks,
            }
            writer.writerow([json.dumps(payload)])
            label_counts[label] += 1
            kept += 1

    print(f"Output: {output_path}")
    print(f"Kept rows: {kept}")
    print(f"Label counts: {label_counts}")
    print(f"Skipped rows: {skipped}")


if __name__ == "__main__":
    main()
