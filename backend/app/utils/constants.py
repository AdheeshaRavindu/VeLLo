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
    "help": 0.70,
    "water": 0.70,
    "doctor": 0.70,
    "medicine": 0.70,
    "emergency": 0.75,
    "pain": 0.70,
    "yes": 0.70,
    "no": 0.70,
    "stop": 0.70,
    "thank_you": 0.70,
}

