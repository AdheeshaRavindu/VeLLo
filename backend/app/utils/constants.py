SUPPORTED_INTENTS: list[str] = [
    "yes",
    "no",
    "i_need_help",
]

INTENT_THRESHOLDS: dict[str, float] = {
    "yes": 0.72,
    "no": 0.72,
    "i_need_help": 0.9,
}

CLASSIFIER_MODE: str = "rule"

