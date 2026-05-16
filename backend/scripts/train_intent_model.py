import argparse
import csv
import json
from collections import defaultdict
from pathlib import Path

import numpy as np


def build_feature_from_landmarks(landmarks: list[list[float]]) -> np.ndarray | None:
    if len(landmarks) < 21:
        return None
    matrix = np.array(landmarks[:21], dtype=np.float32)
    if matrix.shape != (21, 3):
        return None
    wrist = matrix[0]
    centered = matrix - wrist
    palm_size = float(np.linalg.norm(matrix[9] - matrix[0]))
    scale = palm_size if palm_size > 1e-4 else 1.0
    normalized = centered / scale
    return normalized.reshape(-1)


def maybe_parse_landmarks_json(raw_value: str) -> list[list[float]] | None:
    try:
        parsed = json.loads(raw_value)
    except json.JSONDecodeError:
        return None
    if not isinstance(parsed, list):
        return None
    if len(parsed) == 63:
        chunks = [parsed[index : index + 3] for index in range(0, 63, 3)]
        return chunks if len(chunks) == 21 else None
    if len(parsed) >= 21 and all(isinstance(row, list) and len(row) >= 3 for row in parsed[:21]):
        return [[float(row[0]), float(row[1]), float(row[2])] for row in parsed[:21]]
    return None


def parse_features_from_csv_row(row: dict[str, str]) -> np.ndarray | None:
    if "landmarks" in row and row["landmarks"].strip():
        landmarks = maybe_parse_landmarks_json(row["landmarks"])
        if landmarks is not None:
            return build_feature_from_landmarks(landmarks)

    xyz_columns: list[float] = []
    has_xyz_triplets = True
    for index in range(21):
        x_key = f"x{index}"
        y_key = f"y{index}"
        z_key = f"z{index}"
        if x_key not in row or y_key not in row or z_key not in row:
            has_xyz_triplets = False
            break
        xyz_columns.extend([float(row[x_key]), float(row[y_key]), float(row[z_key])])
    if has_xyz_triplets:
        return np.array(xyz_columns, dtype=np.float32)

    numeric_values: list[float] = []
    ignored_columns = {"label", "intent", "character", "sign", "phrase", "split", "sequence_id"}
    for key, value in row.items():
        if key in ignored_columns:
            continue
        text = value.strip()
        if not text:
            continue
        try:
            numeric_values.append(float(text))
        except ValueError:
            continue
    if len(numeric_values) >= 63:
        return np.array(numeric_values[:63], dtype=np.float32)
    return None


def parse_label(record: dict[str, object]) -> str | None:
    for key in ("label", "intent", "character", "sign", "phrase"):
        value = record.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return None


def collect_samples(
    input_paths: list[Path],
    label_map: dict[str, str],
    allow_labels: set[str] | None,
) -> tuple[dict[str, list[np.ndarray]], int]:
    grouped: dict[str, list[np.ndarray]] = defaultdict(list)
    skipped = 0

    for path in input_paths:
        suffix = path.suffix.lower()
        if suffix == ".jsonl":
            with path.open("r", encoding="utf-8") as infile:
                for line in infile:
                    text = line.strip()
                    if not text:
                        continue
                    try:
                        record = json.loads(text)
                    except json.JSONDecodeError:
                        skipped += 1
                        continue
                    if not isinstance(record, dict):
                        skipped += 1
                        continue
                    label = parse_label(record)
                    if label is None:
                        skipped += 1
                        continue
                    normalized_label = label_map.get(label.lower(), label.lower())
                    if allow_labels and normalized_label not in allow_labels:
                        continue
                    landmarks = record.get("landmarks")
                    if not isinstance(landmarks, list):
                        skipped += 1
                        continue
                    feature = build_feature_from_landmarks(landmarks)  # type: ignore[arg-type]
                    if feature is None:
                        skipped += 1
                        continue
                    grouped[normalized_label].append(feature)

        elif suffix == ".csv":
            with path.open("r", encoding="utf-8", newline="") as infile:
                reader = csv.DictReader(infile)
                for row in reader:
                    label = (
                        row.get("label")
                        or row.get("intent")
                        or row.get("character")
                        or row.get("sign")
                        or row.get("phrase")
                    )
                    if label is None or not label.strip():
                        skipped += 1
                        continue
                    normalized_label = label_map.get(label.strip().lower(), label.strip().lower())
                    if allow_labels and normalized_label not in allow_labels:
                        continue
                    feature = parse_features_from_csv_row(row)
                    if feature is None or feature.shape[0] != 63:
                        skipped += 1
                        continue
                    grouped[normalized_label].append(feature)
        else:
            raise ValueError(f"Unsupported input file type: {path}")

    return grouped, skipped


def build_centroid_model(samples: dict[str, list[np.ndarray]], min_samples: int) -> dict[str, object]:
    labels: list[str] = []
    centroids: list[list[float]] = []
    counts: dict[str, int] = {}

    for label in sorted(samples.keys()):
        vectors = samples[label]
        if len(vectors) < min_samples:
            continue
        matrix = np.stack(vectors)
        centroid = np.mean(matrix, axis=0)
        labels.append(label)
        centroids.append(centroid.astype(np.float32).tolist())
        counts[label] = len(vectors)

    return {
        "model_type": "centroid-v1",
        "feature_spec": "normalized_21x3_landmarks",
        "labels": labels,
        "centroids": centroids,
        "counts": counts,
        "temperature": 0.35,
    }


def parse_label_map(mappings: list[str]) -> dict[str, str]:
    result: dict[str, str] = {}
    for item in mappings:
        if "=" not in item:
            raise ValueError(f"Invalid --map value '{item}'. Use source=target.")
        source, target = item.split("=", 1)
        source_key = source.strip().lower()
        target_value = target.strip().lower()
        if not source_key or not target_value:
            raise ValueError(f"Invalid --map value '{item}'. Use source=target.")
        result[source_key] = target_value
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description="Train centroid model for sign intent classification.")
    parser.add_argument(
        "--input",
        action="append",
        required=True,
        help="Input dataset path (.jsonl from local capture or .csv export). Can be repeated.",
    )
    parser.add_argument(
        "--output",
        default="app/data/models/gesture_centroid_model.json",
        help="Output model path.",
    )
    parser.add_argument(
        "--labels",
        default="yes,no",
        help="Comma-separated label allow-list for training.",
    )
    parser.add_argument(
        "--map",
        action="append",
        default=[],
        help="Label remapping rule source=target. Example: y=yes",
    )
    parser.add_argument(
        "--min-samples",
        type=int,
        default=10,
        help="Minimum samples required per label.",
    )
    args = parser.parse_args()

    input_paths = [Path(value).resolve() for value in args.input]
    for path in input_paths:
        if not path.exists():
            raise FileNotFoundError(f"Input file not found: {path}")

    allow_labels = {item.strip().lower() for item in args.labels.split(",") if item.strip()}
    label_map = parse_label_map(args.map)
    samples, skipped = collect_samples(input_paths, label_map, allow_labels if allow_labels else None)

    model = build_centroid_model(samples, min_samples=max(1, args.min_samples))
    labels = model.get("labels", [])
    if not isinstance(labels, list) or not labels:
        raise RuntimeError("No labels met minimum sample requirement. Check inputs or lower --min-samples.")

    output_path = Path(args.output).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(model, indent=2), encoding="utf-8")

    counts = model.get("counts", {})
    print(f"Model written to: {output_path}")
    print(f"Labels: {labels}")
    print(f"Counts: {counts}")
    print(f"Skipped rows: {skipped}")


if __name__ == "__main__":
    main()
