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
        className="bg-white text-[#1C4ED6] flex items-center gap-2 px-2 py-1.5 text-xs font-medium shadow-sm"
      >
        <span className="bg-[#1C4ED6] text-white px-3 py-1 rounded-full text-[10px] font-bold">
          NEW
        </span>

        <span>Introducing Resume Builder v2.0 </span>


      </HoverBorderGradient>
    </div>
  );
}
