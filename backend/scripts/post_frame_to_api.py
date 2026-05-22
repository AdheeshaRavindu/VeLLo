"""Capture a single webcam frame, encode as base64, and POST to /api/detect

Usage:
    python backend/scripts/post_frame_to_api.py
"""
import base64
import json
import cv2
import requests
import sys

API_URL = 'http://localhost:8000/api/detect'


def capture_frame():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print('Cannot open webcam')
        return None
    ret, frame = cap.read()
    cap.release()
    if not ret:
        print('Failed to capture frame')
        return None
    _, buf = cv2.imencode('.jpg', frame)
    return base64.b64encode(buf.tobytes()).decode('ascii')


def main():
    b64 = capture_frame()
    if b64 is None:
        sys.exit(1)
    payload = {
        'image_base64': b64,
        'demo_intent': None,
        'include_debug': True
    }
    try:
        resp = requests.post(API_URL, json=payload, timeout=10)
        print('Status:', resp.status_code)
        print(json.dumps(resp.json(), indent=2))
    except Exception as e:
        print('Request failed:', e)


if __name__ == '__main__':
    main()
