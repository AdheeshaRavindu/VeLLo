# ASL Verification Report

This file documents verification of repository gesture labels against standard ASL references (Lifeprint / ASL University).

Source references:
- Lifeprint (ASL University) sign pages: https://www.lifeprint.com/asl101/pages-signs/

Findings:

- help — repo gesture: `asl_open_palm` — Verdict: Incorrect. ASL "help" uses an `A` (or `S`) hand lifted by the other hand. Source: https://www.lifeprint.com/asl101/pages-signs/h/help.htm
- water — repo gesture: `asl_thumb_up` — Verdict: Incorrect. ASL "water" uses a `W` hand tapped at the chin. Source: https://www.lifeprint.com/asl101/pages-signs/w/water.htm
- doctor — repo gesture: `asl_index_up` — Verdict: Incorrect. ASL "doctor" taps a bent/D hand at the wrist (pulse). Source: https://www.lifeprint.com/asl101/pages-signs/d/doctor.htm
- medicine — repo gesture: `asl_index_middle_up` — Verdict: Incorrect. ASL "medicine" touches middle finger to palm and pivots. Source: https://www.lifeprint.com/asl101/pages-signs/m/medicine.htm
- emergency — repo gesture: `asl_open_palm_spread` — Verdict: Incorrect. ASL "emergency" commonly uses a shaking `E` handshape. Source: https://www.lifeprint.com/asl101/pages-signs/e/emergency.htm
- pain — repo gesture: `asl_fist` — Verdict: Incorrect. ASL "pain/hurt" uses extended index fingers jabbing/twisting. Source: https://www.lifeprint.com/asl101/pages-signs/p/pain.htm
- yes — repo gesture: `asl_thumb_index_pinch` — Verdict: Incorrect. ASL "yes" is an `S` (fist) nodding motion. Source: https://www.lifeprint.com/asl101/pages-signs/y/yes.htm
- no — repo gesture: `asl_index_pinky_up` — Verdict: Incorrect. ASL "no" typically uses index+middle-to-thumb or a small side-to-side motion. Source: https://www.lifeprint.com/asl101/pages-signs/n/no.htm
- stop — repo gesture: `asl_stop_palm_no_thumb` — Verdict: Partial match. ASL "stop" is one palm up and the other chops down; repo variant may be acceptable. Source: https://www.lifeprint.com/asl101/pages-signs/s/stop.htm
- thank_you — repo gesture: `asl_thumb_index_middle_up` — Verdict: Incorrect. ASL "thank you" is a flat hand from the chin outward. Source: https://www.lifeprint.com/asl101/pages-signs/t/thankyou.htm

Notes:
- The repository labels are "ASL-inspired" but differ from standard ASL in most cases. I recommend keeping the existing model gesture names for the classifier (to avoid breaking code) and adding canonical ASL aliases (see `shared/gesture_aliases.json`).

