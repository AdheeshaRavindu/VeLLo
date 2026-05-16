# Hospital Sign-to-Voice Demo Script

## Fast Demo Flow (2-3 minutes)
1. Open `/detect` page and confirm camera preview.
2. Show open palm to trigger `help` and hear voice output.
3. Switch to Demo Mode.
4. Tap `emergency`, `water`, `doctor`, and `toilet` buttons to show fast intent-to-voice mapping.
5. Highlight fallback: if ElevenLabs key is missing, browser speech still speaks phrase.

## Verification Checklist
- Camera permission accepted and preview visible.
- Hand detection badge changes from "No hand detected" to "Hand detected".
- Recognized phrase card updates with confidence.
- Voice output plays for detected/demo phrase.
- Demo buttons work without camera dependency.

