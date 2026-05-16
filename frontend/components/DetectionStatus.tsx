interface DetectionStatusProps {
  handDetected: boolean;
  isDetecting: boolean;
  error?: string | null;
}

export default function DetectionStatus({
  handDetected,
  isDetecting,
  error,
}: DetectionStatusProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Detection Status
      </p>
      <p className="mt-3 text-lg font-semibold text-slate-900">
        {error
          ? "Backend error"
          : isDetecting
            ? "Detecting..."
            : handDetected
              ? "Hand detected"
              : "No hand detected"}
      </p>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

