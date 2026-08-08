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
    <section className="py-10 sm:py-20 bg-background border-b border-border-light overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950 text-xs font-semibold text-primary-600 dark:text-primary-300">
            <Sparkles className="w-3.5 h-3.5" />
            {isRtl ? "المقارنة الميدانية" : "Before & After Transformation"}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold">
            {isRtl ? "مقارنة التحول المعماري وجودة الإنهاء" : "Experience the Architectural Transformation"}
          </h2>
          <p className="text-text-secondary text-xs sm:text-base">
            {isRtl
              ? "استعراض تفاعلي يوضح التحول الميداني ودقة تفاصيل تركيب الواجهات الزجاجية والألمنيوم"
              : "Interactive slider showcasing technical precision in structural glass & aluminum projects"}
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
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-slate-900 to-indigo-950 flex items-center justify-center text-white">
            <div className="text-center p-4 sm:p-8 space-y-1 sm:space-y-2">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                {isRtl ? "بعد التنفيذ — واجهة زجاجية هيكلية" : "AFTER — Structural Glazing Facade"}
              </span>
              <p className="text-base sm:text-2xl font-extrabold">{isRtl ? "إنهاء معماري معتمد وعزل حراري كامل" : "Certified Finish & Thermal Insulation"}</p>
            </div>
          </div>

          {/* BEFORE Image (Clipped Overlay) */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-stone-900 flex items-center justify-center text-white overflow-hidden"
            style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
          >
            <div className="text-center p-4 sm:p-8 space-y-1 sm:space-y-2">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                {isRtl ? "قبل التنفيذ — المنشأة السابقة" : "BEFORE — Previous Structure"}
              </span>
              <p className="text-base sm:text-2xl font-extrabold text-zinc-400">{isRtl ? "مبنى قبل مرحلة التطوير الهندسي" : "Structure Prior to Development"}</p>
            </div>
          </div>

          {/* Slider Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl cursor-ew-resize flex items-center justify-center"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="w-10 h-10 rounded-full bg-white text-primary-900 font-bold shadow-xl border-2 border-primary-500 flex items-center justify-center text-xs">
              ↔
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
