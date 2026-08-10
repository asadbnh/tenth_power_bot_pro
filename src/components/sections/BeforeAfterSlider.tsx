"use client";

import { useState, useRef } from "react";
import { Sparkles } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

interface Props {
  locale: Locale;
}

export function BeforeAfterSlider({ locale }: Props) {
  const isRtl = locale === "ar";
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <section className="py-12 sm:py-20 bg-background border-b border-border-light overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10 space-y-2">
          <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            {isRtl ? "المقارنة الميدانية" : "Before & After Transformation"}
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-text-primary">
            {isRtl ? "مقارنة التحول المعماري وديكور المقاهي" : "Experience the Architectural Transformation"}
          </h2>
          <p className="text-text-secondary text-xs sm:text-sm">
            {isRtl
              ? "استعراض تفاعلي يوضح التحول قبل وبعد عملية تنفيذ الديكور والتجهيز الفني في المملكة"
              : "Interactive slider showcasing technical precision in fit-out & decoration projects"}
          </p>
        </div>

        {/* Comparison Container */}
        <div
          ref={containerRef}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onTouchMove={handleTouchMove}
          className="relative aspect-[16/9] max-w-4xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-border-light select-none cursor-ew-resize"
        >
          {/* AFTER Image (Background) */}
          <div className="absolute inset-0 w-full h-full bg-[#050b18]">
            <img
              src="/images/defaults/projects/cafe-after.png"
              alt="After decoration"
              className="w-full h-full object-cover pointer-events-none"
            />
            {/* Label Overlay */}
            <div className="absolute bottom-4 end-4 z-10">
              <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] sm:text-xs font-bold shadow-lg backdrop-blur-sm">
                {isRtl ? "بعد التنفيذ — ديكور كافي فاخر" : "AFTER — Luxury Cafe Decor"}
              </span>
            </div>
          </div>

          {/* BEFORE Image (Clipped Overlay) */}
          <div
            className="absolute inset-0 w-full h-full bg-[#101010] overflow-hidden"
            style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
          >
            <img
              src="/images/defaults/projects/cafe-before.png"
              alt="Before decoration"
              className="w-full h-full object-cover pointer-events-none"
            />
            {/* Label Overlay */}
            <div className="absolute bottom-4 start-4 z-10">
              <span className="px-3 py-1 rounded-full bg-amber-500/90 text-white text-[10px] sm:text-xs font-bold shadow-lg backdrop-blur-sm">
                {isRtl ? "قبل التنفيذ — الهيكل الخرساني" : "BEFORE — Concrete Shell"}
              </span>
            </div>
          </div>

          {/* Slider Handle Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-2xl cursor-ew-resize flex items-center justify-center z-20 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-primary-950 font-bold shadow-2xl border-2 border-amber-500 flex items-center justify-center text-sm pointer-events-auto transform -translate-x-1/2">
              ↔
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
