import json
from pathlib import Path


def _load_phrase_map() -> dict[str, str]:
    shared_file = Path(__file__).resolve().parents[3] / "shared" / "hospital_phrases.json"
    if not shared_file.exists():
        return {}
    return json.loads(shared_file.read_text(encoding="utf-8"))


PHRASE_MAP = _load_phrase_map()


def map_intent_to_phrase(intent: str | None) -> str | None:
    if intent is None:
        return None
    return PHRASE_MAP.get(intent)

