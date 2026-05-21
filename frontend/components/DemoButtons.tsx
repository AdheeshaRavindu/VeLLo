import type { Intent } from "@/types";

const DEMO_INTENTS: Intent[] = [
  "yes",
  "no",
  "pain",
  "water",
  "help",
  "stop",
];

interface DemoButtonsProps {
  onSelectIntent: (intent: Intent) => void;
}

export default function DemoButtons({ onSelectIntent }: DemoButtonsProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">Demo Mode</p>
      <p className="mb-3 text-xs text-slate-600">Single-sign stabilization mode</p>
      <div className="grid grid-cols-2 gap-2">
        {DEMO_INTENTS.map((intent) => (
          <button
            key={intent}
            type="button"
            onClick={() => onSelectIntent(intent)}
            className="rounded-lg bg-slate-100 px-3 py-2 text-left text-sm font-medium text-slate-800 transition hover:bg-sky-100"
          >
            {intent.replaceAll("_", " ")}
          </button>
        ))}
      </div>
    </div>
  );
}

