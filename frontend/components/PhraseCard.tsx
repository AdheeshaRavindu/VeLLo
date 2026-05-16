interface PhraseCardProps {
  phrase: string | null;
  confidence: number;
  displayThreshold: number;
  suppressionReason: "no_phrase_from_backend" | "confidence_below_display_gate" | null;
}

const SUPPRESSION_REASON_TEXT: Record<
  NonNullable<PhraseCardProps["suppressionReason"]>,
  string
> = {
  no_phrase_from_backend: "No accepted phrase from backend yet.",
  confidence_below_display_gate: "Confidence is below the display gate.",
};

export default function PhraseCard({
  phrase,
  confidence,
  displayThreshold,
  suppressionReason,
}: PhraseCardProps) {
  const phraseText = phrase ? phrase.replaceAll("_", " ").replace(/\.$/, "").toUpperCase() : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Recognized Phrase
      </p>
      <p className="mt-3 text-2xl font-bold text-slate-900">
        {phraseText ?? "Waiting for gesture..."}
      </p>
      <p className="mt-2 text-sm text-slate-600">Confidence: {(confidence * 100).toFixed(0)}%</p>
      <p className="mt-1 text-xs text-slate-500">
        Display threshold: {(displayThreshold * 100).toFixed(0)}%
      </p>
      {suppressionReason ? (
        <p className="mt-2 text-xs text-amber-700">{SUPPRESSION_REASON_TEXT[suppressionReason]}</p>
      ) : null}
    </div>
  );
}

