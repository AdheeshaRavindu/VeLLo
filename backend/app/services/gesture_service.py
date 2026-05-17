from collections import deque
from dataclasses import dataclass
from time import monotonic


@dataclass
class GestureResult:
    intent: str | None
    confidence: float
    debug: dict[str, float | int | bool] | None = None


FINGER_TIPS = [4, 8, 12, 16, 20]
FINGER_PIPS = [3, 6, 10, 14, 18]
ASL_YES_WINDOW_SECONDS = 1.1
ASL_YES_MIN_FIST_SAMPLES = 3
ASL_YES_DIRECTION_EPSILON = 0.012
ASL_YES_MIN_AMPLITUDE = 0.045
_YES_MOTION_HISTORY: deque[tuple[float, float, bool]] = deque()


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


def _finger_extended(landmarks: list[list[float]], tip_idx: int, pip_idx: int) -> bool:
    tip = landmarks[tip_idx]
    pip = landmarks[pip_idx]
    wrist = landmarks[0]

    # Primary check for upright poses.
    y_based = tip[1] < pip[1]

    # Secondary distance check improves robustness for rotated hands.
    tip_wrist = _distance(tip, wrist)
    pip_wrist = _distance(pip, wrist)
    distance_based = tip_wrist > (pip_wrist * 1.06)
    return y_based or distance_based


def _is_compact_fist(landmarks: list[list[float]], palm_size: float) -> bool:
    tip_distances = [_distance(landmarks[index], landmarks[0]) / palm_size for index in FINGER_TIPS]
    return max(tip_distances) < 1.35


def _raised_mask(landmarks: list[list[float]], handedness: str | None) -> list[bool]:
    mask: list[bool] = []
    mask.append(_thumb_extended(landmarks, handedness))

    # Other fingers: tip above PIP in image coordinates (lower y is higher in frame).
    for tip_idx, pip_idx in zip(FINGER_TIPS[1:], FINGER_PIPS[1:], strict=True):
        mask.append(_finger_extended(landmarks, tip_idx, pip_idx))
    return mask


def _count_raised_fingers(mask: list[bool]) -> int:
    return sum(1 for value in mask if value)


def _record_yes_motion_sample(wrist_y: float, is_fist: bool) -> None:
    now = monotonic()
    _YES_MOTION_HISTORY.append((now, wrist_y, is_fist))
    while _YES_MOTION_HISTORY and now - _YES_MOTION_HISTORY[0][0] > ASL_YES_WINDOW_SECONDS:
        _YES_MOTION_HISTORY.popleft()


def _detect_asl_yes_motion() -> tuple[bool, float, dict[str, float | int | bool]]:
    fist_samples = [sample for sample in _YES_MOTION_HISTORY if sample[2]]
    debug: dict[str, float | int | bool] = {
        "fist_sample_count": len(fist_samples),
        "motion_amplitude": 0.0,
        "direction_changes": 0,
        "significant_delta_count": 0,
        "motion_score": 0.0,
        "passed_motion_rule": False,
    }
    if len(fist_samples) < ASL_YES_MIN_FIST_SAMPLES:
        return False, 0.0, debug

    y_values = [sample[1] for sample in fist_samples]
    amplitude = max(y_values) - min(y_values)
    debug["motion_amplitude"] = round(amplitude, 5)
    if amplitude < ASL_YES_MIN_AMPLITUDE:
        return False, 0.0, debug

    significant_deltas: list[float] = []
    for index in range(1, len(y_values)):
        delta = y_values[index] - y_values[index - 1]
        if abs(delta) >= ASL_YES_DIRECTION_EPSILON:
            significant_deltas.append(delta)
    debug["significant_delta_count"] = len(significant_deltas)

    if len(significant_deltas) < 2:
        return False, 0.0, debug

    direction_changes = 0
    for index in range(1, len(significant_deltas)):
        if significant_deltas[index - 1] * significant_deltas[index] < 0:
            direction_changes += 1
    debug["direction_changes"] = direction_changes

    if direction_changes < 1:
        return False, 0.0, debug

    motion_score = min(1.0, amplitude / (ASL_YES_MIN_AMPLITUDE * 1.35))
    debug["motion_score"] = round(motion_score, 5)
    debug["passed_motion_rule"] = True
    return True, motion_score, debug


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
    spread_norm = _distance(landmarks[8], landmarks[20]) / palm

    conf_base = max(0.55, min(0.95, detector_confidence))
    is_fist = raised_fingers == 0 and _is_compact_fist(landmarks, palm)
    _record_yes_motion_sample(landmarks[0][1], is_fist)
    yes_motion_debug: dict[str, float | int | bool] | None = None

    # Keep "help" strict so random open-palm movement does not trigger it.
    # The gesture must be a clearly spread open hand.
    if raised_fingers == 5 and spread_norm > 2.15:
        return GestureResult(intent="emergency", confidence=min(0.95, conf_base + 0.2))

    if raised_fingers == 5 and spread_norm > 1.45:
        return GestureResult(intent="help", confidence=min(0.92, conf_base + 0.15))

    if is_fist:
        asl_yes_detected, motion_score, yes_debug = _detect_asl_yes_motion()
        yes_motion_debug = yes_debug
        if asl_yes_detected:
            yes_confidence = min(0.98, conf_base + 0.1 + (0.2 * motion_score))
            yes_debug["yes_confidence"] = round(yes_confidence, 5)
            return GestureResult(
                intent="yes",
                confidence=yes_confidence,
                debug=yes_debug,
            )

    if raised_fingers == 4 and not thumb_up:
        return GestureResult(intent="stop", confidence=min(0.92, conf_base + 0.14))

    if index_up and middle_up and not ring_up and not pinky_up and not thumb_up:
        return GestureResult(intent="medicine", confidence=min(0.92, conf_base + 0.13))

    if index_up and not middle_up and not ring_up and not pinky_up and not thumb_up:
        return GestureResult(intent="doctor", confidence=min(0.9, conf_base + 0.12))

    if thumb_up and not index_up and not middle_up and not ring_up and not pinky_up:
        return GestureResult(intent="water", confidence=min(0.92, conf_base + 0.12))

    if thumb_up and index_up and not middle_up and not ring_up and not pinky_up:
        return GestureResult(intent="pain", confidence=min(0.92, conf_base + 0.11))

    if index_up and not middle_up and not ring_up and pinky_up:
        return GestureResult(intent="no", confidence=min(0.92, conf_base + 0.12))

    if thumb_up and index_up and middle_up and not ring_up and not pinky_up:
        return GestureResult(intent="thank_you", confidence=min(0.92, conf_base + 0.11))

    return GestureResult(intent=None, confidence=0.0)

