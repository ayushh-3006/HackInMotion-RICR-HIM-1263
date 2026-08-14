"use client";
import React from "react";

interface ShinyTextProps {
  text: string;
  speed?: number;
  delay?: number;
  color?: string;
  shineColor?: string;
  spread?: number;
  direction?: "left" | "right";
  yoyo?: boolean;
  pauseOnHover?: boolean;
  disabled?: boolean;
}

export default function ShinyText({
  text,
  speed = 2,
  delay = 0,
  color = "#1C4ED6",
  shineColor = "#ffffff",
  spread = 120,
  direction = "left",
  yoyo = false,
  pauseOnHover = false,
  disabled = false,
}: ShinyTextProps) {
  if (disabled) {
    return <span style={{ color }}>{text}</span>;
  }

  const animationName =
    direction === "left" ? "shiny-text-left" : "shiny-text-right";

  return (
    <span
      className={`inline-block font-semibold bg-clip-text text-transparent ${
        pauseOnHover ? "hover:[animation-play-state:paused]" : ""
      }`}
      style={{
        backgroundImage: `linear-gradient(${
          direction === "left" ? "120deg" : "240deg"
        }, ${color} 35%, ${shineColor} 50%, ${color} 65%)`,
        backgroundSize: `${spread}% 100%`,
        WebkitBackgroundClip: "text",
        animation: `${animationName} ${speed}s linear infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      {text}
      <style>{`
        @keyframes shiny-text-left {
          0% {
            background-position: 120% 0;
          }
          100% {
            background-position: -20% 0;
          }
        }
        @keyframes shiny-text-right {
          0% {
            background-position: -20% 0;
          }
          100% {
            background-position: 120% 0;
          }
        }
      `}</style>
    </span>
  );
}
