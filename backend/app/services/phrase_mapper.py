import json
from pathlib import Path


DEFAULT_PHRASE_MAP: dict[str, str] = {
    "yes": "Yes.",
    "no": "No.",
    "pain": "I am in pain.",
    "water": "I need water.",
    "help": "Please help me.",
    "i_need_help": "Please help me.",
    "stop": "Please stop.",
}


def _candidate_phrase_files() -> list[Path]:
    root = Path(__file__).resolve()
    return [
        root.parents[3] / "shared" / "hospital_phrases.json",
        root.parents[2] / "shared" / "hospital_phrases.json",
        Path("/shared/hospital_phrases.json"),
    ]


def _load_phrase_map() -> dict[str, str]:
    for shared_file in _candidate_phrase_files():
        if not shared_file.exists():
            continue
        loaded = json.loads(shared_file.read_text(encoding="utf-8"))
        if isinstance(loaded, dict):
            return {**DEFAULT_PHRASE_MAP, **loaded}
    return DEFAULT_PHRASE_MAP.copy()


PHRASE_MAP = _load_phrase_map()


def map_intent_to_phrase(intent: str | None) -> str | None:
    if intent is None:
        return None
    return PHRASE_MAP.get(intent)

