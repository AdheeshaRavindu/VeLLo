interface LoadingStateProps {
  title: string;
  message?: string;
}

export default function LoadingState({ title, message }: LoadingStateProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-sky-500" />
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      </div>
      {message ? <p className="mt-3 text-base text-slate-600">{message}</p> : null}
    </div>
  );
}

