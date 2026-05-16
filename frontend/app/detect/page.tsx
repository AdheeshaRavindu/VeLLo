"use client";

import { useEffect, useState } from "react";
import AudioPlayer from "@/components/AudioPlayer";
import CameraFeed from "@/components/CameraFeed";
import DetectionStatus from "@/components/DetectionStatus";
import DemoButtons from "@/components/DemoButtons";
import LoadingState from "@/components/LoadingState";
import Navbar from "@/components/Navbar";
import PhraseCard from "@/components/PhraseCard";
import { useCamera } from "@/hooks/useCamera";
import { useDetection } from "@/hooks/useDetection";
import type { Intent } from "@/types";

export default function DetectPage() {
  const [mode, setMode] = useState<"live" | "demo">("live");
  const { videoRef, startCamera, isReady, permission, error } = useCamera();
  const { detection, isDetecting, error: detectionError, triggerDemoIntent } = useDetection({
    videoRef,
    enabled: isReady && mode === "live",
  });

  useEffect(() => {
    void startCamera();
  }, [startCamera]);

  const onDemoSelect = (intent: Intent) => {
    void triggerDemoIntent(intent);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-4 md:p-8">
      <Navbar />
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Detection Console</h2>
            <p className="mt-1 text-base text-slate-600">
              Keep your hand visible in camera or switch to demo mode.
            </p>
            <p className="mt-1 text-sm font-medium text-sky-700">
              ASL-inspired mode: 10 hospital intents
            </p>
          </div>
          <div className="rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode("live")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                mode === "live" ? "bg-sky-600 text-white" : "text-slate-700"
              }`}
            >
              Live Camera
            </button>
            <button
              type="button"
              onClick={() => setMode("demo")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                mode === "demo" ? "bg-sky-600 text-white" : "text-slate-700"
              }`}
            >
              Demo Mode
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <CameraFeed videoRef={videoRef} isActive={isReady && mode === "live"} />
        <div className="space-y-4">
          <LoadingState
            title={
              mode === "demo" ? "Demo Mode Active" : isReady ? "Camera Ready" : "Starting Camera"
            }
            message={
              mode === "demo"
                ? "Click any intent button to simulate recognition instantly."
                : error ??
                  (permission === "requesting"
                    ? "Requesting camera permission..."
                    : "Waiting for camera stream.")
            }
          />
          <DetectionStatus
            handDetected={Boolean(detection?.hand_detected)}
            isDetecting={isDetecting}
            error={detectionError}
          />
          <PhraseCard phrase={detection?.phrase ?? null} confidence={detection?.confidence ?? 0} />
          <AudioPlayer phrase={detection?.phrase ?? null} />
          {mode === "demo" ? <DemoButtons onSelectIntent={onDemoSelect} /> : null}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            Mode: <strong>{mode}</strong> | Permission: {permission}
          </div>
        </div>
      </div>
    </main>
  );
}

