"""Capture hand landmarks with MediaPipe and label samples for 'help' detection.

Controls while running the camera window:
- H: set current label to 'help'
- N: set current label to 'not_help'
- S: save current frame landmarks with current label
- Q: quit

Output CSV: backend/data/help_samples.csv
Format: label, p0_x, p0_y, p0_z, ..., p20_z, s0_x, ..., s20_z, timestamp
"""
import csv
import os
from datetime import datetime

import cv2
import mediapipe as mp

OUT_CSV = os.path.join(os.path.dirname(__file__), '..', 'data', 'help_samples.csv')
# Number of consecutive frames to save on each snapshot (helps collect many samples quickly)
DEFAULT_BURST_COUNT = 10

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils


def flatten_hand_landmarks(hand_landmarks):
    if hand_landmarks is None:
        return [0.0] * (21 * 3)
    vals = []
    for lm in hand_landmarks.landmark:
        vals.extend([lm.x, lm.y, lm.z])
    return vals


def ensure_header(path):
    if not os.path.exists(path):
        cols = ['label'] + [f'p{i}_{c}' for i in range(21) for c in ('x', 'y', 'z')] + [f's{i}_{c}' for i in range(21) for c in ('x', 'y', 'z')] + ['timestamp']
        with open(path, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(cols)


def main(burst_count: int = DEFAULT_BURST_COUNT):
    ensure_header(OUT_CSV)

    cap = cv2.VideoCapture(0)
    with mp_hands.Hands(min_detection_confidence=0.5, min_tracking_confidence=0.5, max_num_hands=2) as hands:
        print('Controls: H=help, N=not_help, S=save (burst), Q=quit')
        print(f'Burst count per save: {burst_count}')
        current_label = 'help'
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img.flags.writeable = False
            results = hands.process(img)
            img.flags.writeable = True
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

            primary = None
            secondary = None
            if results.multi_hand_landmarks:
                primary = results.multi_hand_landmarks[0]
                if len(results.multi_hand_landmarks) > 1:
                    secondary = results.multi_hand_landmarks[1]
                for hl in results.multi_hand_landmarks:
                    mp_drawing.draw_landmarks(img, hl, mp_hands.HAND_CONNECTIONS)

            cv2.putText(img, f'Label: {current_label}', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.imshow('collect_help_samples', img)

            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            if key == ord('h'):
                current_label = 'help'
            if key == ord('n'):
                current_label = 'not_help'
            if key == ord('s'):
                # Save a burst of consecutive frames to rapidly build dataset
                saved = 0
                for i in range(burst_count):
                    # Use the most recent frame (frame already acquired for i==0)
                    if i > 0:
                        ret, frame = cap.read()
                        if not ret:
                            break
                        img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        img.flags.writeable = False
                        results = hands.process(img)
                        img.flags.writeable = True
                    primary = results.multi_hand_landmarks[0] if results.multi_hand_landmarks else None
                    secondary = results.multi_hand_landmarks[1] if results.multi_hand_landmarks and len(results.multi_hand_landmarks) > 1 else None
                    ph = flatten_hand_landmarks(primary)
                    sh = flatten_hand_landmarks(secondary)
                    row = [current_label] + ph + sh + [datetime.utcnow().isoformat()]
                    with open(OUT_CSV, 'a', newline='') as f:
                        writer = csv.writer(f)
                        writer.writerow(row)
                    saved += 1
                print(f'Saved {saved} samples labeled {current_label}')

    cap.release()
    cv2.destroyAllWindows()


if __name__ == '__main__':
    main()
