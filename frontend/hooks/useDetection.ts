import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";

import { detectSign } from "@/services/api";
import type { DetectionResponse, Intent } from "@/types";

const POLL_INTERVAL_MS = 800;

interface UseDetectionProps {
  videoRef: RefObject<HTMLVideoElement>;
  enabled: boolean;
}

interface UseDetectionResult {
  detection: DetectionResponse | null;
  isDetecting: boolean;
  error: string | null;
  detectNow: () => Promise<void>;
  triggerDemoIntent: (intent: Intent) => Promise<void>;
}

export function useDetection({ videoRef, enabled }: UseDetectionProps): UseDetectionResult {
  const [detection, setDetection] = useState<DetectionResponse | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stableIntentRef = useRef<string | null>(null);
  const stableCountRef = useRef(0);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  }, [videoRef]);

  const runDetection = useCallback(
    async (intent: Intent | null = null) => {
      if (!enabled && !intent) {
        return;
      }

      const image = captureFrame();
      if (!image && !intent) {
        return;
      }

      try {
        setIsDetecting(true);
        setError(null);
        const result = await detectSign({
          image_base64: image ?? "",
          demo_intent: intent,
        });

        // Require two consecutive same intents before showing phrase in live mode.
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

          if (result.intent && stableCountRef.current < 2) {
            setDetection({ ...result, intent: null, phrase: null });
          } else {
            setDetection(result);
          }
        } else {
          setDetection(result);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Detection failed");
      } finally {
        setIsDetecting(false);
      }
    },
    [captureFrame, enabled],
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
    const timer = window.setInterval(() => {
      void detectNow();
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [detectNow, enabled]);

  return useMemo(
    () => ({ detection, isDetecting, error, detectNow, triggerDemoIntent }),
    [detection, detectNow, error, isDetecting, triggerDemoIntent],
  );
}

