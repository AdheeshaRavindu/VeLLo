from collections import deque
from dataclasses import dataclass
from time import monotonic

from app.utils.constants import SUPPORTED_INTENTS


@dataclass
class GestureResult:
    intent: str | None
    confidence: float
    debug: dict[str, float | int | bool] | None = None


FINGER_TIPS = [4, 8, 12, 16, 20]
FINGER_PIPS = [3, 6, 10, 14, 18]
ASL_YES_WINDOW_SECONDS = 1.6
ASL_YES_MIN_FIST_SAMPLES = 3
ASL_YES_DIRECTION_EPSILON = 0.012
ASL_YES_MIN_AMPLITUDE = 0.045
_YES_MOTION_HISTORY: deque[tuple[float, float, bool]] = deque()
OPEN_PALM_STABILITY_WINDOW_SECONDS = 0.8
OPEN_PALM_MAX_WRIST_AMPLITUDE = 0.055
_WRIST_HISTORY: deque[tuple[float, float]] = deque()


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


def _mean_tip_distance_from_wrist_norm(landmarks: list[list[float]], palm: float) -> float:
    wrist = landmarks[0]
    tip_indices = [8, 12, 16, 20]
    distances = [_distance(wrist, landmarks[idx]) / palm for idx in tip_indices]
    return sum(distances) / len(distances)


def _record_yes_motion_sample(wrist_y: float, is_fist: bool) -> None:
    now = monotonic()
    _YES_MOTION_HISTORY.append((now, wrist_y, is_fist))
    while _YES_MOTION_HISTORY and now - _YES_MOTION_HISTORY[0][0] > ASL_YES_WINDOW_SECONDS:
        _YES_MOTION_HISTORY.popleft()


def _record_wrist_sample(wrist_y: float) -> None:
    now = monotonic()
    _WRIST_HISTORY.append((now, wrist_y))
    while _WRIST_HISTORY and now - _WRIST_HISTORY[0][0] > OPEN_PALM_STABILITY_WINDOW_SECONDS:
        _WRIST_HISTORY.popleft()


def _wrist_motion_amplitude() -> float:
    if len(_WRIST_HISTORY) < 2:
        return 0.0
    y_values = [sample[1] for sample in _WRIST_HISTORY]
    return max(y_values) - min(y_values)


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


def _recent_fist_like_count() -> int:
    return sum(1 for _, _, is_fist in _YES_MOTION_HISTORY if is_fist)


def detect_two_hand_help(
    landmarks_a: list[list[float]],
    landmarks_b: list[list[float]],
    handedness_a: str | None = None,
    handedness_b: str | None = None,
) -> tuple[bool, float]:
    if len(landmarks_a) < 21 or len(landmarks_b) < 21:
        return False, 0.0

    def _analyze_hand(landmarks: list[list[float]], handedness: str | None) -> dict[str, float | int | bool]:
        mask = _raised_mask(landmarks, handedness)
        raised_count = _count_raised_fingers(mask)
        thumb_up, index_up, middle_up, ring_up, pinky_up = mask
        palm = _palm_size(landmarks)
        spread = _distance(landmarks[8], landmarks[20]) / palm
        mean_tip = _mean_tip_distance_from_wrist_norm(landmarks, palm)
        thumb_only = thumb_up and not index_up and not middle_up and not ring_up and not pinky_up
        return {
            "raised_count": raised_count,
            "thumb_only": thumb_only,
            "open_palm": raised_count >= 3 and spread > 0.9 and mean_tip > 1.35,
            "palm_size": palm,
            "thumb_tip_x": landmarks[4][0],
            "thumb_tip_y": landmarks[4][1],
            "palm_center_x": (landmarks[0][0] + landmarks[9][0]) / 2.0,
            "palm_center_y": (landmarks[0][1] + landmarks[9][1]) / 2.0,
        }

    hand_a = _analyze_hand(landmarks_a, handedness_a)
    hand_b = _analyze_hand(landmarks_b, handedness_b)

    pairings = ((hand_a, hand_b), (hand_b, hand_a))
    for thumb_hand, palm_hand in pairings:
        if not bool(thumb_hand["thumb_only"]) or not bool(palm_hand["open_palm"]):
            continue
        dx = float(thumb_hand["thumb_tip_x"]) - float(palm_hand["palm_center_x"])
        dy = float(thumb_hand["thumb_tip_y"]) - float(palm_hand["palm_center_y"])
        distance = (dx * dx + dy * dy) ** 0.5
        if distance <= float(palm_hand["palm_size"]) * 1.45:
            confidence = min(0.98, 0.9 + max(0.0, 0.2 - distance))
            return True, confidence

    return False, 0.0


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
    mean_tip_distance_norm = _mean_tip_distance_from_wrist_norm(landmarks, palm)

    conf_base = max(0.55, min(0.95, detector_confidence))
    fist_like_geometry = mean_tip_distance_norm < 1.62 and spread_norm < 1.35
    _record_yes_motion_sample(landmarks[0][1], fist_like_geometry)
    _record_wrist_sample(landmarks[0][1])
    yes_motion_debug: dict[str, float | int | bool] | None = None
    wrist_amplitude = _wrist_motion_amplitude()

    # Only emit intents that are enabled in backend constants.
    if raised_fingers == 5 and spread_norm > 1.8 and "emergency" in SUPPORTED_INTENTS:
        return GestureResult(intent="emergency", confidence=min(0.95, conf_base + 0.2))

    if fist_like_geometry:
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

    recent_fist_count = _recent_fist_like_count()
    thumb_only = thumb_up and not index_up and not middle_up and not ring_up and not pinky_up
    # Fallback one-hand help variant: thumb-up with folded fingers held steadily.
    if thumb_only and wrist_amplitude <= 0.09 and recent_fist_count <= 6:
        return GestureResult(intent="help", confidence=min(0.94, conf_base + 0.16))

    # Help: accept a broader open-hand family, but only when it is stable and not fist-like.
    open_finger_count = int(index_up) + int(middle_up) + int(ring_up) + int(pinky_up) + int(thumb_up)
    non_thumb_fingers_up = index_up and middle_up and ring_up and pinky_up
    looks_like_open_palm = mean_tip_distance_norm > 1.52 and spread_norm > 1.02
    stable_open_palm = wrist_amplitude <= OPEN_PALM_MAX_WRIST_AMPLITUDE
    candidate_help_pose = (raised_fingers == 5 and looks_like_open_palm) or (
        non_thumb_fingers_up and spread_norm > 1.18 and looks_like_open_palm
    ) or (open_finger_count >= 4 and looks_like_open_palm)
    if candidate_help_pose:
        if stable_open_palm and not fist_like_geometry and recent_fist_count <= 1:
            openness_bonus = min(0.06, max(0.0, (open_finger_count - 3) * 0.02))
            return GestureResult(intent="help", confidence=min(0.97, conf_base + 0.18 + openness_bonus))

    # Keep stop separate from help-like open palms with uncertain thumb visibility.
    if raised_fingers == 4 and not thumb_up and spread_norm < 1.25:
        return GestureResult(intent="stop", confidence=min(0.9, conf_base + 0.14))

    if raised_fingers == 0:
        return GestureResult(
            intent="pain",
            confidence=min(0.9, conf_base + 0.12),
            debug=yes_motion_debug,
        )

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

