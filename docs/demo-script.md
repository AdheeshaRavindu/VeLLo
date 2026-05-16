# Hospital Sign-to-Voice Demo Script

## Demo Positioning
- This MVP uses an ASL-inspired hospital command subset (10 intents), not full sign-language translation.

## Fast Demo Flow (2-3 minutes)
1. Open `/detect` page and confirm camera preview.
2. In Live Camera mode, show open palm to trigger `help` and hear voice output.
3. Switch to Demo Mode (ASL-inspired 10-intent panel).
4. Tap `emergency`, `water`, `doctor`, `medicine`, `yes`, and `stop` to show fast intent-to-voice mapping.
5. Highlight fallback: if ElevenLabs key is missing, browser speech still speaks phrase.
6. Close with reliability statement: constrained ASL-inspired set for urgent hospital communication.

## Verification Checklist
- Camera permission accepted and preview visible.
- Hand detection badge changes from "No hand detected" to "Hand detected".
- Recognized phrase card updates with confidence.
- Voice output plays for detected/demo phrase.
- Demo buttons show only 10 active intents and work without camera dependency.
- If webcam lighting is poor, continue demo using Demo Mode to keep phrase+voice path reliable.

