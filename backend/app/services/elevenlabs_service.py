import base64

import requests

from app.utils.config import get_env
from app.utils.logger import get_logger

logger = get_logger("elevenlabs")


class ElevenLabsService:
    def __init__(self) -> None:
        self.api_key = get_env("ELEVENLABS_API_KEY")
        self.voice_id = get_env("ELEVENLABS_VOICE_ID", "EXAVITQu4vr4xnSDxMaL")
        self.model_id = get_env("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2")
        self.base_url = "https://api.elevenlabs.io/v1"

    def synthesize(self, text: str) -> tuple[bool, str | None, str, str, str]:
        if not self.api_key:
            return (
                True,
                None,
                "audio/mpeg",
                "fallback",
                "ELEVENLABS_API_KEY not set. Use browser speech fallback.",
            )

        url = f"{self.base_url}/text-to-speech/{self.voice_id}"
        payload = {
            "text": text,
            "model_id": self.model_id,
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
        }
        headers = {
            "xi-api-key": self.api_key,
            "accept": "audio/mpeg",
            "content-type": "application/json",
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=20)
            if not response.ok:
                logger.warning("ElevenLabs failed: %s %s", response.status_code, response.text)
                return (
                    False,
                    None,
                    "audio/mpeg",
                    "elevenlabs",
                    f"ElevenLabs request failed ({response.status_code})",
                )
            audio_base64 = base64.b64encode(response.content).decode("utf-8")
            return (True, audio_base64, "audio/mpeg", "elevenlabs", "Voice generated")
        except requests.RequestException as exc:
            logger.exception("ElevenLabs request exception")
            return (
                False,
                None,
                "audio/mpeg",
                "elevenlabs",
                f"Voice generation error: {exc}",
            )


elevenlabs_service = ElevenLabsService()

