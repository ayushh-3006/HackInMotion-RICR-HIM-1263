"use client";
import React from "react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Sparkles } from "lucide-react";

export default function HoverBorderGradientDemo() {
  return (
    <div className="flex justify-center text-center">
      <HoverBorderGradient
        containerClassName="rounded-full"
        as="div"
        className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 px-4 py-1.5 text-xs font-semibold"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#1C4ED6] animate-pulse" />
        <span>Introducing Resume Builder v2.0</span>
      </HoverBorderGradient>
    </div>
  );
}
