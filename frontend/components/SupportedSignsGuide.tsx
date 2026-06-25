import type { Intent } from "@/types";

type SupportedSign = {
  intent: Intent;
  label: string;
  phrase: string;
  gesture: string;
  tip: string;
};

type SupportedSignsGuideProps = {
  variant?: "dark" | "light";
  compact?: boolean;
  className?: string;
};

const SUPPORTED_SIGNS: SupportedSign[] = [
  {
    intent: "help",
    label: "HELP",
    phrase: "Please help me.",
    gesture: "Thumb-up or loose fist above an open support palm.",
    tip: "Use both hands when possible.",
  },
  {
    intent: "water",
    label: "WATER",
    phrase: "I need water.",
    gesture: "Hold index, middle, and ring fingers up in a W shape.",
    tip: "Keep thumb and pinky folded.",
  },
  {
    intent: "pain",
    label: "PAIN",
    phrase: "I am in pain.",
    gesture: "Show both index fingers and bring them close together.",
    tip: "Keep both hands in frame.",
  },
  {
    intent: "yes",
    label: "YES",
    phrase: "Yes.",
    gesture: "Make a closed fist and gently nod it up and down.",
    tip: "A still fist also works.",
  },
  {
    intent: "no",
    label: "NO",
    phrase: "No.",
    gesture: "Extend index and middle fingers together.",
    tip: "Keep other fingers down.",
  },
  {
    intent: "stop",
    label: "STOP",
    phrase: "Please stop.",
    gesture: "Use an open-palm stop or two-hand chop pose.",
    tip: "Face the palm to camera.",
  },
];

export default function SupportedSignsGuide({
  variant = "light",
  compact = false,
  className = "",
}: SupportedSignsGuideProps) {
  const isDark = variant === "dark";

  return (
    <article
      className={`${className} rounded-2xl border ${
        isDark
          ? "border-emerald-400/25 bg-[#0b1a31]/68 text-emerald-50 shadow-[0_0_16px_rgba(16,185,129,0.14),0_0_14px_rgba(56,189,248,0.1)]"
          : "border-emerald-200 bg-white text-emerald-950 shadow-sm"
      } p-3 backdrop-blur-xl`}
    >
      <div className="mb-2 flex flex-col items-start gap-2 min-[380px]:flex-row min-[380px]:justify-between">
        <div>
          <p
            className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${
              isDark ? "text-emerald-100" : "text-emerald-700"
            }`}
          >
            Supported Signs
          </p>
          <p className={`mt-1 text-xs ${isDark ? "text-emerald-100/65" : "text-emerald-800/70"}`}>
            Show one sign clearly in the camera frame.
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
            isDark
              ? "border border-emerald-300/25 bg-emerald-900/55 text-emerald-100"
              : "border border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          6 signs
        </span>
      </div>

      <div
        className={`grid gap-1.5 ${
          compact ? "max-h-[190px] overflow-y-auto pr-1" : "sm:grid-cols-2"
        }`}
      >
        {SUPPORTED_SIGNS.map((sign) => (
          <div
            key={sign.intent}
            className={`rounded-xl border px-2.5 py-2 ${
              isDark
                ? "border-emerald-400/20 bg-emerald-900/45"
                : "border-emerald-100 bg-emerald-50/70"
            }`}
          >
            <div className="flex flex-col gap-0.5 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between min-[380px]:gap-2">
              <p
                className={`text-[11px] font-black tracking-[0.16em] ${
                  isDark ? "text-emerald-100" : "text-emerald-800"
                }`}
              >
                {sign.label}
              </p>
              <p className={`text-[10px] leading-snug ${isDark ? "text-lime-200/80" : "text-emerald-700/80"}`}>
                {sign.phrase}
              </p>
            </div>
            <p className={`mt-1 text-[11px] leading-snug ${isDark ? "text-white" : "text-slate-800"}`}>
              {sign.gesture}
            </p>
            {!compact ? (
              <p className={`mt-1 text-[10px] ${isDark ? "text-emerald-100/55" : "text-slate-500"}`}>
                {sign.tip}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </article>
  );
}
