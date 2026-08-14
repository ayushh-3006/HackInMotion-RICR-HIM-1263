"use client";

import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { BrainCircuit } from "lucide-react";
import Link from "next/link";

// AI Career & Resume platform themed screenshots
const baseImages = [
  "https://assets.aceternity.com/flip-text.png",
  "https://assets.aceternity.com/hero-highlight.png",
  "https://assets.aceternity.com/cloudinary_bkp/typewriter-effect.png",
  "https://assets.aceternity.com/glowing-effect.webp",
  "https://assets.aceternity.com/placeholders-and-vanish-input.png",
];

// Repeat the 5 images multiple times to ensure the 3D Marquee has enough items to scroll smoothly
const images = Array(6).fill(baseImages).flat();

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
        <ThreeDMarquee images={images} />
      </div>
    </div>
  );
}
