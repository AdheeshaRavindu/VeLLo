from dataclasses import dataclass


@dataclass
class GestureResult:
    intent: str | None
    confidence: float


FINGER_TIPS = [4, 8, 12, 16, 20]
FINGER_PIPS = [3, 6, 10, 14, 18]


def _distance(point_a: list[float], point_b: list[float]) -> float:
    dx = point_a[0] - point_b[0]
    dy = point_a[1] - point_b[1]
    return (dx * dx + dy * dy) ** 0.5


def _palm_size(landmarks: list[list[float]]) -> float:
    # Wrist to middle MCP is stable enough as a normalization scale.
    size = _distance(landmarks[0], landmarks[9])
    return max(size, 1e-4)


def _thumb_extended(landmarks: list[list[float]], handedness: str | None) -> bool:
    palm = _palm_size(landmarks)
    tip = landmarks[4]
    ip = landmarks[3]
    index_mcp = landmarks[5]

    extension_ratio = (_distance(tip, index_mcp) - _distance(ip, index_mcp)) / palm
    lateral_ratio = abs(tip[0] - ip[0]) / palm

    direction_ok = True
    if handedness == "Right":
        direction_ok = tip[0] < ip[0]
    elif handedness == "Left":
        direction_ok = tip[0] > ip[0]

    return (extension_ratio > 0.12 and lateral_ratio > 0.08 and direction_ok) or (
        extension_ratio > 0.2
    )


def _raised_mask(landmarks: list[list[float]], handedness: str | None) -> list[bool]:
    mask: list[bool] = []
    mask.append(_thumb_extended(landmarks, handedness))

    # Other fingers: tip above PIP in image coordinates (lower y is higher in frame).
    for tip_idx, pip_idx in zip(FINGER_TIPS[1:], FINGER_PIPS[1:], strict=True):
        mask.append(landmarks[tip_idx][1] < landmarks[pip_idx][1])
    return mask


def _count_raised_fingers(mask: list[bool]) -> int:
    return sum(1 for value in mask if value)


def classify_gesture(
    landmarks: list[list[float]],
    handedness: str | None = None,
    detector_confidence: float = 0.7,
) -> GestureResult:
    if len(landmarks) < 21:
        return GestureResult(intent=None, confidence=0.0)

    raised = _raised_mask(landmarks, handedness)
    raised_fingers = _count_raised_fingers(raised)
    thumb_up, index_up, middle_up, ring_up, pinky_up = raised
    palm = _palm_size(landmarks)
    pinch_norm = _distance(landmarks[4], landmarks[8]) / palm
    spread_norm = _distance(landmarks[8], landmarks[20]) / palm

    conf_base = max(0.55, min(0.95, detector_confidence))

    # Priority ordering reduces collisions among similar open-hand signs.
    if raised_fingers == 5 and spread_norm > 1.8:
        return GestureResult(intent="emergency", confidence=min(0.95, conf_base + 0.2))

    if raised_fingers == 5:
        return GestureResult(intent="help", confidence=min(0.9, conf_base + 0.15))

    if thumb_up and index_up and pinch_norm < 0.25:
        return GestureResult(intent="yes", confidence=min(0.9, conf_base + 0.12))

    if raised_fingers == 4 and not thumb_up:
        return GestureResult(intent="stop", confidence=min(0.9, conf_base + 0.14))

    if raised_fingers == 0:
        return GestureResult(intent="pain", confidence=min(0.9, conf_base + 0.12))

    if index_up and middle_up and not ring_up and not pinky_up and not thumb_up:
        return GestureResult(intent="medicine", confidence=min(0.9, conf_base + 0.13))

    if index_up and not middle_up and not ring_up and not pinky_up and not thumb_up:
        return GestureResult(intent="doctor", confidence=min(0.9, conf_base + 0.12))

    if thumb_up and not index_up and not middle_up and not ring_up and not pinky_up:
        return GestureResult(intent="water", confidence=min(0.88, conf_base + 0.1))

    if not thumb_up and index_up and not middle_up and not ring_up and pinky_up:
        return GestureResult(intent="no", confidence=min(0.88, conf_base + 0.11))

    if thumb_up and index_up and middle_up and not ring_up and not pinky_up:
        return GestureResult(intent="thank_you", confidence=min(0.88, conf_base + 0.1))

    return GestureResult(intent=None, confidence=0.0)

