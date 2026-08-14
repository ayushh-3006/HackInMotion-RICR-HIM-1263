"use client";

import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { BrainCircuit } from "lucide-react";
import Link from "next/link";

// AI Career & Resume platform themed screenshots
const textBasedImages = [
  // ATS Resume Analytics & Scoring
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80", // Data metrics & charts preview
  "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80", // Code analytics & data metrics text
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80", // Business metrics dashboard

  // AI Code, JSON & Resume Parsing Data
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80", // Dark code editor screen
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80", // Matrix style text matrix
  "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80", // Python / AI script lines

  // Resume Content & Technical Writing
  "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80", // Writing resume bullet points / draft
  "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80", // Structured notes and checklist setup
  "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80", // Document review & text analysis

  // AI Prompting & Interview Feedback Logs
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80", // Digital interface & text feedback screen
  "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1200&q=80", // HTML / web syntax code
  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80", // UX wireframe with structured layout text
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-screen overflow-hidden grid-cols-1 lg:grid-cols-2 bg-[#080808]">
      {/* ── LEFT: Form Panel ─────────────────────────────── */}
      <div className="relative flex flex-col items-center justify-center px-8 py-12">
        {/* Logo top-left */}
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30">
            <BrainCircuit size={16} className="text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            AI Career Coach
          </span>
        </Link>

        {/* Form content */}
        <div className="w-full max-w-[380px]">{children}</div>
      </div>

      {/* ── RIGHT: 3D Marquee Panel ───────────────────────── */}
      <div className="hidden lg:block w-full bg-gray-950/5">
        <ThreeDMarquee images={textBasedImages} />
      </div>
    </div>
  );
}
