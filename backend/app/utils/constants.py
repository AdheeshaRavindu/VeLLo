SUPPORTED_INTENTS: list[str] = [
    "yes",
    "help",
]

INTENT_THRESHOLDS: dict[str, float] = {
    "yes": 0.72,
    "help": 0.90,
}

CLASSIFIER_MODE: str = "rule"

