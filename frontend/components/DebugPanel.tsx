"use client";

import { useState } from "react";
import type { RefObject } from "react";
import { detectDebug } from "@/services/api";
import type { DetectionResponse } from "@/types";

interface DebugPanelProps {
  videoRef: RefObject<HTMLVideoElement>;
}

export default function DebugPanel({ videoRef }: DebugPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  async function captureAndSend() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setImgSrc(dataUrl);
    const b64 = dataUrl.split(",")[1];
    setLoading(true);
    try {
      const res = await detectDebug({ image_base64: b64 });
      setResult(res);
    } catch (e) {
      setResult({
        hand_detected: false,
        confidence: 0,
        intent: null,
        phrase: null,
        source: "vision",
      } as DetectionResponse);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold text-slate-900">Diagnostics</h3>
      <button
        onClick={captureAndSend}
        className="mb-3 rounded-md bg-sky-600 px-3 py-2 text-white hover:bg-sky-700"
      >
        {loading ? "Sending..." : "Send Frame to Debug API"}
      </button>
      {imgSrc ? (
        <img src={imgSrc} alt="snapshot" className="mb-3 w-full rounded-md border" />
      ) : null}
      {result ? (
        <pre className="max-h-64 overflow-auto rounded-md bg-slate-100 p-2 text-xs">
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : (
        <div className="text-xs text-slate-500">No diagnostic result yet.</div>
      )}
    </div>
  );
}
