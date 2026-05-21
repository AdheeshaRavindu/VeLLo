from pydantic import BaseModel, Field, model_validator


class DetectRequest(BaseModel):
    image_base64: str = ""
    demo_intent: str | None = None
    include_debug: bool = False
    capture_sample: bool = False
    capture_label: str | None = None

    @model_validator(mode="after")
    def validate_payload(self) -> "DetectRequest":
        # Demo intent requests are allowed without an image payload.
        if self.demo_intent:
            return self

        if len(self.image_base64.strip()) < 16:
            raise ValueError("image_base64 must be provided for live detection")

        return self


class VoiceRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=200)

