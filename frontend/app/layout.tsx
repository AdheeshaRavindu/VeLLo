import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hospital Sign-to-Voice Assistant",
  description: "Accessibility communication assistant for hospital patients.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "SignLang Detector",
  description: "Realtime sign language detection frontend",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
