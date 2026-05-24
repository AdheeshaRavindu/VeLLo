"""Analyze debug JSON frames exported from /api/debug and suggest threshold updates.

Usage:
  python analyze_debug_frames.py --path path/to/jsons/*.json

The script prints per-intent statistics for numeric debug metrics (e.g. thumb_palm_prox,
vertical_gap, index_gap) and basic percentile-based suggestions.
"""
from __future__ import annotations

import argparse
import glob
import json
import statistics
from collections import defaultdict
from typing import Dict, List, Any


NUMERIC_KEYS = ["thumb_palm_prox", "vertical_gap", "index_gap", "confidence"]


def load_json_file(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def gather_metrics(objects: List[Dict[str, Any]]) -> Dict[str, Dict[str, List[float]]]:
    # keyed by intent -> metric -> list of values
    data: Dict[str, Dict[str, List[float]]] = defaultdict(lambda: defaultdict(list))
    for obj in objects:
        # detection response may be top-level or nested under 'result'/'debug'
        if not isinstance(obj, dict):
            continue
        intent = obj.get("intent") or obj.get("raw_intent") or "unknown"
        # some debug responses include metrics at top-level, or under 'debug'
        source = obj
        if "debug" in obj and isinstance(obj["debug"], dict):
            source = {**obj, **obj["debug"]}

        for k in NUMERIC_KEYS:
            v = source.get(k)
            if isinstance(v, (int, float)):
                data[intent][k].append(float(v))

        # also try to pull hand-specific values if present
        # e.g. debug_landmarks.primary.thumb_palm_prox
        if "debug_landmarks" in obj and isinstance(obj["debug_landmarks"], dict):
            d = obj["debug_landmarks"]
            for hand in ("primary", "secondary"):
                if hand in d and isinstance(d[hand], dict):
                    for k in NUMERIC_KEYS:
                        v = d[hand].get(k)
                        if isinstance(v, (int, float)):
                            data[intent][f"{hand}.{k}"].append(float(v))

    return data


def summarize(lst: List[float]) -> Dict[str, float]:
    if not lst:
        return {}
    s = sorted(lst)
    return {
        "count": len(s),
        "min": s[0],
        "10%": s[max(0, int(0.1 * len(s)) - 1)],
        "25%": s[max(0, int(0.25 * len(s)) - 1)],
        "50%": statistics.median(s),
        "75%": s[min(len(s) - 1, int(0.75 * len(s)))],
        "90%": s[min(len(s) - 1, int(0.9 * len(s)))],
        "max": s[-1],
        "mean": statistics.mean(s),
    }


def print_report(data: Dict[str, Dict[str, List[float]]]) -> None:
    if not data:
        print("No numeric debug metrics found in provided files.")
        return

    for intent, metrics in data.items():
        print(f"\nIntent: {intent} — {sum(len(v) for v in metrics.values())} values")
        for k, vals in metrics.items():
            stats = summarize(vals)
            if not stats:
                continue
            print(f"  Metric: {k}")
            print(
                "    ",
                ", ".join([f"{x}: {y:.4f}" for x, y in stats.items()]),
            )
            # simple suggestion heuristics
            if k.endswith("vertical_gap"):
                # for help we typically expect a small vertical gap; show med and 90%
                print(f"      Suggest median vertical_gap ~ {stats['50%']:.4f}")
            if k.endswith("thumb_palm_prox"):
                print(f"      Suggest thumb_palm_prox 90% <= {stats['90%']:.4f}")


def collect_objects_from_paths(paths: List[str]) -> List[Dict[str, Any]]:
    objs: List[Dict[str, Any]] = []
    for p in paths:
        for path in glob.glob(p):
            try:
                o = load_json_file(path)
            except Exception as e:
                print(f"Skipping {path}: failed to load ({e})")
                continue
            # support JSONL files (list or newline-delimited)
            if isinstance(o, list):
                objs.extend(o)
            elif isinstance(o, dict):
                objs.append(o)
            else:
                # try to parse lines
                try:
                    with open(path, "r", encoding="utf-8") as fh:
                        for ln in fh:
                            ln = ln.strip()
                            if not ln:
                                continue
                            objs.append(json.loads(ln))
                except Exception:
                    continue
    return objs


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", "-p", nargs="+", required=True, help="Glob(s) to JSON or JSONL files")
    args = parser.parse_args()
    objs = collect_objects_from_paths(args.path)
    print(f"Loaded {len(objs)} debug objects from {len(args.path)} glob(s)")
    data = gather_metrics(objs)
    print_report(data)


if __name__ == "__main__":
    main()
