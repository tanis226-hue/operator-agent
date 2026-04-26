import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpsAdvisor",
  description:
    "Diagnose where leads are leaking, fix the biggest operational breakdown, and put controls in place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
