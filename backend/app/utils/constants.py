SUPPORTED_INTENTS: list[str] = [
    "help",
    "water",
    "doctor",
    "medicine",
    "emergency",
    "pain",
    "yes",
    "no",
    "stop",
    "thank_you",
]

INTENT_THRESHOLDS: dict[str, float] = {
    "help": 0.74,
    "water": 0.73,
    "doctor": 0.74,
    "medicine": 0.75,
    "emergency": 0.82,
    "pain": 0.72,
    "yes": 0.78,
    "no": 0.76,
    "stop": 0.77,
    "thank_you": 0.74,
}

CLASSIFIER_MODE: str = "rule"

