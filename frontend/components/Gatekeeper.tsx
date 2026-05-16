"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  AudioLines,
  Camera,
  Globe,
  Hand,
  Lock,
  Mic,
  ChevronDown,
  ShieldCheck,
  ScanLine,
  Sparkles,
  Volume2,
  Languages,
} from "lucide-react";

type PermissionState = "idle" | "requesting" | "denied";

type GatekeeperProps = {
  onComplete?: () => void;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Gatekeeper({ onComplete }: GatekeeperProps) {
  const [permissionState, setPermissionState] = useState<PermissionState>("idle");
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setHeroVisible(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  const requestPermission = useCallback(async () => {
    setPermissionState("requesting");
    await wait(1500);

    const shouldDeny = Math.random() < 0.5;
    if (shouldDeny) {
      setPermissionState("denied");
      return;
    }

    setPermissionState("idle");
    onComplete?.();
  }, [onComplete]);

  if (permissionState === "denied") {
    return (
      <main className="relative h-screen overflow-hidden bg-gradient-to-b from-[#090A10] via-[#090A10] to-[#07070c] px-4 py-4 text-zinc-100 sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.10),transparent_45%),radial-gradient(circle_at_70%_45%,rgba(139,92,246,0.10),transparent_40%)]" />
        <div className="pointer-events-none absolute left-0 top-20 h-[70vh] w-36 opacity-35 [background-image:radial-gradient(circle,_rgba(59,130,246,0.35)_1.2px,_transparent_1.2px)] [background-size:14px_14px] [mask-image:linear-gradient(to_right,black,transparent)]" />
        <div className="pointer-events-none absolute right-0 top-20 h-[70vh] w-36 opacity-35 [background-image:radial-gradient(circle,_rgba(139,92,246,0.35)_1.2px,_transparent_1.2px)] [background-size:14px_14px] [mask-image:linear-gradient(to_left,black,transparent)]" />
        <div className="relative mx-auto flex h-full max-w-3xl items-center justify-center">
          <div className="w-full rounded-3xl border border-red-400/25 bg-zinc-900/55 p-8 text-center shadow-[0_0_80px_rgba(239,68,68,0.12)] backdrop-blur-xl sm:p-10">
            <h1 className="text-3xl font-bold tracking-tight text-red-400 sm:text-5xl">
              We can&apos;t see you! 🙈
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base">
              It looks like your camera is blocked. Click the lock icon in your
              browser&apos;s address bar to allow access, then refresh the page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-7 inline-flex h-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 px-6 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative h-screen overflow-hidden bg-gradient-to-b from-[#090A10] via-[#090A10] to-[#07070c] px-4 py-4 text-zinc-100 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_42%),radial-gradient(circle_at_70%_45%,rgba(139,92,246,0.12),transparent_38%)]" />
      <div className="pointer-events-none absolute left-0 top-20 h-[70vh] w-36 opacity-35 [background-image:radial-gradient(circle,_rgba(59,130,246,0.35)_1.2px,_transparent_1.2px)] [background-size:14px_14px] [mask-image:linear-gradient(to_right,black,transparent)]" />
      <div className="pointer-events-none absolute right-0 top-20 h-[70vh] w-36 opacity-35 [background-image:radial-gradient(circle,_rgba(139,92,246,0.35)_1.2px,_transparent_1.2px)] [background-size:14px_14px] [mask-image:linear-gradient(to_left,black,transparent)]" />
      <div className="pointer-events-none absolute left-8 top-1/3 hidden h-24 w-24 rounded-full border border-white/10 bg-zinc-900/40 backdrop-blur lg:block" />
      <div className="pointer-events-none absolute right-8 top-1/2 hidden h-20 w-20 rounded-full border border-white/10 bg-zinc-900/40 backdrop-blur lg:block" />

      <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col px-1 sm:px-2">
        <div className="flex items-center justify-between pt-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/55 px-3 py-1.5 shadow-[0_0_28px_rgba(99,102,241,0.28)] backdrop-blur-xl">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/90 via-indigo-500/90 to-violet-500/90 text-white shadow-[0_0_16px_rgba(99,102,241,0.65)]">
              <Hand className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="bg-gradient-to-r from-white via-zinc-100 to-violet-300 bg-clip-text text-sm font-bold tracking-tight text-transparent">
              SignVoice
            </span>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-indigo-400/25 bg-zinc-900/55 px-3.5 py-1.5 text-xs text-zinc-200 shadow-[0_0_24px_rgba(99,102,241,0.2)] backdrop-blur-xl transition hover:border-indigo-300/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            aria-label="Language selector"
          >
            <Globe className="h-3.5 w-3.5 text-indigo-200" aria-hidden="true" />
            English
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <section className="mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/70 px-4 py-2 text-[11px] font-medium tracking-[0.14em] text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-violet-300" aria-hidden="true" />
            AI POWERED SIGN DETECTION
          </span>
          <h1
            className={`mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl ${heroVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"} transform-gpu transition-all duration-700 ease-out`}
          >
            Let&apos;s give your{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              hands a voice.
            </span>
          </h1>
          <p
            className={`mt-3 text-sm font-semibold tracking-wide text-zinc-300 sm:text-base ${heroVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"} transform-gpu transition-all duration-700 ease-out [transition-delay:120ms]`}
          >
            Signs into real-time voice translation.
          </p>
          <p
            className={`mx-auto mt-3 max-w-xl text-xs leading-relaxed text-zinc-400 sm:text-sm ${heroVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"} transform-gpu transition-all duration-700 ease-out [transition-delay:220ms]`}
          >
            Experience real-time sign detection with instant spoken voice
            conversion, built with privacy-first processing. Your video never gets
            recorded or stored - everything runs live and securely on your screen.
          </p>

          <div className="mt-4 w-full rounded-[32px] border border-white/10 bg-zinc-900/40 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.45),0_0_60px_rgba(79,70,229,0.2)] backdrop-blur-2xl">
            <div className="relative h-[220px] overflow-hidden rounded-[28px] border border-indigo-300/20 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 sm:h-[250px]">
              <img
                src="https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Person demonstrating a sign language hand gesture"
                className="h-full w-full object-cover object-center opacity-92"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090A10]/55 via-[#090A10]/10 to-transparent" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(99,102,241,0.18),transparent_45%)]" />

              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-medium tracking-[0.08em] text-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.3)]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                LIVE
              </span>

              <div className="absolute left-4 top-1/2 -translate-y-1/2 rounded-xl border border-white/15 bg-zinc-900/70 px-3 py-2 text-left text-xs text-zinc-200 shadow-[0_0_20px_rgba(99,102,241,0.22)] backdrop-blur-xl">
                <span className="flex items-center gap-1.5">
                  <AudioLines
                    className={`h-3.5 w-3.5 text-blue-300 ${permissionState === "requesting" ? "animate-pulse" : ""}`}
                    aria-hidden="true"
                  />
                  Listening...
                </span>
              </div>

              <div className="absolute bottom-4 right-4 rounded-xl border border-white/15 bg-zinc-900/70 px-3.5 py-2 text-center shadow-[0_0_22px_rgba(139,92,246,0.2)] backdrop-blur-xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2">
                <p className="text-[9px] tracking-[0.16em] text-zinc-400">DETECTED SIGN</p>
                <p className="bg-gradient-to-b from-blue-300 to-violet-300 bg-clip-text text-2xl font-bold leading-none text-transparent">
                  L
                </p>
                <p className="mt-0.5 text-[9px] tracking-[0.16em] text-zinc-500">LETTER</p>
              </div>

              <div className="pointer-events-none absolute inset-[18%_28%] rounded-2xl border border-indigo-300/35 shadow-[0_0_26px_rgba(99,102,241,0.34)]" />
              <div className="pointer-events-none absolute inset-[18%_28%] rounded-2xl border border-white/5" />

              <div className="pointer-events-none absolute left-6 top-6 h-9 w-9 border-l-2 border-t-2 border-blue-400/95 shadow-[0_0_10px_rgba(59,130,246,0.65)]" />
              <div className="pointer-events-none absolute right-6 top-6 h-9 w-9 border-r-2 border-t-2 border-violet-400/95 shadow-[0_0_10px_rgba(139,92,246,0.65)]" />
              <div className="pointer-events-none absolute bottom-6 left-6 h-9 w-9 border-b-2 border-l-2 border-blue-400/95 shadow-[0_0_10px_rgba(59,130,246,0.65)]" />
              <div className="pointer-events-none absolute bottom-6 right-6 h-9 w-9 border-b-2 border-r-2 border-violet-400/95 shadow-[0_0_10px_rgba(139,92,246,0.65)]" />
            </div>
          </div>

          <div className="mt-4 w-full max-w-3xl">
            <button
              type="button"
              disabled={permissionState === "requesting"}
              onClick={requestPermission}
              className="group w-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 bg-[length:200%_100%] [background-position:0%_50%] p-[1.5px] shadow-[0_0_52px_rgba(79,70,229,0.52)] transition-[transform,box-shadow,background-position] duration-300 ease-out hover:scale-[1.012] hover:[background-position:100%_50%] hover:shadow-[0_0_72px_rgba(99,102,241,0.72)] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
            >
              <span className="flex w-full items-center justify-between gap-3 rounded-full border border-white/10 bg-zinc-950/60 px-5 py-3.5 text-left backdrop-blur-xl sm:px-7">
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-[0_0_16px_rgba(59,130,246,0.28)]">
                    {permissionState === "requesting" ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                    ) : (
                      <Camera className="h-5 w-5" aria-hidden="true" />
                    )}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-[0_0_16px_rgba(139,92,246,0.28)]">
                    <Mic className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white sm:text-lg">
                      {permissionState === "requesting"
                        ? "Waiting for permission..."
                        : "Enable Camera & Mic"}
                    </span>
                    <span className="block text-xs text-zinc-200/85 sm:text-sm">
                      Click to get started
                    </span>
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 text-white transition duration-300 group-hover:translate-x-1.5" aria-hidden="true" />
              </span>
            </button>
            <p className="mt-2 inline-flex items-center gap-2 text-xs text-zinc-400">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              A browser popup will appear next. Please click &quot;Allow&quot; to start.
            </p>
          </div>

          <div className="mt-4 w-full max-w-3xl rounded-2xl border border-white/10 bg-zinc-900/45 p-3 shadow-[0_0_30px_rgba(99,102,241,0.12)] backdrop-blur-xl">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Real-time Detection",
                  desc: "Detect signs instantly",
                  icon: <ScanLine className="h-4 w-4" aria-hidden="true" />,
                  tone: "text-blue-300 border-blue-400/30 bg-blue-500/10 shadow-[0_0_14px_rgba(59,130,246,0.35)]",
                },
                {
                  title: "Instant Translation",
                  desc: "Convert signs to speech",
                  icon: <Languages className="h-4 w-4" aria-hidden="true" />,
                  tone: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10 shadow-[0_0_14px_rgba(16,185,129,0.35)]",
                },
                {
                  title: "Voice Output",
                  desc: "Hear clear spoken output",
                  icon: <Volume2 className="h-4 w-4" aria-hidden="true" />,
                  tone: "text-amber-300 border-amber-400/30 bg-amber-500/10 shadow-[0_0_14px_rgba(245,158,11,0.3)]",
                },
                {
                  title: "100% Private",
                  desc: "No recording or storage",
                  icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
                  tone: "text-violet-300 border-violet-400/30 bg-violet-500/10 shadow-[0_0_14px_rgba(139,92,246,0.35)]",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-zinc-800/80 bg-zinc-950/45 px-3 py-2.5 text-left"
                >
                  <span
                    className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full border ${item.tone}`}
                  >
                    {item.icon}
                  </span>
                  <p className="text-xs font-semibold text-zinc-200">{item.title}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-400">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
