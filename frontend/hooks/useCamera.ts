import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { CameraPermission } from "@/types";

interface UseCameraResult {
  videoRef: RefObject<HTMLVideoElement>;
  permission: CameraPermission;
  error: string | null;
  isReady: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startPromiseRef = useRef<Promise<void> | null>(null);
  const [permission, setPermission] = useState<CameraPermission>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    startPromiseRef.current = null;
    setIsReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      setPermission("granted");
      setIsReady(true);
      return;
    }

    if (startPromiseRef.current) {
      return startPromiseRef.current;
    }

    setPermission("requesting");
    setError(null);
    const startPromise = (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setPermission("granted");
      setIsReady(true);
    })();

    startPromiseRef.current = startPromise;

    try {
      await startPromise;
    } catch (err) {
      startPromiseRef.current = null;
      const failedStream = streamRef.current as MediaStream | null;
      if (failedStream !== null) {
        for (const track of failedStream.getTracks()) {
          track.stop();
        }
        streamRef.current = null;
      }
      setIsReady(false);
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setPermission("denied");
        setError("Camera permission denied. Please allow camera access.");
        return;
      }
      setPermission("error");
      setError("Could not start camera. Please check camera availability.");
    }
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return {
    videoRef,
    permission,
    error,
    isReady,
    startCamera,
    stopCamera,
  };
}

