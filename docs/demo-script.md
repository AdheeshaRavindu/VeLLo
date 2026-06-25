# Hospital Sign-to-Voice Demo Script

## Demo Positioning
- This app uses a constrained hospital communication sign set, not full sign-language translation.
- Live demo: [https://vello.adheesha.dev/](https://vello.adheesha.dev/)
- Static gatekeeper page: [https://vello-static.pages.dev/gatekeeper](https://vello-static.pages.dev/gatekeeper)

## Fast Demo Flow (2-3 minutes)
1. Open the live demo or local `/gatekeeper` page.
2. Allow camera and microphone access when the browser prompts.
3. Continue into the detection studio and confirm the camera preview is visible.
4. Show one supported sign, such as `help`, `water`, `yes`, or `stop`.
5. Wait for the recognized sign card to stabilize and speak the mapped phrase.
6. Use demo mode if lighting or camera angle makes live recognition unreliable.
7. Highlight fallback: if ElevenLabs is unavailable, browser speech still speaks the phrase.

## Supported Demo Signs
- `yes`: closed fist with optional nodding motion.
- `no`: index and middle fingers extended.
- `pain`: two index fingers extended near each other.
- `water`: W-like hand with index, middle, and ring fingers extended.
- `help`: thumb-up or loose fist supported by the other palm.
- `stop`: open-palm stop/chop pose.

## Verification Checklist
- Camera permission accepted and preview visible.
- Hand detection badge changes from "No hand detected" to "Hand detected".
- Recognized phrase card updates with confidence.
- Voice output plays for detected/demo phrase.
- Demo controls show the active hospital signs and work without camera dependency.
- If webcam lighting is poor, continue demo using Demo Mode to keep phrase+voice path reliable.

