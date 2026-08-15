"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, CheckCircle2, Zap, ShieldCheck } from "lucide-react";
import ButtonCTA from "@/components/Buttons/buttonCTA";
import {
  Status,
  StatusIndicator,
  StatusLabel,
} from "@/components/kibo-ui/status";

const CTA = () => {
  return (
    <section
      id="career-success"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-16 md:pb-20 lg:pb-24 mb-16 md:mb-20 lg:mb-24 overflow-hidden scroll-mt-28"
    >
      {/* Centered Section Label Above Blue Card */}
      <div className="flex items-center justify-center flex-col gap-4 mb-8 sm:mb-10 text-center w-full">
        <Status
          status="maintenance"
          className="border-neutral-200 shadow-sm font-manrope px-4 py-1.5 rounded-full flex items-center gap-2.5 bg-white"
        >
          <StatusIndicator className="h-2.5 w-2.5" />
          <StatusLabel className="text-xs sm:text-sm font-semibold text-neutral-800 tracking-wide">
            Level Up
          </StatusLabel>
        </Status>
      </div>

      <div className="relative w-full rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-blue-900 via-blue-950 to-slate-950 border border-blue-500/20 shadow-2xl shadow-blue-950/40 p-6 sm:p-10 lg:p-14 overflow-hidden text-white flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12">
        {/* Ambient Glowing Background Orbs */}
        <div className="absolute -top-32 -left-32 w-80 h-80 sm:w-96 sm:h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 sm:w-96 sm:h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent pointer-events-none" />

        {/* ── LEFT CONTENT ─────────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-start gap-6 max-w-xl text-left">
          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-manrope tracking-tight leading-tight text-white">
            Upgrade Your Resume.{" "}
            <span className="block bg-gradient-to-r from-blue-300 via-blue-200 to-indigo-200 bg-clip-text text-transparent pt-1">
              Unlock More Opportunities.
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-blue-100/80 font-inter text-sm sm:text-base lg:text-lg font-light leading-relaxed">
            Build smarter, prepare better, and move closer to your next
            opportunity with AI-powered resume tools.
          </p>

          {/* Features Highlights */}
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-blue-200/90 pt-1 font-inter">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>ATS Compatible</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Instant AI Rewrite</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-block transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              <ButtonCTA />
            </Link>
          </div>
        </div>

        {/* ── RIGHT VISUAL: 3D SaaS Resume & Career Growth Card ── */}
        <div className="relative z-10 w-full lg:w-auto flex justify-center items-center">
          <div className="relative w-full max-w-md sm:max-w-lg">
            {/* Main Preview Card */}
            <div className="relative bg-slate-900/90 border border-white/15 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    AJ
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white font-manrope">
                      Alex Johnson
                    </h3>
                    <p className="text-xs text-slate-400">
                      Senior Software Engineer
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  98% ATS Match
                </span>
              </div>

              {/* Progress Metric */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-300">
                  <span>Resume Optimization Score</span>
                  <span className="text-blue-400 font-bold">98/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full w-[98%]" />
                </div>
              </div>

              {/* Bullet Highlights Preview */}
              <div className="space-y-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Increased API processing speed by 42% through query caching.
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Led cross-functional team of 6 to ship high-impact features.
                  </span>
                </div>
              </div>
            </div>

            {/* Floating Metric Badge 1 (Top-Right) */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-5 -right-4 sm:-right-6 bg-slate-900/95 border border-blue-500/30 rounded-xl p-3 shadow-xl backdrop-blur-md flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white font-manrope">
                  +140% Interview Rate
                </p>
                <p className="text-[10px] text-slate-400">
                  Targeted Role Match
                </p>
              </div>
            </motion.div>

            {/* Floating Metric Badge 2 (Bottom-Left) */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 4.5,
                ease: "easeInOut",
              }}
              className="absolute -bottom-5 -left-4 sm:-left-6 bg-slate-900/95 border border-emerald-500/30 rounded-xl p-3 shadow-xl backdrop-blur-md flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white font-manrope">
                  AI Resume Enhanced
                </p>
                <p className="text-[10px] text-slate-400">
                  Ready for Application
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
