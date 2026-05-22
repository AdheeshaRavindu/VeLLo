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
ASL_YES_WINDOW_SECONDS = 1.6
ASL_YES_MIN_FIST_SAMPLES = 3
ASL_YES_DIRECTION_EPSILON = 0.012
ASL_YES_MIN_AMPLITUDE = 0.045
_YES_MOTION_HISTORY: deque[tuple[float, float, bool]] = deque()


@dataclass
class _HandState:
    raised_fingers: int
    thumb_up: bool
    index_up: bool
    middle_up: bool
    ring_up: bool
    pinky_up: bool
    palm_size: float
    spread_norm: float
    wrist_x: float
    wrist_y: float


HELP_MIN_VERTICAL_GAP = 0.025
HELP_MIN_SUPPORT_FINGERS = 2
HELP_MAX_THUMB_PALM_PROXIMITY = 0.35


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


def _hand_state(landmarks: list[list[float]], handedness: str | None = None) -> _HandState:
    raised = _raised_mask(landmarks, handedness)
    thumb_up, index_up, middle_up, ring_up, pinky_up = raised
    palm = _palm_size(landmarks)
    spread_norm = _distance(landmarks[8], landmarks[20]) / palm
    return _HandState(
        raised_fingers=_count_raised_fingers(raised),
        thumb_up=thumb_up,
        index_up=index_up,
        middle_up=middle_up,
        ring_up=ring_up,
        pinky_up=pinky_up,
        palm_size=palm,
        spread_norm=spread_norm,
        wrist_x=landmarks[0][0],
        wrist_y=landmarks[0][1],
    )


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
    secondary_landmarks: list[list[float]] | None = None,
    secondary_handedness: str | None = None,
) -> GestureResult:
    if len(landmarks) < 21:
        return GestureResult(intent=None, confidence=0.0)

    primary = _hand_state(landmarks, handedness)
    secondary = _hand_state(secondary_landmarks, secondary_handedness) if secondary_landmarks else None

    conf_base = max(0.55, min(0.95, detector_confidence))
    is_fist = primary.raised_fingers == 0 and _is_compact_fist(landmarks, primary.palm_size)
    _record_yes_motion_sample(primary.wrist_y, is_fist)
    yes_motion_debug: dict[str, float | int | bool] | None = None

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

    if primary.raised_fingers == 0 and is_fist:
        # Fallback for static ASL "yes" (closed fist) when motion cue is weak.
        return GestureResult(
            intent="yes",
            confidence=min(0.86, conf_base + 0.04),
            debug=yes_motion_debug,
        )

    # Canonical ASL "help" is a loose A/S hand supported from below by the other hand.
    if primary.raised_fingers <= 1:
        # Prefer the two-hand canonical layout: thumb-up resting on open palm.
        if secondary is not None:
            vertical_gap = secondary.wrist_y - primary.wrist_y
            support_hand_open = secondary.raised_fingers >= HELP_MIN_SUPPORT_FINGERS or secondary.spread_norm > 0.9
            support_under_primary = vertical_gap >= HELP_MIN_VERTICAL_GAP
            # compute palm centre for secondary (approx wrist + palm base)
            sec_palm_center = ((secondary.wrist_x + (landmarks[9][0] if len(landmarks) > 9 else secondary.wrist_x)) / 2,
                               (secondary.wrist_y + (landmarks[9][1] if len(landmarks) > 9 else secondary.wrist_y)) / 2)
            # primary thumb tip location
            try:
                thumb_tip = landmarks[4]
                thumb_palm_prox = _distance(thumb_tip, sec_palm_center) / max(primary.palm_size, secondary.palm_size)
            except Exception:
                thumb_palm_prox = 1.0

            if support_hand_open and support_under_primary and thumb_palm_prox <= HELP_MAX_THUMB_PALM_PROXIMITY:
                debug = {"vertical_gap": round(vertical_gap, 4), "thumb_palm_prox": round(thumb_palm_prox, 4)}
                return GestureResult(intent="help", confidence=min(0.96, conf_base + 0.16), debug=debug)

        # One-hand fallback for the loose A/S hand itself, but keep it conservative.
        if primary.raised_fingers == 0 or primary.raised_fingers == 1:
            return GestureResult(intent="help", confidence=min(0.78, conf_base + 0.03))

    # Canonical ASL "stop" uses an open palm chopped into/against the support hand.
    if primary.raised_fingers >= 4 and secondary is not None:
        if secondary.raised_fingers >= 4 and abs(primary.wrist_x - secondary.wrist_x) < 0.18:
            return GestureResult(intent="stop", confidence=min(0.88, conf_base + 0.08))
    if primary.raised_fingers == 4 and not primary.thumb_up:
        return GestureResult(intent="stop", confidence=min(0.8, conf_base + 0.04))

    # Canonical ASL "water" is a W hand tapped at the mouth.
    if primary.index_up and primary.middle_up and primary.ring_up and not primary.thumb_up and not primary.pinky_up:
        return GestureResult(intent="water", confidence=min(0.92, conf_base + 0.14))

    # Canonical ASL "pain" is two index fingers brought together/twisted.
    if secondary is not None:
        primary_pain = primary.index_up and not primary.middle_up and not primary.ring_up and not primary.pinky_up
        secondary_pain = secondary.index_up and not secondary.middle_up and not secondary.ring_up and not secondary.pinky_up
        index_gap = _distance(landmarks[8], secondary_landmarks[8]) / max(primary.palm_size, secondary.palm_size)
        # allow a larger gap tolerance to account for varied camera angles
        if primary_pain and secondary_pain and index_gap < 1.3:
            debug = {"index_gap": round(index_gap, 4)}
            return GestureResult(intent="pain", confidence=min(0.94, conf_base + 0.12), debug=debug)

    # Canonical ASL "no" is a small side-to-side movement with the index and middle fingers.
    if primary.index_up and primary.middle_up and not primary.ring_up and not primary.pinky_up and not primary.thumb_up:
        return GestureResult(intent="no", confidence=min(0.9, conf_base + 0.1))

    return GestureResult(intent=None, confidence=0.0)

