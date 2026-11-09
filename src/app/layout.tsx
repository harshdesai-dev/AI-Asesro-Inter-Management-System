import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI ASESRO InternHub",
  description: "Internship operations, tasks, attendance and meetings in one place.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
