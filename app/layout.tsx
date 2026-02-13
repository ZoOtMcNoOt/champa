import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Champa's Valentine Scrapbook",
  description: "A private, cozy memory timeline and diary for Champa's favorite human.",
  robots: {
    index: false,
    follow: false
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
