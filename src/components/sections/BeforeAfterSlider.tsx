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
    <section className="py-20 bg-background border-b border-border-light overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100 dark:bg-primary-950 text-xs font-semibold text-primary-600 dark:text-primary-300">
            <Sparkles className="w-3.5 h-3.5" />
            {isRtl ? "قبل وبعد التنفيذ" : "Before & After Transformation"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            {isRtl ? "شاهد الفارق في جودة التنفيذ والتحول المعماري" : "Experience the Architectural Transformation"}
          </h2>
          <p className="text-text-secondary text-sm sm:text-base">
            {isRtl
              ? "اسحب الشريط التفاعلي لملاحظة الدقة العالية واللمسات النهائية لمشاريع الزجاج والألمنيوم"
              : "Drag the interactive slider to see the precision and craftsmanship in our glass & aluminum projects"}
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
          className="relative aspect-[16/9] max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-border-light select-none cursor-ew-resize"
        >
          {/* AFTER Image (Background) */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-slate-900 to-indigo-950 flex items-center justify-center text-white">
            <div className="text-center p-8 space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                {isRtl ? "بعد التنفيذ — واجهة زجاج سكريت الحديثة" : "AFTER — Modern Glass Facade"}
              </span>
              <p className="text-xl sm:text-3xl font-extrabold">{isRtl ? "تشطيب فخم وعزل حراري كامل" : "Luxurious Finish & Thermal Insulation"}</p>
            </div>
          </div>

          {/* BEFORE Image (Clipped Overlay) */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-stone-900 flex items-center justify-center text-white overflow-hidden"
            style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
          >
            <div className="text-center p-8 space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                {isRtl ? "قبل التنفيذ — الموقع القديم" : "BEFORE — Old Structure"}
              </span>
              <p className="text-xl sm:text-3xl font-extrabold text-zinc-400">{isRtl ? "مبنى قديم يحتاج لتحديث معاري" : "Outdated Building Structure"}</p>
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
