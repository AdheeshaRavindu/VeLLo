# ASL Verification Report

This file documents verification of repository gesture labels against standard ASL references (Lifeprint / ASL University). The app currently exposes six hospital-focused signs: `yes`, `no`, `pain`, `water`, `help`, and `stop`.

Source references:
- Lifeprint (ASL University) sign pages: https://www.lifeprint.com/asl101/pages-signs/

## Active Sign Findings

- `help`: Canonical ASL uses an `A` or `S` hand lifted by the other hand. The detector now prefers a thumb-up or loose fist supported by an open palm. Source: https://www.lifeprint.com/asl101/pages-signs/h/help.htm
- `water`: Canonical ASL uses a `W` hand tapped at the chin. The detector recognizes the W-like handshape; it does not require chin contact. Source: https://www.lifeprint.com/asl101/pages-signs/w/water.htm
- `pain`: Canonical ASL uses extended index fingers jabbing or twisting near each other. The detector recognizes two visible index fingers close together. Source: https://www.lifeprint.com/asl101/pages-signs/p/pain.htm
- `yes`: Canonical ASL is an `S` hand/fist nodding motion. The detector recognizes a closed fist and uses short up/down motion when available. Source: https://www.lifeprint.com/asl101/pages-signs/y/yes.htm
- `no`: Canonical ASL uses index and middle fingers closing to the thumb or a small side-to-side movement. The detector recognizes the index+middle handshape. Source: https://www.lifeprint.com/asl101/pages-signs/n/no.htm
- `stop`: Canonical ASL is one palm chopping down into the other palm. The detector prefers a two-hand stop/chop pose and includes a one-hand fallback. Source: https://www.lifeprint.com/asl101/pages-signs/s/stop.htm

## Legacy Alias Records

The shared alias file also contains older labels that are not part of the active supported intent set:

- `doctor`: ASL "doctor" taps a bent/D hand at the wrist. Source: https://www.lifeprint.com/asl101/pages-signs/d/doctor.htm
- `medicine`: ASL "medicine" touches middle finger to palm and pivots. Source: https://www.lifeprint.com/asl101/pages-signs/m/medicine.htm
- `emergency`: ASL "emergency" commonly uses a shaking `E` handshape. Source: https://www.lifeprint.com/asl101/pages-signs/e/emergency.htm
- `thank_you`: ASL "thank you" is a flat hand from the chin outward. Source: https://www.lifeprint.com/asl101/pages-signs/t/thankyou.htm

Notes:
- The detector is optimized for a constrained hospital communication workflow. `shared/gesture_aliases.json` keeps canonical ASL display labels separate from internal classifier intent names.

