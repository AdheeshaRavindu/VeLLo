import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center p-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Hospital Sign-to-Voice Assistant
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          A fast, focused communication tool for predefined hospital sign gestures.
        </p>
        <Link
          href="/detect"
          className="mt-8 inline-flex rounded-xl bg-sky-600 px-6 py-3 text-lg font-semibold text-white transition hover:bg-sky-700"
        >
          Start Detection
        </Link>
      </div>
    </main>
  );
}

