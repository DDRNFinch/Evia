import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evia — Apprentice Vocational Assistant",
  description: "Your course, study and portfolio in one beautifully simple place.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
