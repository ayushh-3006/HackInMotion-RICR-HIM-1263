import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Career Coach — Resume Analyzer & Mock Interview Platform",
  description:
    "Analyze your resume against job descriptions, get ATS match scores, practice mock interviews with AI feedback, and track your progress — all in one place.",
  keywords: [
    "resume analyzer",
    "mock interview",
    "AI career coach",
    "ATS checker",
    "job search",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-[#080808] text-white"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
