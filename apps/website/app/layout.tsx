import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aawiz — Emotional Wellbeing for Modern Teams",
  description:
    "Aawiz helps employees track their mood, chat with an AI companion, and build emotional resilience — while giving managers the insights they need.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
