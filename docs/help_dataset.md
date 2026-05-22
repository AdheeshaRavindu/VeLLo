# Help sign dataset and training notes

Quick capture procedure
- Run `python backend/scripts/collect_help_samples.py` with a webcam available.
- Use the controls shown: `H` to set label `help`, `N` to set `not_help`, `S` to save a burst of frames (multiple consecutive frames saved), `Q` to quit.
- By default each `S` press saves 10 consecutive frames. You can change the burst count by editing `DEFAULT_BURST_COUNT` in `backend/scripts/collect_help_samples.py`.
- You don't need 300 distinct held poses — capture short bursts while the signer holds the sign for 0.5–1s. 30–50 bursts per class with 10 frames each gives 300–500 frames.

CSV format
- `backend/data/help_samples.csv` with header: `label, p0_x, p0_y, p0_z, ..., p20_z, s0_x, ..., s20_z, timestamp`
- Primary hand (p*) is first hand returned by MediaPipe; secondary (s*) is second hand if present or zeros.

Training
- Run `python backend/scripts/train_help_detector.py` to train a small MLP classifier on flattened landmarks. Model is saved to `backend/models/help_detector.pkl`.
- Tune thresholds and validation splits; collect more negative examples (hands near face, other gestures) to reduce false positives.

Integration
- Load the saved `help_detector.pkl` in `backend/app/services/model_classifier_service.py` or `classification_service.py` and use it as a fallback when rule heuristics are uncertain.

Recommended next steps
- Add a small evaluation script to compute precision/recall on a held-out test set.
- Add per-signer metadata (camera angle, handedness) to the CSV to facilitate stratified sampling.
