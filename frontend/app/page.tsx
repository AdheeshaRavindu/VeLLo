"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/gatekeeper");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-emerald-50 px-4 text-center text-emerald-950">
      <p className="rounded-2xl border border-emerald-200 bg-white/80 px-4 py-3 text-sm shadow-sm">
        Opening camera permission screen...
      </p>
    </main>
  );
}
