SUPPORTED_INTENTS: list[str] = [
    "yes",
    "no",
    "help",
    "water",
    "medicine",
    "emergency",
    "pain",
    "stop",
    "thank_you",
]

INTENT_THRESHOLDS: dict[str, float] = {
    "yes": 0.72,
    "no": 0.72,
    "help": 0.72,
    "water": 0.72,
    "medicine": 0.72,
    "emergency": 0.72,
    "pain": 0.72,
    "stop": 0.72,
    "thank_you": 0.72,
}

CLASSIFIER_MODE: str = "rule"

