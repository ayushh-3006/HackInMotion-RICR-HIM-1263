"use client";

import React, { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = score / 60;
    const t = setInterval(() => {
      current += step;
      if (current >= score) {
        setAnimated(score);
        clearInterval(t);
      } else setAnimated(Math.floor(current));
    }, 16);
    return () => clearInterval(t);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 80)
      return {
        stroke: "#10B981",
        text: "text-emerald-500",
        bg: "bg-emerald-50",
        label: "Excellent Match",
      };
    if (s >= 60)
      return {
        stroke: "#3B82F6",
        text: "text-blue-500",
        bg: "bg-blue-50",
        label: "Good Match",
      };
    if (s >= 40)
      return {
        stroke: "#F59E0B",
        text: "text-amber-500",
        bg: "bg-amber-50",
        label: "Fair Match",
      };
    return {
      stroke: "#EF4444",
      text: "text-red-500",
      bg: "bg-red-50",
      label: "Needs Improvement",
    };
  };

  const colors = getColor(score);
  const r = 70;
  const strokeW = 14;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animated / 100) * circ;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col items-center justify-center h-full shadow-sm">
      <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-6">
        Match Score
      </h3>
      <div className="relative">
        <svg width="180" height="180" style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx="90"
            cy="90"
            r={r}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={strokeW}
          />
          <circle
            cx="90"
            cy="90"
            r={r}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.05s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-black tracking-tight ${colors.text}`}>
            {animated}
          </span>
          <span className="text-lg font-bold text-slate-300">%</span>
        </div>
      </div>
      <span
        className={`mt-4 text-xs font-bold px-3 py-1.5 rounded-full ${colors.bg} ${colors.text}`}
      >
        {colors.label}
      </span>
    </div>
  );
}
