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

        {/* Dark Vignette Gradient for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070d1e] via-[#070d1e]/60 to-[#070d1e]/80" />
      </motion.div>

      {/* ── 2. Hero Content Container ─────────────────────────────────── */}
      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-start">
            {/* Royal Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full royal-badge shadow-lg backdrop-blur-xl border border-amber-500/30"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-bold tracking-wide">
                {isRtl
                  ? "القوة العاشرة للمقاولات العامة والزجاج والواجهات"
                  : "Tenth Power General Contracting & Glass Facades"}
              </span>
            </motion.div>

            {/* Main H1 Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] tracking-tight"
            >
              {isRtl ? (
                <>
                  نُحوّل رؤيتك إلى{" "}
                  <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent underline decoration-amber-500/30 decoration-wavy decoration-2">
                    تحفة معمارية
                  </span>{" "}
                  بأعلى معايير الجودة والضمان
                </>
              ) : (
                <>
                  Transforming Your Vision into{" "}
                  <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">
                    Architectural Excellence
                  </span>
                </>
              )}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              {dict.hero.subtitle ||
                (isRtl
                  ? "حلول متكاملة في الزجاج السيكوريت، الواجهات المعمارية، الألمنيوم، والمقاولات العامة بضمان شامل يصل إلى 10 سنوات."
                  : "Integrated solutions in securit glass, architectural facades, aluminum profiles, and general contracting with comprehensive 10-year warranty.")}
            </motion.p>

            {/* CTAs Action Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link
                href={`/${locale}/quote`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-primary-950 font-extrabold text-base shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.03] active:scale-95 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 text-primary-950" />
                <span>{dict.hero.cta || (isRtl ? "طلب عرض سعر مجاني" : "Request Free Quote")}</span>
                <ArrowRight className={cn("w-5 h-5", isRtl && "rotate-180")} />
              </Link>

              <Link
                href={`/${locale}/services`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-surface-elevated/80 hover:bg-surface-elevated text-white font-bold text-base border border-white/15 hover:border-amber-500/40 backdrop-blur-md hover:scale-[1.02] active:scale-95 transition-all duration-300"
              >
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>{isRtl ? "استكشف خدماتنا" : "Explore Services"}</span>
              </Link>
            </motion.div>

            {/* AI Prompt Input Trigger Bar */}
            <motion.form
              onSubmit={handleAiSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="pt-2 max-w-xl mx-auto lg:mx-0"
            >
              <div className="relative flex items-center p-1.5 rounded-2xl bg-surface-elevated/90 border border-amber-500/30 backdrop-blur-xl shadow-2xl focus-within:border-amber-400 transition-all">
                <div className="flex items-center gap-2 px-3 text-amber-400">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={
                    isRtl
                      ? "🤖 اسأل المساعد الذكي عن تكلفة الواجهات والزجاج..."
                      : "🤖 Ask AI Assistant about glass & facade pricing..."
                  }
                  className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none px-2 py-2"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-primary-950 font-bold text-xs shrink-0 transition-colors shadow-md"
                >
                  {isRtl ? "اسأل الآن" : "Ask AI"}
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
              className="relative w-full max-w-md rounded-3xl overflow-hidden border border-white/20 bg-surface-elevated/95 backdrop-blur-2xl shadow-2xl flex flex-col group"
            >
              {/* Image Frame Container */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#070d1e]">
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
                <div className="absolute top-4 start-4 end-4 flex items-center justify-between z-10">
                  <span className="royal-badge-gold shadow-md backdrop-blur-md">
                    {isRtl ? currentSlide.badge_ar : currentSlide.badge_en}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-amber-400 border border-white/10 text-xs font-bold">
                    0{activeSlide + 1}
                  </div>
                </div>

                {/* Manual Navigation Arrow Buttons */}
                <button
                  onClick={() => setActiveSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))}
                  className="absolute top-1/2 start-2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/15 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  aria-label="Previous Slide"
                >
                  <ChevronRight className={cn("w-4 h-4", !isRtl && "rotate-180")} />
                </button>
                <button
                  onClick={() => setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
                  className="absolute top-1/2 end-2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/15 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  aria-label="Next Slide"
                >
                  <ChevronLeft className={cn("w-4 h-4", !isRtl && "rotate-180")} />
                </button>
              </div>

              {/* Bottom Project Description & Progress Indicator */}
              <div className="p-5 sm:p-6 bg-surface-elevated/95 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm sm:text-base text-white line-clamp-1">
                    {isRtl ? currentSlide.title_ar : currentSlide.title_en}
                  </h3>
                </div>

                {/* Dots Progress Indicators */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    {HERO_SLIDES.map((slide, idx) => (
                      <button
                        key={slide.id}
                        onClick={() => setActiveSlide(idx)}
                        className={cn(
                          "h-2 rounded-full transition-all duration-500",
                          activeSlide === idx
                            ? "w-6 bg-amber-400 shadow-md shadow-amber-400/40"
                            : "w-2 bg-white/20 hover:bg-white/40"
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

        {/* ── 3. Trust Metrics & Statistics Ribbon ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.1 }}
          className="mt-16 sm:mt-20 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          {[
            { value: "+500", label_ar: "مشروع منفذ", label_en: "Executed Projects", color: "text-amber-400" },
            { value: "15+", label_ar: "سنة خبرة معمارية", label_en: "Years Experience", color: "text-blue-400" },
            { value: "100%", label_ar: "ضمان جودة المواد", label_en: "Quality Warranty", color: "text-emerald-400" },
            { value: "1,200+", label_ar: "عميل يثق بنا", label_en: "Satisfied Clients", color: "text-yellow-400" },
          ].map((stat, idx) => (
            <div key={idx} className="space-y-1 p-3 rounded-2xl hover:bg-white/5 transition-colors">
              <p className={cn("text-2xl sm:text-4xl font-extrabold tracking-tight", stat.color)}>
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-300">
                {isRtl ? stat.label_ar : stat.label_en}
              </p>
            </div>
          ))}
        </motion.div>
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
