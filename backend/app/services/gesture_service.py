from dataclasses import dataclass


@dataclass
class GestureResult:
    intent: str | None
    confidence: float


FINGER_TIPS = [4, 8, 12, 16, 20]
FINGER_PIPS = [3, 6, 10, 14, 18]


def _count_raised_fingers(landmarks: list[list[float]]) -> int:
    # Thumb: compare x because horizontal axis is more stable for thumb joints.
    thumb_up = landmarks[FINGER_TIPS[0]][0] > landmarks[FINGER_PIPS[0]][0]
    raised = 1 if thumb_up else 0

    # Other fingers: tip above PIP in image coordinates (lower y is higher in frame).
    for tip_idx, pip_idx in zip(FINGER_TIPS[1:], FINGER_PIPS[1:], strict=True):
        if landmarks[tip_idx][1] < landmarks[pip_idx][1]:
            raised += 1
    return raised


def _raised_mask(landmarks: list[list[float]]) -> list[bool]:
    mask: list[bool] = []
    thumb_up = landmarks[FINGER_TIPS[0]][0] > landmarks[FINGER_PIPS[0]][0]
    mask.append(thumb_up)
    for tip_idx, pip_idx in zip(FINGER_TIPS[1:], FINGER_PIPS[1:], strict=True):
        mask.append(landmarks[tip_idx][1] < landmarks[pip_idx][1])
    return mask


def _distance(point_a: list[float], point_b: list[float]) -> float:
    dx = point_a[0] - point_b[0]
    dy = point_a[1] - point_b[1]
    return (dx * dx + dy * dy) ** 0.5


def classify_gesture(landmarks: list[list[float]]) -> GestureResult:
    if len(landmarks) < 21:
        return GestureResult(intent=None, confidence=0.0)

    raised_fingers = _count_raised_fingers(landmarks)
    raised = _raised_mask(landmarks)
    thumb_up, index_up, middle_up, ring_up, pinky_up = raised
    pinch_distance = _distance(landmarks[4], landmarks[8])
    palm_spread = _distance(landmarks[8], landmarks[20])

    # ASL-inspired emergency variant: open palm with wider spread.
    if raised_fingers == 5 and palm_spread > 0.40:
        return GestureResult(intent="emergency", confidence=0.86)

    # ASL-inspired help: open palm.
    if raised_fingers == 5:
        return GestureResult(intent="help", confidence=0.82)

    if raised_fingers == 4 and not thumb_up:
        return GestureResult(intent="stop", confidence=0.84)

    if raised_fingers == 0:
        return GestureResult(intent="pain", confidence=0.8)

    if index_up and middle_up and not ring_up and not pinky_up and not thumb_up:
        return GestureResult(intent="medicine", confidence=0.83)

    if index_up and not middle_up and not ring_up and not pinky_up and not thumb_up:
        return GestureResult(intent="doctor", confidence=0.82)

    if thumb_up and not index_up and not middle_up and not ring_up and not pinky_up:
        return GestureResult(intent="water", confidence=0.78)

    if thumb_up and index_up and pinch_distance < 0.06:
        return GestureResult(intent="yes", confidence=0.8)

    if not thumb_up and index_up and not middle_up and not ring_up and pinky_up:
        return GestureResult(intent="no", confidence=0.79)

    if thumb_up and index_up and middle_up and not ring_up and not pinky_up:
        return GestureResult(intent="thank_you", confidence=0.78)

    return GestureResult(intent=None, confidence=0.0)

