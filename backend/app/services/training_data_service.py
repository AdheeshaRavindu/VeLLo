import json
from datetime import datetime, timezone
from pathlib import Path


DATASET_FILE = Path(__file__).resolve().parents[1] / "data" / "gesture_samples.jsonl"


def append_training_sample(
    label: str,
    landmarks: list[list[float]],
    handedness: str | None,
    handedness_score: float,
    predicted_intent: str | None,
    predicted_confidence: float,
) -> None:
    DATASET_FILE.parent.mkdir(parents=True, exist_ok=True)
    record = {
        "timestamp": datetime.now(tz=timezone.utc).isoformat(),
        "label": label,
        "handedness": handedness,
        "handedness_score": handedness_score,
        "predicted_intent": predicted_intent,
        "predicted_confidence": predicted_confidence,
        "landmarks": landmarks,
    }
    with DATASET_FILE.open("a", encoding="utf-8") as outfile:
        outfile.write(json.dumps(record) + "\n")
