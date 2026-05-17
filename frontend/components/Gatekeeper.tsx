"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PermissionState = "idle" | "requesting" | "denied";

type GatekeeperProps = {
  onComplete?: () => void;
};

type IconProps = {
  className?: string;
  "aria-hidden"?: boolean;
};

const ArrowRight = ({ className, ...props }: IconProps) => (
  <span className={className} {...props}>
    {"->"}
  </span>
);

const AudioLines = ({ className, ...props }: IconProps) => (
  <span className={className} {...props}>
    {"~"}
  </span>
);

const Lock = ({ className, ...props }: IconProps) => (
  <span className={className} {...props}>
    {"#"}
  </span>
);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Gatekeeper({ onComplete }: GatekeeperProps) {
  const [permissionState, setPermissionState] = useState<PermissionState>("idle");
  const [heroVisible, setHeroVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => setHeroVisible(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  const requestPermission = useCallback(async () => {
    setPermissionState("requesting");
    await wait(1500);

    setPermissionState("idle");
    onComplete?.();
    router.push("/studio");
  }, [onComplete, router]);

  if (permissionState === "denied") {
    return (
      <main className="relative min-h-[100dvh] w-full overflow-x-hidden bg-gradient-to-b from-emerald-50 via-lime-50 to-green-100 px-4 py-4 text-emerald-950 sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_38%,rgba(16,185,129,0.16),transparent_45%),radial-gradient(circle_at_72%_42%,rgba(132,204,22,0.14),transparent_38%)]" />
        <div className="relative mx-auto flex min-h-[100dvh] max-w-3xl items-center justify-center py-6 lg:h-full lg:min-h-0">
          <div className="w-full rounded-3xl border border-red-300/40 bg-white/80 p-6 text-center shadow-[0_0_60px_rgba(239,68,68,0.12)] backdrop-blur-xl sm:p-8 lg:p-10">
            <h1 className="text-2xl font-bold tracking-tight text-red-400 sm:text-4xl lg:text-5xl">
              We can&apos;t see you! 🙈
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-emerald-900/80 sm:mt-4 sm:text-sm lg:text-base">
              It looks like your camera is blocked. Click the lock icon in your
              browser&apos;s address bar to allow access, then refresh the page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-emerald-300 bg-emerald-600 px-6 text-sm font-semibold text-white transition hover:border-emerald-400 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 sm:mt-7 sm:h-12"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-[100dvh] w-full justify-center overflow-x-hidden bg-gradient-to-b from-emerald-50 via-lime-50 to-green-100 px-4 py-2 text-emerald-950 sm:px-6 lg:py-2">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_38%,rgba(16,185,129,0.18),transparent_45%),radial-gradient(circle_at_72%_42%,rgba(132,204,22,0.16),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(236,253,245,0.85),transparent_60%)]" />

      <section className="relative mx-auto flex w-full max-w-2xl flex-col items-center justify-start pt-2 text-center lg:min-h-[100dvh] lg:justify-center lg:pt-5 lg:pb-5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/75 px-3 py-1.5 text-[10px] font-medium tracking-[0.13em] text-emerald-700 shadow-[0_0_18px_rgba(16,185,129,0.16)] transition hover:border-emerald-300 hover:shadow-[0_0_26px_rgba(16,185,129,0.22)] sm:gap-2 sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.14em]">
          
          AI POWERED SIGN DETECTION
        </span>

        <h1
          className={`mt-3  w-max text-3xl font-bold tracking-tight text-emerald-950 drop-shadow-[0_2px_14px_rgba(6,78,59,0.2)] sm:mt-2 sm:mb-1 sm:text-4xl lg:text-5xl lg:leading-tight ${heroVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"} transform-gpu transition-all duration-700 ease-out`}
        >
          LET&apos;S GIVE YOUR{" "}
          <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 bg-clip-text text-transparent">
            HANDS A VOICE
          </span>
        </h1>

        

        <p
          className={`mx-auto mt-2 max-w-[330px] px-1 text-xs leading-relaxed text-emerald-800/75 sm:mt-3 sm:max-w-2xl sm:px-0 sm:text-sm lg:mt-2 lg:max-w-xl lg:leading-relaxed ${heroVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"} transform-gpu transition-all duration-700 ease-out [transition-delay:220ms]`}
        >
          To translate your signs into spoken words, the system needs to see your
          movements. We don&apos;t record or store your video - everything processes
          live on your screen.
        </p>

        <div className="mx-auto mt-3 w-full rounded-[28px] border border-emerald-200/70 bg-white/55 p-3 shadow-[0_22px_52px_rgba(6,95,70,0.22),0_0_56px_rgba(16,185,129,0.16)] backdrop-blur-2xl sm:mt-4 sm:rounded-[32px] sm:p-2   lg:mt-5 lg:mb-5">
          <div className="relative h-[240px] overflow-hidden rounded-[24px] border border-emerald-300/50 bg-gradient-to-br from-emerald-100 via-lime-100 to-green-100 sm:h-[320px] sm:rounded-[28px] lg:h-[330px]">
            <img
              src="/models/woman-sign.png"
              alt="Woman demonstrating a sign language hand gesture"
              className="h-full w-full translate-y-1 scale-[1.34] object-contain object-[50%_56%] opacity-100 sm:scale-[1.28] lg:translate-y-10 lg:-translate-x-5 lg:scale-[1.18]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/42 via-emerald-900/10 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(16,185,129,0.28),transparent_42%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(6,78,59,0.26),transparent_24%,transparent_76%,rgba(6,78,59,0.26))]" />

            

            <div className="absolute -translate-x-20 left-[18%] top-1/2 -translate-y-1/2 rounded-lg border border-emerald-300/50 bg-white/68 px-2 py-1.5 text-left text-[10px] text-emerald-900 shadow-[0_0_12px_rgba(16,185,129,0.14)] backdrop-blur-xl sm:left-[20%] sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs">
              <span className="flex items-center gap-1 sm:gap-1.5">
                <AudioLines
                  className={`h-3 w-3 text-emerald-600 sm:h-3.5 sm:w-3.5 ${permissionState === "requesting" ? "animate-pulse" : ""}`}
                  aria-hidden="true"
                />
                Listening...
              </span>
            </div>

            <div className="absolute right-[18%] top-1/2 -translate-y-1/2 rounded-lg border border-lime-300/60 bg-white/68 px-2.5 py-1.5 text-center shadow-[0_0_14px_rgba(132,204,22,0.14)] backdrop-blur-xl sm:right-[6%] sm:rounded-xl sm:px-3.5 sm:py-2">
              <p className="text-[8px] tracking-[0.14em] text-emerald-700 sm:text-[9px] sm:tracking-[0.16em]">DETECTED SIGN</p>
              <p className="bg-gradient-to-b from-emerald-600 to-lime-600 bg-clip-text text-xl font-bold leading-none text-transparent animate-pulse sm:text-2xl">
                L
              </p>
              <p className="mt-0.5 text-[8px] tracking-[0.14em] text-emerald-600/80 sm:text-[9px] sm:tracking-[0.16em]">LETTER</p>
            </div>

            <div className="pointer-events-none absolute inset-[13%_30%_10%_30%] rounded-xl border border-emerald-400/45 shadow-[0_0_22px_rgba(16,185,129,0.26)] sm:inset-[12%_29.5%_10%_29.5%] sm:rounded-2xl" />
            <div className="pointer-events-none absolute inset-[13%_30%_10%_30%] rounded-xl border border-emerald-100/70 sm:inset-[12%_29.5%_10%_29.5%] sm:rounded-2xl" />

          </div>
        </div>

        <div className="mx-auto mt-3 w-full max-w-3xl sm:mt-4 lg:mt-2">
          <button
            type="button"
            disabled={permissionState === "requesting"}
            onClick={requestPermission}
            className="group w-full max-w-[360px] rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 bg-[length:200%_100%] [background-position:0%_50%] p-[1.5px] shadow-[0_0_36px_rgba(16,185,129,0.32)] transition-[transform,box-shadow,background-position] duration-300 ease-out active:scale-[0.995] hover:scale-[1.01] hover:[background-position:100%_50%] hover:shadow-[0_0_54px_rgba(16,185,129,0.45)] disabled:cursor-not-allowed disabled:opacity-70 lg:mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
            <span className="flex w-full items-center justify-between gap-2 rounded-full border border-emerald-200/70 bg-white/65 px-4 py-3 text-left backdrop-blur-xl sm:gap-3 sm:px-7 sm:py-3.5 lg:py-2.5">
              <span className="flex items-center gap-3">
                <span>
                  <span className="block text-sm font-semibold text-emerald-900 sm:text-base lg:text-base">
                    {permissionState === "requesting"
                      ? "Waiting for permission..."
                      : "Enable Camera & Mic"}
                  </span>
                  <span className="block text-[11px] text-emerald-800/80 sm:text-sm lg:text-xs">
                    Click to get started
                  </span>
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-emerald-800 transition duration-300 group-hover:translate-x-1.5 sm:h-5 sm:w-5" aria-hidden="true" />
            </span>
          </button>

          <p className="mt-2 inline-flex max-w-[320px] items-start gap-1.5 text-center text-[11px] text-emerald-800/75 sm:max-w-none sm:items-center sm:gap-2 sm:text-xs lg:mt-1">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700 sm:mt-0" aria-hidden="true" />
            A browser popup will appear next. Please click &quot;Allow&quot; to start.
          </p>
        </div>
      </section>
    </main>
  );
}
