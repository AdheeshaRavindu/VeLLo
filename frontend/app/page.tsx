import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>SignLang Detector</h1>
      <p>Frontend is running successfully.</p>
      <Link href="/detect">Go to detection page</Link>
    </main>
  );
}
