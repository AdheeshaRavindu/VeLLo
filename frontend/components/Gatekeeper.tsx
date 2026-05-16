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
      <main className="relative h-screen overflow-hidden bg-gradient-to-b from-emerald-50 via-lime-50 to-green-100 px-4 py-4 text-emerald-950 sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12),transparent_45%),radial-gradient(circle_at_70%_45%,rgba(132,204,22,0.10),transparent_40%)]" />
        <div className="pointer-events-none absolute left-0 top-20 h-[70vh] w-36 opacity-30 [background-image:radial-gradient(circle,_rgba(16,185,129,0.25)_1.2px,_transparent_1.2px)] [background-size:14px_14px] [mask-image:linear-gradient(to_right,black,transparent)]" />
        <div className="pointer-events-none absolute right-0 top-20 h-[70vh] w-36 opacity-30 [background-image:radial-gradient(circle,_rgba(132,204,22,0.25)_1.2px,_transparent_1.2px)] [background-size:14px_14px] [mask-image:linear-gradient(to_left,black,transparent)]" />
        <div className="relative mx-auto flex h-full max-w-3xl items-center justify-center">
          <div className="w-full rounded-3xl border border-red-300/40 bg-white/80 p-8 text-center shadow-[0_0_60px_rgba(239,68,68,0.12)] backdrop-blur-xl sm:p-10">
            <h1 className="text-3xl font-bold tracking-tight text-red-400 sm:text-5xl">
              We can&apos;t see you! 🙈
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-emerald-900/80 sm:text-base">
              It looks like your camera is blocked. Click the lock icon in your
              browser&apos;s address bar to allow access, then refresh the page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-7 inline-flex h-12 items-center justify-center rounded-full border border-emerald-300 bg-emerald-600 px-6 text-sm font-semibold text-white transition hover:border-emerald-400 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative h-screen overflow-hidden bg-gradient-to-b from-emerald-50 via-lime-50 to-green-100 px-4 py-4 text-emerald-950 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(16,185,129,0.14),transparent_40%),radial-gradient(circle_at_72%_42%,rgba(132,204,22,0.12),transparent_36%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_35%,rgba(236,253,245,0.42))]" />
      <div className="pointer-events-none absolute left-0 top-20 h-[70vh] w-32 opacity-25 [background-image:radial-gradient(circle,_rgba(16,185,129,0.28)_1.2px,_transparent_1.2px)] [background-size:14px_14px] [mask-image:linear-gradient(to_right,black,transparent)]" />
      <div className="pointer-events-none absolute right-0 top-20 h-[70vh] w-32 opacity-25 [background-image:radial-gradient(circle,_rgba(132,204,22,0.28)_1.2px,_transparent_1.2px)] [background-size:14px_14px] [mask-image:linear-gradient(to_left,black,transparent)]" />

      <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col px-1 sm:px-2">
        <div className="flex items-center justify-between pt-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/70 px-3 py-1.5 shadow-[0_0_24px_rgba(16,185,129,0.18)] backdrop-blur-xl">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/90 via-green-500/90 to-lime-500/90 text-white shadow-[0_0_14px_rgba(16,185,129,0.45)]">
              <Hand className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-lime-600 bg-clip-text text-sm font-bold tracking-tight text-transparent">
              SignVoice
            </span>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-white/65 px-3.5 py-1.5 text-xs text-emerald-900 shadow-[0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-xl transition hover:border-emerald-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Language selector"
          >
            <Globe className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
            English
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <section className="mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/75 px-4 py-2 text-[11px] font-medium tracking-[0.14em] text-emerald-700">
            <Sparkles className="h-3.5 w-3.5 text-lime-600" aria-hidden="true" />
            AI POWERED SIGN DETECTION
          </span>
          <h1
            className={`mt-4 text-4xl font-bold tracking-tight text-emerald-950 sm:text-5xl lg:text-6xl ${heroVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"} transform-gpu transition-all duration-700 ease-out`}
          >
            Let&apos;s give your{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 bg-clip-text text-transparent">
              hands a voice.
            </span>
          </h1>
          <p
            className={`mt-3 text-sm font-semibold tracking-wide text-emerald-800/85 sm:text-base ${heroVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"} transform-gpu transition-all duration-700 ease-out [transition-delay:120ms]`}
          >
            Signs into real-time voice translation.
          </p>
          <p
            className={`mx-auto mt-3 max-w-xl text-xs leading-relaxed text-emerald-800/75 sm:text-sm ${heroVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"} transform-gpu transition-all duration-700 ease-out [transition-delay:220ms]`}
          >
            Experience real-time sign detection with instant spoken voice
            conversion, built with privacy-first processing. Your video never gets
            recorded or stored - everything runs live and securely on your screen.
          </p>

          <div className="mt-4 w-full rounded-[32px] border border-emerald-200/70 bg-white/55 p-4 shadow-[0_18px_42px_rgba(6,95,70,0.18),0_0_42px_rgba(16,185,129,0.14)] backdrop-blur-2xl">
            <div className="relative h-[220px] overflow-hidden rounded-[28px] border border-emerald-300/45 bg-gradient-to-br from-emerald-100 via-lime-100 to-green-100 sm:h-[250px]">
              <img
                src="/models/woman-sign.png"
                alt="Woman demonstrating a sign language hand gesture"
                className="h-full w-full object-contain object-center opacity-92"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/30 via-emerald-900/5 to-transparent" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(16,185,129,0.18),transparent_45%)]" />

              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/15 px-3 py-1 text-[10px] font-medium tracking-[0.08em] text-emerald-900 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.7)]" />
                LIVE
              </span>

              <div className="absolute left-4 top-1/2 -translate-y-1/2 rounded-xl border border-emerald-300/50 bg-white/72 px-3 py-2 text-left text-xs text-emerald-900 shadow-[0_0_14px_rgba(16,185,129,0.16)] backdrop-blur-xl">
                <span className="flex items-center gap-1.5">
                  <AudioLines
                    className={`h-3.5 w-3.5 text-emerald-600 ${permissionState === "requesting" ? "animate-pulse" : ""}`}
                    aria-hidden="true"
                  />
                  Listening...
                </span>
              </div>

              <div className="absolute bottom-4 right-4 rounded-xl border border-lime-300/60 bg-white/72 px-3.5 py-2 text-center shadow-[0_0_16px_rgba(132,204,22,0.16)] backdrop-blur-xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2">
                <p className="text-[9px] tracking-[0.16em] text-emerald-700">DETECTED SIGN</p>
                <p className="bg-gradient-to-b from-emerald-600 to-lime-600 bg-clip-text text-2xl font-bold leading-none text-transparent">
                  L
                </p>
                <p className="mt-0.5 text-[9px] tracking-[0.16em] text-emerald-600/80">LETTER</p>
              </div>

              <div className="pointer-events-none absolute inset-[18%_28%] rounded-2xl border border-emerald-400/45 shadow-[0_0_20px_rgba(16,185,129,0.24)]" />
              <div className="pointer-events-none absolute inset-[18%_28%] rounded-2xl border border-emerald-100/70" />

              <div className="pointer-events-none absolute left-6 top-6 h-9 w-9 border-l-2 border-t-2 border-emerald-500/95 shadow-[0_0_8px_rgba(16,185,129,0.55)]" />
              <div className="pointer-events-none absolute right-6 top-6 h-9 w-9 border-r-2 border-t-2 border-lime-500/95 shadow-[0_0_8px_rgba(132,204,22,0.55)]" />
              <div className="pointer-events-none absolute bottom-6 left-6 h-9 w-9 border-b-2 border-l-2 border-emerald-500/95 shadow-[0_0_8px_rgba(16,185,129,0.55)]" />
              <div className="pointer-events-none absolute bottom-6 right-6 h-9 w-9 border-b-2 border-r-2 border-lime-500/95 shadow-[0_0_8px_rgba(132,204,22,0.55)]" />
            </div>
          </div>

          <div className="mt-4 w-full max-w-3xl">
            <button
              type="button"
              disabled={permissionState === "requesting"}
              onClick={requestPermission}
              className="group w-full rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 bg-[length:200%_100%] [background-position:0%_50%] p-[1.5px] shadow-[0_0_36px_rgba(16,185,129,0.32)] transition-[transform,box-shadow,background-position] duration-300 ease-out hover:scale-[1.01] hover:[background-position:100%_50%] hover:shadow-[0_0_54px_rgba(16,185,129,0.45)] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span className="flex w-full items-center justify-between gap-3 rounded-full border border-emerald-200/70 bg-white/65 px-5 py-3.5 text-left backdrop-blur-xl sm:px-7">
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-500/10 text-emerald-700 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                    {permissionState === "requesting" ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                    ) : (
                      <Camera className="h-5 w-5" aria-hidden="true" />
                    )}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-lime-200/80 bg-lime-500/10 text-lime-700 shadow-[0_0_12px_rgba(132,204,22,0.2)]">
                    <Mic className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-emerald-900 sm:text-lg">
                      {permissionState === "requesting"
                        ? "Waiting for permission..."
                        : "Enable Camera & Mic"}
                    </span>
                    <span className="block text-xs text-emerald-800/80 sm:text-sm">
                      Click to get started
                    </span>
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 text-emerald-800 transition duration-300 group-hover:translate-x-1.5" aria-hidden="true" />
              </span>
            </button>
            <p className="mt-2 inline-flex items-center gap-2 text-xs text-emerald-800/75">
              <Lock className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
              A browser popup will appear next. Please click &quot;Allow&quot; to start.
            </p>
          </div>

          <div className="mt-4 w-full max-w-3xl rounded-2xl border border-emerald-200/70 bg-white/60 p-3 shadow-[0_0_24px_rgba(16,185,129,0.12)] backdrop-blur-xl">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Real-time Detection",
                  desc: "Detect signs instantly",
                  icon: <ScanLine className="h-4 w-4" aria-hidden="true" />,
                  tone: "text-emerald-700 border-emerald-400/40 bg-emerald-500/10 shadow-[0_0_14px_rgba(16,185,129,0.25)]",
                },
                {
                  title: "Instant Translation",
                  desc: "Convert signs to speech",
                  icon: <Languages className="h-4 w-4" aria-hidden="true" />,
                  tone: "text-green-700 border-green-400/40 bg-green-500/10 shadow-[0_0_14px_rgba(34,197,94,0.25)]",
                },
                {
                  title: "Voice Output",
                  desc: "Hear clear spoken output",
                  icon: <Volume2 className="h-4 w-4" aria-hidden="true" />,
                  tone: "text-lime-700 border-lime-400/40 bg-lime-500/10 shadow-[0_0_14px_rgba(132,204,22,0.25)]",
                },
                {
                  title: "100% Private",
                  desc: "No recording or storage",
                  icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
                  tone: "text-teal-700 border-teal-400/40 bg-teal-500/10 shadow-[0_0_14px_rgba(20,184,166,0.25)]",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-emerald-200/70 bg-white/70 px-3 py-2.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                >
                  <span
                    className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full border ${item.tone}`}
                  >
                    {item.icon}
                  </span>
                  <p className="text-xs font-semibold text-emerald-900">{item.title}</p>
                  <p className="mt-0.5 text-[11px] text-emerald-800/75">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-3 w-full max-w-3xl text-center">
            <div className="mx-auto flex max-w-sm items-center gap-3">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent" />
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/35 bg-emerald-500/10 text-emerald-700 shadow-[0_0_12px_rgba(16,185,129,0.22)]">
                <Hand className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-lime-400/35 to-transparent" />
            </div>

            <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-900">
              <ShieldCheck className="h-4 w-4 text-emerald-700" aria-hidden="true" />
              100% Private &amp; Secure
            </p>
            <p className="mx-auto mt-1 max-w-lg text-xs leading-relaxed text-emerald-800/75">
              Your privacy is our priority. We don&apos;t record or store any data.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
