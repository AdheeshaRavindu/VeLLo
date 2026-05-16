from fastapi import APIRouter

from app.models.request_models import VoiceRequest
from app.models.response_models import VoiceResponse
from app.services.elevenlabs_service import elevenlabs_service

router = APIRouter(prefix="/api", tags=["voice"])


@router.post("/voice", response_model=VoiceResponse)
def generate_voice(payload: VoiceRequest) -> VoiceResponse:
    ok, audio_base64, content_type, provider, message = elevenlabs_service.synthesize(payload.text)
    return VoiceResponse(
        ok=ok,
        audio_base64=audio_base64,
        content_type=content_type,
        provider=provider,
        message=message,
    )

