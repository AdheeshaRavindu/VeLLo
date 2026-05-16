import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import type { CameraPermission } from "@/types";

const HAND_LANDMARKER_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const TRACKING_INTERVAL_MS = 33;

export interface TrackingSnapshot {
  landmarks: number[][] | null;
  handedness: "Left" | "Right" | null;
  handednessScore: number;
}

interface UseCameraResult {
  videoRef: RefObject<HTMLVideoElement>;
  permission: CameraPermission;
  error: string | null;
  isReady: boolean;
  handDetected: boolean;
  trackingSnapshot: TrackingSnapshot;
  getTrackingSnapshot: () => TrackingSnapshot;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTrackingAtRef = useRef(0);
  const trackingSnapshotRef = useRef<TrackingSnapshot>({
    landmarks: null,
    handedness: null,
    handednessScore: 0,
  });
  const [permission, setPermission] = useState<CameraPermission>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [trackingSnapshot, setTrackingSnapshot] = useState<TrackingSnapshot>({
    landmarks: null,
    handedness: null,
    handednessScore: 0,
  });
  const [handDetected, setHandDetected] = useState(false);

  const updateTrackingSnapshot = useCallback((snapshot: TrackingSnapshot) => {
    trackingSnapshotRef.current = snapshot;
    setTrackingSnapshot(snapshot);
    setHandDetected(Boolean(snapshot.landmarks && snapshot.landmarks.length > 0));
  }, []);

  const trackHands = useCallback(() => {
    const video = videoRef.current;
    const handLandmarker = handLandmarkerRef.current;
    if (!video || !handLandmarker || video.readyState < 2) {
      animationFrameRef.current = window.requestAnimationFrame(trackHands);
      return;
    }

    const now = performance.now();
    if (now - lastTrackingAtRef.current >= TRACKING_INTERVAL_MS) {
      lastTrackingAtRef.current = now;
      const results = handLandmarker.detectForVideo(video, now);
      if (results.landmarks.length > 0) {
        const primary = results.landmarks[0];
        const landmarks = primary.map((point) => [point.x, point.y, point.z]);
        const handednessCategory = results.handednesses[0]?.[0];
        const handedness = (handednessCategory?.categoryName as "Left" | "Right" | undefined) ?? null;
        const handednessScore = handednessCategory?.score ?? 0;
        updateTrackingSnapshot({
          landmarks,
          handedness,
          handednessScore,
        });
      } else {
        updateTrackingSnapshot({
          landmarks: null,
          handedness: null,
          handednessScore: 0,
        });
      }
    }

    animationFrameRef.current = window.requestAnimationFrame(trackHands);
  }, [updateTrackingSnapshot]);

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (handLandmarkerRef.current) {
      handLandmarkerRef.current.close();
      handLandmarkerRef.current = null;
    }
    updateTrackingSnapshot({
      landmarks: null,
      handedness: null,
      handednessScore: 0,
    });
    setIsReady(false);
    setHandDetected(false);
  }, [updateTrackingSnapshot]);

  const ensureHandLandmarker = useCallback(async () => {
    if (handLandmarkerRef.current) {
      return handLandmarkerRef.current;
    }
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
    );
    handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: HAND_LANDMARKER_MODEL_URL,
      },
      runningMode: "VIDEO",
      numHands: 1,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    return handLandmarkerRef.current;
  }, []);

  const startCamera = useCallback(async () => {
    setPermission("requesting");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      await ensureHandLandmarker();
      animationFrameRef.current = window.requestAnimationFrame(trackHands);

      setPermission("granted");
      setIsReady(true);
    } catch (err) {
      setIsReady(false);
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setPermission("denied");
        setError("Camera permission denied. Please allow camera access.");
        return;
      }
      setPermission("error");
      setError("Could not start camera. Please check camera availability.");
    }
  }, [ensureHandLandmarker, trackHands]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return {
    videoRef,
    permission,
    error,
    isReady,
    handDetected,
    trackingSnapshot,
    getTrackingSnapshot: () => trackingSnapshotRef.current,
    startCamera,
    stopCamera,
  };
}

