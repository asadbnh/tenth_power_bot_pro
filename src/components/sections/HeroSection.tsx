"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Building2,
  Bot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { AnimatedCanvasBanner } from "@/components/ui/AnimatedCanvasBanner";
import { SmartFallbackImage } from "@/components/ui/SmartFallbackImage";
import { PageHeroBackground } from "@/components/ui/PageHeroBackground";

interface HeroSectionProps {
  locale: Locale;
  dict: Dictionary;
}

const HERO_SLIDES = [
  {
    id: 1,
    title_ar: "برج التجارة المعماري — واجهات زجاجية هيكلية",
    title_en: "Commercial Tower — Structural Glazing Facade",
    badge_ar: "زجاج سيكوريت 12مم دبل",
    badge_en: "12mm Double Tempered",
    src: "/images/defaults/projects/project-1.jpg",
  },
  {
    id: 2,
    title_ar: "مجمع النخيل السكني — ألمنيوم كسر حراري",
    title_en: "Al-Nakheel Residence — Thermal-Break Aluminum",
    badge_ar: "عزل حراري وضوضاء 100%",
    badge_en: "100% Thermal & Noise Proof",
    src: null,
  },
  {
    id: 3,
    title_ar: "المبنى الإداري — أبواب وواجهات أوتوماتيكية",
    title_en: "Corporate HQ — Automatic Glass Doors",
    badge_ar: "إكسسوارات استانلس ستيل 316",
    badge_en: "Stainless 316 Hardware",
    src: null,
  },
  {
    id: 4,
    title_ar: "مركز الرياض التجاري — أنظمة كرتن وول وسبايدر",
    title_en: "Riyadh Trade Mall — Curtain Wall & Spider System",
    badge_ar: "مواصفات SBC معتمدة",
    badge_en: "SBC Saudi Building Code",
    src: null,
  },
];

/**
 * Premium Cinematic Hero Section
 * Inspired by high-end luxury architectural & product launches.
 * GPU-accelerated, SEO-friendly, fully responsive, and conversion-optimized.
 */
export function HeroSection({ locale, dict }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [aiPrompt, setAiPrompt] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const isRtl = locale === "ar";

  // Automatic periodic slide change every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = HERO_SLIDES[activeSlide];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Smooth Parallax transforms
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, 80]);

  // Desktop 3D Mouse Parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 24;
      const y = (e.clientY / window.innerHeight - 0.5) * 24;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-ai-chat", { detail: { prompt: aiPrompt } })
      );
      setAiPrompt("");
    }
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-dvh flex items-center justify-center pt-[var(--header-height)] pb-16 overflow-hidden bg-[#070d1e] select-none"
      aria-label={isRtl ? "القسم الرئيسي للشركة" : "Main Hero Section"}
    >
      {/* ── 1. Architectural Canvas Backdrop ──────────────────────────── */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ y: backgroundY }}
      >
        {/* Optional JSON Background Image with graceful color fallback */}
        <PageHeroBackground pageKey="home" />

        {/* Animated Canvas Glass Blueprint Background */}
        <AnimatedCanvasBanner
          aspectRatio="auto"
          showDetailedGrid={true}
          className="w-full h-full opacity-65"
        />

        {/* Ambient Radial Lighting Orbs */}
        <motion.div
          className="absolute top-1/4 start-1/6 w-[34rem] h-[34rem] rounded-full opacity-25 filter blur-[90px]"
          style={{
            background: "radial-gradient(circle, rgba(10,29,55,0.9) 0%, rgba(59,130,246,0.3) 60%, transparent 100%)",
            x: mousePos.x * 0.4,
            y: mousePos.y * 0.4,
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 end-1/6 w-[30rem] h-[30rem] rounded-full opacity-20 filter blur-[80px]"
          style={{
            background: "radial-gradient(circle, rgba(212,175,55,0.4) 0%, rgba(245,158,11,0.2) 60%, transparent 100%)",
            x: mousePos.x * -0.4,
            y: mousePos.y * -0.4,
          }}
          animate={{ scale: [1.1, 0.95, 1.1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Dark Vignette Overlay for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070d1e] via-[#070d1e]/60 to-[#070d1e]/80" />
      </motion.div>

      {/* ── 2. Hero Content Container ─────────────────────────────────── */}
      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-10"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-6 text-center lg:text-start">
            {/* Royal Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0b172e] text-amber-400 shadow-md backdrop-blur-xl border border-amber-500/40"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs sm:text-sm font-bold tracking-wide text-amber-400">
                {isRtl
                  ? "شركة القوة العاشرة للمقاولات العامة والواجهات المعمارية"
                  : "Tenth Power General Contracting & Facades"}
              </span>
            </motion.div>

            {/* Main H1 Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-2xl sm:text-4xl lg:text-6xl font-extrabold !text-white leading-snug sm:leading-[1.15] tracking-tight"
              style={{ color: "#ffffff" }}
            >
              {isRtl ? (
                <>
                  <span className="!text-white" style={{ color: "#ffffff" }}>حلول هندسية متكاملة</span>{" "}
                  <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">
                    للواجهات المعمارية
                  </span>{" "}
                  <span className="!text-white" style={{ color: "#ffffff" }}>والمقاولات العامة</span>
                </>
              ) : (
                <>
                  <span className="!text-white" style={{ color: "#ffffff" }}>Integrated Engineering Solutions for</span>{" "}
                  <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">
                    Architectural Facades
                  </span>
                </>
              )}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xs sm:text-base lg:text-lg !text-slate-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
              style={{ color: "#e2e8f0" }}
            >
              {dict.hero.subtitle ||
                (isRtl
                  ? "تطبيق أعلى المعايير الفنية والمواصفات المعمارية المعتمدة في تصميم وتوريد وتنفيذ الزجاج السيكوريت، الألمنيوم، وأنظمة المباني الحديثة."
                  : "Applying top architectural specifications and building standards in securit glass, structural facades, aluminum, and contracting.")}
            </motion.p>

            {/* CTAs Action Bar: 2 Columns Side-by-Side on Mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="grid grid-cols-2 sm:flex sm:flex-row items-center justify-center lg:justify-start gap-2.5 pt-1"
            >
              <Link
                href={`/${locale}/quote`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-primary-950 font-bold text-xs sm:text-base shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-300"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-950 shrink-0" />
                <span className="truncate">{dict.hero.ctaSecondary || (isRtl ? "طلب دراسة مشروع" : "Project Inquiry")}</span>
                <ArrowRight className={cn("w-3.5 h-3.5 hidden sm:inline", isRtl && "rotate-180")} />
              </Link>

              <Link
                href={`/${locale}/services`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-base border border-white/20 backdrop-blur-md hover:scale-[1.02] active:scale-95 transition-all duration-300"
                style={{ color: "#ffffff" }}
              >
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                <span className="truncate">{isRtl ? "خدماتنا الهندسية" : "Services"}</span>
              </Link>
            </motion.div>

            {/* AI Engineering Assistant Search Input */}
            <motion.form
              onSubmit={handleAiSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="pt-1 max-w-xl mx-auto lg:mx-0"
            >
              <div className="relative flex items-center p-1 rounded-xl bg-[#0b172e]/90 border border-amber-500/30 backdrop-blur-xl shadow-xl focus-within:border-amber-400 transition-all">
                <div className="flex items-center gap-1.5 px-2.5 text-amber-400">
                  <Bot className="w-4 h-4 shrink-0" />
                </div>
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={
                    isRtl
                      ? "استعلام فني عن مواصفات الواجهات والمقاولات..."
                      : "Technical inquiry on facades & engineering specs..."
                  }
                  className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none px-1 py-1.5"
                  style={{ color: "#ffffff" }}
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-primary-950 font-bold text-xs shrink-0 transition-colors shadow-sm"
                >
                  {isRtl ? "استعلام" : "Inquire"}
                </button>
              </div>
            </motion.form>
          </div>

          {/* Right Column: 3D Image Showcase Slideshow Carousel & Floating Badges */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Main Interactive Rotating Image Showcase Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              style={{
                x: mousePos.x * -0.5,
                y: mousePos.y * -0.5,
              }}
              className="relative w-full max-w-md rounded-2xl overflow-hidden border border-white/20 bg-[#0b172e]/95 backdrop-blur-2xl shadow-2xl flex flex-col group"
            >
              {/* Image Frame Container */}
              <div className="relative h-44 sm:h-64 w-full overflow-hidden bg-[#070d1e]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide.id}
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <SmartFallbackImage
                      src={currentSlide.src}
                      alt={isRtl ? currentSlide.title_ar : currentSlide.title_en}
                      aspectRatio="auto"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Dark Vignette Overlay for Title Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Top Badge Overlay */}
                <div className="absolute top-2.5 start-2.5 end-2.5 flex items-center justify-between z-10">
                  <span className="bg-amber-500 text-slate-950 font-bold shadow-sm backdrop-blur-md text-[11px] px-2 py-0.5 rounded-full">
                    {isRtl ? currentSlide.badge_ar : currentSlide.badge_en}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-amber-400 border border-white/20 text-[10px] font-bold">
                    0{activeSlide + 1}
                  </div>
                </div>

                {/* Manual Navigation Arrow Buttons */}
                <button
                  onClick={() => setActiveSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))}
                  className="absolute top-1/2 start-2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  aria-label="Previous Slide"
                >
                  <ChevronRight className={cn("w-3.5 h-3.5", !isRtl && "rotate-180")} />
                </button>
                <button
                  onClick={() => setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
                  className="absolute top-1/2 end-2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  aria-label="Next Slide"
                >
                  <ChevronLeft className={cn("w-3.5 h-3.5", !isRtl && "rotate-180")} />
                </button>
              </div>

              {/* Bottom Project Description & Progress Indicator */}
              <div className="p-3 sm:p-4 bg-[#070d1e] space-y-1.5 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs sm:text-sm !text-white line-clamp-1" style={{ color: "#ffffff" }}>
                    {isRtl ? currentSlide.title_ar : currentSlide.title_en}
                  </h3>
                </div>

                {/* Dots Progress Indicators */}
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-1">
                    {HERO_SLIDES.map((slide, idx) => (
                      <button
                        key={slide.id}
                        onClick={() => setActiveSlide(idx)}
                        className={cn(
                          "h-1 rounded-full transition-all duration-500",
                          activeSlide === idx
                            ? "w-4 bg-amber-400 shadow-md shadow-amber-400/40"
                            : "w-1 bg-white/30 hover:bg-white/50"
                        )}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── 4. Scroll Down Indicator ─────────────────────────────────── */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.scrollTo({ top: window.innerHeight * 0.9, behavior: "smooth" });
            }
          }}
        >
          <span className="text-xs font-semibold tracking-wider uppercase">
            {isRtl ? "استكشف المزيد" : "Scroll Down"}
          </span>
          <ChevronDown className="w-4 h-4 text-amber-400 animate-pulse" />
        </motion.div>
      </motion.div>
    </section>
  );
}
