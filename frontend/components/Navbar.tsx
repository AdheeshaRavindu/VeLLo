import Link from "next/link";

export default function Navbar() {
  return (
    <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">
            Accessibility MVP
          </p>
          <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
            Hospital Sign-to-Voice Assistant
          </h1>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Home
        </Link>
      </div>
    </header>
  );
}

