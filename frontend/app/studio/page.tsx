"use client";

import { useEffect, useRef, useState } from "react";
import { Captions, Languages, Mic, Sparkles, Video, Volume2 } from "lucide-react";

export default function StudioPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStatus, setCameraStatus] = useState<"loading" | "ready" | "denied">(
    "loading",
  );

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: "user",
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setCameraStatus("ready");
      } catch {
        setCameraStatus("denied");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#050814] via-[#070b18] to-[#050711] px-4 py-4 text-zinc-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(59,130,246,0.16),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(139,92,246,0.14),transparent_38%),radial-gradient(circle_at_30%_100%,rgba(16,185,129,0.08),transparent_45%)]" />

      <section className="relative mx-auto grid h-[calc(100dvh-2rem)] w-full max-w-[1500px] grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-300/20 bg-zinc-900/40 shadow-[0_28px_70px_rgba(2,6,23,0.55),0_0_56px_rgba(79,70,229,0.22)] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1328]/85 via-[#0b1224]/88 to-[#070b16]/94" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(99,102,241,0.22),transparent_45%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_110%,rgba(2,6,23,0.8),transparent_58%)]" />

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover [-webkit-transform:scaleX(-1)] [transform:scaleX(-1)] [filter:contrast(1.08)_brightness(1.04)_saturate(1.08)]"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#090A10]/35 via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(2,6,23,0.3)_100%)]" />

          {cameraStatus !== "ready" ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="rounded-full border border-white/15 bg-zinc-900/70 px-4 py-2 text-sm text-zinc-200 backdrop-blur-xl">
                {cameraStatus === "loading"
                  ? "Starting camera..."
                  : "Camera access denied. Please allow camera permissions."}
              </p>
            </div>
          ) : null}

          <div className="pointer-events-none absolute left-[10%] top-[13%] h-8 w-8 rounded-tl-xl border-l-2 border-t-2 border-blue-400/90 shadow-[0_0_10px_rgba(59,130,246,0.7)]" />
          <div className="pointer-events-none absolute right-[10%] top-[13%] h-8 w-8 rounded-tr-xl border-r-2 border-t-2 border-violet-400/90 shadow-[0_0_10px_rgba(139,92,246,0.7)]" />
          <div className="pointer-events-none absolute bottom-[24%] left-[10%] h-8 w-8 rounded-bl-xl border-b-2 border-l-2 border-blue-400/90 shadow-[0_0_10px_rgba(59,130,246,0.7)]" />
          <div className="pointer-events-none absolute bottom-[24%] right-[10%] h-8 w-8 rounded-br-xl border-b-2 border-r-2 border-violet-400/90 shadow-[0_0_10px_rgba(139,92,246,0.7)]" />

          <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-[#0c1428]/70 px-3 py-1.5 text-xs font-medium tracking-[0.1em] text-emerald-300 backdrop-blur-xl">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            LIVE
          </div>

          <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-zinc-900/75 p-4 backdrop-blur-xl">
            <div className="mb-2 flex items-center gap-2 text-xs tracking-[0.12em] text-zinc-400">
              <Captions className="h-3.5 w-3.5 text-indigo-300" aria-hidden="true" />
              LIVE TELEPROMPTER
            </div>
            <p className="text-lg font-medium leading-relaxed text-zinc-100 sm:text-xl">
              Hello! I can translate your sign language into voice in real time.
              Keep your hands inside the highlighted frame.
            </p>
          </div>
        </div>

        <aside className="rounded-3xl border border-white/10 bg-zinc-900/45 p-4 shadow-[0_0_42px_rgba(99,102,241,0.18)] backdrop-blur-2xl">
          <h2 className="mb-4 text-sm font-semibold tracking-[0.14em] text-zinc-300">
            COMMAND CENTER
          </h2>

          <div className="space-y-3">
            {[
              {
                label: "Input Mode",
                value: "Camera + Mic",
                icon: <Video className="h-4 w-4 text-blue-300" />,
              },
              {
                label: "Translation",
                value: "Sinhala -> English",
                icon: <Languages className="h-4 w-4 text-violet-300" />,
              },
              {
                label: "Voice Output",
                value: "Natural Female Voice",
                icon: <Volume2 className="h-4 w-4 text-emerald-300" />,
              },
              {
                label: "Noise Filter",
                value: "Adaptive Listening",
                icon: <Mic className="h-4 w-4 text-cyan-300" />,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-zinc-950/55 p-3"
              >
                <div className="mb-1 flex items-center gap-2 text-xs text-zinc-400">
                  {item.icon}
                  {item.label}
                </div>
                <p className="text-sm font-medium text-zinc-100">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            <div className="mb-1 flex items-center gap-2 font-medium">
              <Sparkles className="h-4 w-4" />
              AI Status
            </div>
            Tracking stable. Translation latency: 140ms.
          </div>
        </aside>
      </section>
    </main>
  );
}
