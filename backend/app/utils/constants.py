SUPPORTED_INTENTS: list[str] = [
    "yes",
    "no",
]

INTENT_THRESHOLDS: dict[str, float] = {
    "yes": 0.72,
    "no": 0.72,
}

CLASSIFIER_MODE: str = "rule"

