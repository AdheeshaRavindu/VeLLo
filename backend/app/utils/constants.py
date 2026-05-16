SUPPORTED_INTENTS: list[str] = [
    "yes",
    "no",
    "water",
    "pain",
    "stop",
]

INTENT_THRESHOLDS: dict[str, float] = {
    "yes": 0.72,
    "no": 0.72,
    "water": 0.72,
    "pain": 0.72,
    "stop": 0.72,
}

CLASSIFIER_MODE: str = "rule"

