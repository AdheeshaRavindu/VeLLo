interface PhraseCardProps {
  phrase: string | null;
  confidence: number;
}

export default function PhraseCard({ phrase, confidence }: PhraseCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Recognized Phrase
      </p>
      <p className="mt-3 text-2xl font-bold text-slate-900">
        {phrase ?? "Waiting for gesture..."}
      </p>
      <p className="mt-2 text-sm text-slate-600">Confidence: {(confidence * 100).toFixed(0)}%</p>
    </div>
  );
}

