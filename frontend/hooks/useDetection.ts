import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { detectSign } from "@/services/api";
import type { DetectionResponse, Intent } from "@/types";
import type { TrackingSnapshot } from "@/hooks/useCamera";

const POLL_INTERVAL_MS = 250;
const LIVE_STABILITY_FRAMES = 2;
const HANDS_FREE_RESET_MS = 500;

interface UseDetectionProps {
  getTrackingSnapshot: () => TrackingSnapshot;
  enabled: boolean;
}

interface UseDetectionResult {
  detection: DetectionResponse | null;
  isDetecting: boolean;
  error: string | null;
  detectNow: () => Promise<void>;
  triggerDemoIntent: (intent: Intent) => Promise<void>;
}

export function useDetection({ getTrackingSnapshot, enabled }: UseDetectionProps): UseDetectionResult {
  const [detection, setDetection] = useState<DetectionResponse | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stableIntentRef = useRef<string | null>(null);
  const stableCountRef = useRef(0);
  const inFlightRef = useRef(false);
  const gestureLockedRef = useRef(false);
  const handsFreeSinceRef = useRef<number | null>(null);

  const runDetection = useCallback(
    async (intent: Intent | null = null) => {
      if (!enabled && !intent) {
        return;
      }

      const snapshot = getTrackingSnapshot();
      const handsPresent = Boolean(snapshot.landmarks && snapshot.landmarks.length > 0);

      if (!intent && gestureLockedRef.current) {
        if (!handsPresent) {
          const now = Date.now();
          if (handsFreeSinceRef.current === null) {
            handsFreeSinceRef.current = now;
          }
          if (now - handsFreeSinceRef.current >= HANDS_FREE_RESET_MS) {
            gestureLockedRef.current = false;
            handsFreeSinceRef.current = null;
            stableIntentRef.current = null;
            stableCountRef.current = 0;
            setDetection((prev) =>
              prev
                ? {
                    ...prev,
                    hand_detected: false,
                    intent: null,
                    phrase: null,
                  }
                : prev,
            );
          }
        } else {
          handsFreeSinceRef.current = null;
        }
        return;
      }

      if (!handsPresent && !intent) {
        stableIntentRef.current = null;
        stableCountRef.current = 0;
        setDetection((prev) =>
          prev
            ? {
                ...prev,
                hand_detected: false,
                intent: null,
                phrase: null,
              }
            : prev,
        );
        return;
      }

      try {
        if (inFlightRef.current) {
          return;
        }
        inFlightRef.current = true;
        setIsDetecting(true);
        setError(null);
        const result = await detectSign({
          landmarks: snapshot.landmarks ?? undefined,
          handedness: snapshot.handedness,
          handedness_score: snapshot.handednessScore,
          demo_intent: intent,
        });

        // Single-sign mode: surface detections immediately to avoid hiding valid "yes" frames.
        if (!intent) {
          if (result.intent && result.intent === stableIntentRef.current) {
            stableCountRef.current += 1;
          } else if (result.intent) {
            stableIntentRef.current = result.intent;
            stableCountRef.current = 1;
          } else {
            stableIntentRef.current = null;
            stableCountRef.current = 0;
          }

          if (result.intent && stableCountRef.current < LIVE_STABILITY_FRAMES) {
            setDetection({ ...result, intent: null, phrase: null });
          } else {
            setDetection(result);
            if (result.intent) {
              gestureLockedRef.current = true;
              handsFreeSinceRef.current = null;
            }
          }
        } else {
          setDetection(result);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Detection failed");
      } finally {
        inFlightRef.current = false;
        setIsDetecting(false);
      }
    },
    [enabled, getTrackingSnapshot],
  );

  const detectNow = useCallback(async () => {
    if (!enabled) {
      return;
    }
    await runDetection(null);
  }, [enabled, runDetection]);

  const triggerDemoIntent = useCallback(
    async (intent: Intent) => {
      await runDetection(intent);
    },
    [runDetection],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }
    let timer: number | undefined;

    const schedule = () => {
      timer = window.setTimeout(async () => {
        await detectNow();
        schedule();
      }, POLL_INTERVAL_MS);
    };

    schedule();
    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [detectNow, enabled]);

  return useMemo(
    () => ({ detection, isDetecting, error, detectNow, triggerDemoIntent }),
    [detection, detectNow, error, isDetecting, triggerDemoIntent],
  );
}

