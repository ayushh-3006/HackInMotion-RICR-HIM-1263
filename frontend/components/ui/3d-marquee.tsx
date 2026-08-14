"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useRef } from "react";

interface ThreeDMarqueeProps {
  images: string[];
  className?: string;
}

export function ThreeDMarquee({ images, className = "" }: ThreeDMarqueeProps) {
  const columns = 4;
  const cols: string[][] = Array.from({ length: columns }, (_, i) =>
    images.filter((_, idx) => idx % columns === i),
  );

  const duplicated = cols.map((col) => [...col, ...col]);

  const speeds = [25, 30, 22, 28]; // seconds per full scroll for each column
  const directions = [1, -1, 1, -1]; // alternating up/down

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-slate-50 ${className}`}
      style={{
        perspective: "900px",
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-slate-50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-slate-50 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-slate-50 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-slate-50 to-transparent" />

      {/* 3D rotated grid */}
      <div
        className="flex h-[150%] w-[120%] gap-3 px-3 py-4 absolute top-1/2 left-1/2"
        style={{
          transform:
            "translate(-50%, -50%) rotateX(15deg) rotateZ(-8deg) scale(1.15)",
          transformOrigin: "center center",
        }}
      >
        {duplicated.map((col, colIdx) => (
          <MarqueeColumn
            key={colIdx}
            images={col}
            speed={speeds[colIdx % speeds.length]}
            direction={directions[colIdx % directions.length]}
          />
        ))}
      </div>
    </div>
  );
}

interface MarqueeColumnProps {
  images: string[];
  speed: number;
  direction: number;
}

function MarqueeColumn({ images, speed, direction }: MarqueeColumnProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    let isActive = true;

    // Small delay ensures images have painted and scrollHeight is accurate
    const timeout = setTimeout(() => {
      if (!isActive) return;
      const el = ref.current;
      if (!el) return;

      const gap = 12; // gap-3 = 12px
      const half = (el.scrollHeight + gap) / 2;
      let pos = direction === 1 ? 0 : half;

      const pixelsPerMs = half / speed / 1000;
      let lastTime = performance.now();

      function tick(time: number) {
        if (!isActive) return;
        const dt = time - lastTime;
        lastTime = time;
        // Cap dt to prevent massive jumps if tab is backgrounded
        const safeDt = Math.min(dt, 50);

        pos += pixelsPerMs * safeDt * direction;
        if (direction === 1 && pos >= half) pos -= half;
        if (direction === -1 && pos <= 0) pos += half;

        el!.style.transform = `translateY(${-pos}px)`;
        raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
    }, 100);

    return () => {
      isActive = false;
      clearTimeout(timeout);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed, direction]);

  return (
    <div className="relative flex-1 overflow-hidden">
      <div ref={ref} className="flex flex-col gap-3 will-change-transform">
        {images.map((src, i) => (
          <MarqueeCard key={`${src}-${i}`} src={src} index={i} />
        ))}
      </div>
    </div>
  );
}

function MarqueeCard({ src, index }: { src: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md"
      style={{ aspectRatio: "16/10" }}
    >
      <Image
        src={src}
        alt={`Preview ${index}`}
        fill
        priority
        className="object-cover transition-transform duration-500 hover:scale-105 invert hue-rotate-180"
        sizes="(max-width: 768px) 50vw, 25vw"
        unoptimized // Allow external URLs without next.config domains config
      />
      {/* Subtle inner glow overlay */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-slate-900/5" />
    </motion.div>
  );
}
