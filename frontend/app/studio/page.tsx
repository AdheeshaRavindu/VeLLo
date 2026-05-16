"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  BookText,
  Captions,
  ChevronLeft,
  ChevronRight,
  History,
  Languages,
  Mic,
  Sparkles,
  Video,
  Volume2,
} from "lucide-react";

export default function StudioPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStatus, setCameraStatus] = useState<"loading" | "ready" | "denied">(
    "loading",
  );
  const [subtitleVisible, setSubtitleVisible] = useState(true);
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const touchStartY = useRef<number | null>(null);

  const subtitleFrames = [
    { gloss: "[YOU] [NAME] [WHAT]", translation: "What is your name?" },
    { gloss: "[I] [LEARN] [SIGN] [LANGUAGE]", translation: "I am learning sign language." },
    { gloss: "[PLEASE] [REPEAT] [SLOW]", translation: "Please repeat that slowly." },
  ];

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

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSubtitleVisible(false);
      setIsSpeaking(false);
      window.setTimeout(() => {
        setSubtitleIndex((prev) => (prev + 1) % subtitleFrames.length);
        setSubtitleVisible(true);
        setIsSpeaking(true);
      }, 220);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [subtitleFrames.length]);

  useEffect(() => {
    if (!isSpeaking) return;
    const timer = window.setTimeout(() => setIsSpeaking(false), 2600);
    return () => window.clearTimeout(timer);
  }, [subtitleIndex, isSpeaking]);

  const commandSections = [
    {
      title: "Session History",
      icon: <History className="h-4 w-4 text-blue-300" />,
      items: ["09:41 - Greeting sequence", "09:45 - Name question", "09:47 - Clarification request"],
    },
    {
      title: "Phrase Guide",
      icon: <BookText className="h-4 w-4 text-violet-300" />,
      items: ["Hello, nice to meet you", "What is your name?", "Please repeat slowly"],
    },
    {
      title: "System Status",
      icon: <Activity className="h-4 w-4 text-emerald-300" />,
      items: ["Camera: Stable", "Recognition: Active", "Voice Output: Online"],
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#050814] via-[#070b18] to-[#050711] px-4 py-4 text-zinc-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(59,130,246,0.16),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(139,92,246,0.14),transparent_38%),radial-gradient(circle_at_30%_100%,rgba(16,185,129,0.08),transparent_45%)]" />

      <section
        className={`relative mx-auto grid h-[calc(100dvh-2rem)] w-full max-w-[1500px] grid-cols-1 gap-4 transition-[grid-template-columns] duration-300 ${
          panelOpen
            ? "lg:grid-cols-[minmax(0,1fr)_320px]"
            : "lg:grid-cols-[minmax(0,1fr)_80px]"
        }`}
      >
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

          <div className="absolute bottom-0 left-1/2 w-[min(96%,980px)] -translate-x-1/2 overflow-hidden rounded-t-2xl border border-white/10 bg-zinc-900/70 px-4 pb-4 pt-3 backdrop-blur-2xl sm:px-6 sm:pb-5 sm:pt-4">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-900/95 via-zinc-900/80 to-transparent" />
            <div
              className={`relative transform-gpu transition-all duration-300 ${subtitleVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}
            >
              <div className="mb-1 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.16em] text-zinc-300/85 sm:text-xs">
                <Captions className="h-3.5 w-3.5 text-indigo-300" aria-hidden="true" />
                {subtitleFrames[subtitleIndex].gloss}
              </div>
              <p className="text-center text-xl font-bold leading-tight text-white antialiased sm:text-3xl">
                {subtitleFrames[subtitleIndex].translation}
              </p>

              <div className="mt-2 flex items-center justify-center gap-2 text-[10px] tracking-[0.14em] text-zinc-300/80 sm:text-xs">
                <span
                  className={`inline-flex h-2 w-2 rounded-full transition-all duration-300 ${isSpeaking ? "bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.9)]" : "bg-zinc-500/60"}`}
                />
                <span>VOICE OUTPUT</span>
                <span className="inline-flex items-end gap-1 rounded-full border border-emerald-300/20 bg-emerald-500/10 px-2 py-1 backdrop-blur">
                  {[10, 15, 11, 16].map((h, idx) => (
                    <span
                      key={idx}
                      className={`w-1 rounded-full bg-emerald-300/90 shadow-[0_0_8px_rgba(16,185,129,0.7)] transition-all duration-300 ${isSpeaking ? "animate-pulse" : "opacity-40"}`}
                      style={{ height: `${isSpeaking ? h : 6}px`, animationDelay: `${idx * 110}ms` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden rounded-3xl border border-white/10 bg-zinc-900/45 p-3 shadow-[0_0_42px_rgba(99,102,241,0.18)] backdrop-blur-2xl lg:block">
          <div className="mb-3 flex items-center justify-between">
            {panelOpen ? (
              <h2 className="text-sm font-semibold tracking-[0.14em] text-zinc-300">
                COMMAND CENTER
              </h2>
            ) : (
              <div className="text-xs tracking-[0.12em] text-zinc-400">TOOLS</div>
            )}
            <button
              type="button"
              onClick={() => setPanelOpen((prev) => !prev)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-zinc-950/60 text-zinc-300 transition hover:border-indigo-300/40 hover:text-white"
              aria-label="Toggle command center panel"
            >
              {panelOpen ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {panelOpen ? (
            <div className="space-y-3">
              {commandSections.map((section) => (
                <div
                  key={section.title}
                  className="rounded-2xl border border-white/10 bg-zinc-950/55 p-3"
                >
                  <div className="mb-2 flex items-center gap-2 text-xs tracking-[0.08em] text-zinc-300">
                    {section.icon}
                    {section.title}
                  </div>
                  <div className="space-y-1.5">
                    {section.items.map((item) => (
                      <p key={item} className="text-xs text-zinc-400">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[calc(100%-44px)] flex-col items-center justify-start gap-3 pt-3">
              {[<History key="h" className="h-4 w-4" />, <BookText key="b" className="h-4 w-4" />, <Activity key="a" className="h-4 w-4" />].map(
                (icon, index) => (
                  <span
                    key={index}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-zinc-950/50 text-zinc-300"
                  >
                    {icon}
                  </span>
                ),
              )}
            </div>
          )}
        </aside>
      </section>

      <button
        type="button"
        onClick={() => setMobileDrawerOpen(true)}
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full border border-indigo-300/30 bg-zinc-900/70 px-4 py-2 text-xs tracking-[0.1em] text-zinc-100 shadow-[0_0_20px_rgba(99,102,241,0.25)] backdrop-blur-xl lg:hidden"
      >
        <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
        COMMAND CENTER
      </button>

      <div
        className={`fixed inset-0 z-40 transition ${mobileDrawerOpen ? "pointer-events-auto bg-black/40 opacity-100" : "pointer-events-none bg-black/0 opacity-0"} lg:hidden`}
        onClick={() => setMobileDrawerOpen(false)}
      />

      <aside
        className={`fixed bottom-0 left-0 right-0 z-50 max-h-[72vh] rounded-t-3xl border border-white/10 bg-zinc-900/88 p-4 shadow-[0_-10px_40px_rgba(2,6,23,0.7)] backdrop-blur-2xl transition-transform duration-300 lg:hidden ${mobileDrawerOpen ? "translate-y-0" : "translate-y-full"}`}
        onTouchStart={(e) => {
          touchStartY.current = e.touches[0]?.clientY ?? null;
        }}
        onTouchEnd={(e) => {
          const endY = e.changedTouches[0]?.clientY ?? null;
          if (touchStartY.current !== null && endY !== null && endY - touchStartY.current > 60) {
            setMobileDrawerOpen(false);
          }
          touchStartY.current = null;
        }}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-zinc-600/80" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-[0.14em] text-zinc-200">COMMAND CENTER</h2>
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="rounded-lg border border-white/10 bg-zinc-950/60 px-2 py-1 text-xs text-zinc-300"
          >
            CLOSE
          </button>
        </div>
        <div className="space-y-3 overflow-y-auto pb-2">
          {commandSections.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl border border-white/10 bg-zinc-950/55 p-3"
            >
              <div className="mb-2 flex items-center gap-2 text-xs tracking-[0.08em] text-zinc-300">
                {section.icon}
                {section.title}
              </div>
              <div className="space-y-1.5">
                {section.items.map((item) => (
                  <p key={item} className="text-xs text-zinc-400">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </main>
  );
}
