# Detect API Flow

## Live Demo
- Primary demo: [https://vello.adheesha.dev/](https://vello.adheesha.dev/)
- Static gatekeeper page: [https://vello-static.pages.dev/gatekeeper](https://vello-static.pages.dev/gatekeeper)

## Endpoint
- `POST /api/detect`

## Request
```json
{
  "image_base64": "data:image/jpeg;base64,...",
  "demo_intent": "help",
  "include_debug": false,
  "capture_sample": false,
  "capture_label": "help"
}
```

## Response
```json
{
  "hand_detected": true,
  "confidence": 0.86,
  "intent": "help",
  "canonical_asl": "HELP",
  "phrase": "Please help me.",
  "source": "vision",
  "handedness": "Right",
  "handedness_score": 0.97,
  "detector_confidence": 0.97,
  "debug_landmarks": null,
  "raw_intent": null,
  "raw_confidence": null,
  "accepted_intent": null,
  "acceptance_threshold": null,
  "accepted_phrase_available": null,
  "suppression_reason": null,
  "asl_yes_debug": null,
  "capture_saved": false,
  "error": null
}
```

## Active Intents
- `yes`
- `no`
- `pain`
- `water`
- `help`
- `stop`

## Notes
- `demo_intent` bypasses CV and returns deterministic demo output.
- `include_debug=true` adds raw landmarks and classifier decision fields to the response.
- `capture_sample=true` with a valid `capture_label` writes a JSONL row to `backend/app/data/gesture_samples.jsonl`.
- `confidence` is classifier confidence after rule/model classification.
- `detector_confidence` is MediaPipe-side detector confidence.
- `canonical_asl` returns the display label for recognized signs, such as `HELP`, `WATER`, or `HURT/PAIN`.
- When a hand is detected but no sign passes the confidence threshold, the backend may return `intent: "unknown"` with no phrase.

## Voice Flow
- `POST /api/voice` receives the accepted phrase text.
- If ElevenLabs is configured, the backend can generate voice audio.
- The frontend keeps a browser speech fallback so phrase playback still works without external voice credentials.

