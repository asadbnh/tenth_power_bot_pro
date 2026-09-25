"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Building2,
  ShieldCheck,
  Award,
  Ruler,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { AnimatedCanvasBanner } from "@/components/ui/AnimatedCanvasBanner";
import { SmartFallbackImage } from "@/components/ui/SmartFallbackImage";
import { PageHeroBackground } from "@/components/ui/PageHeroBackground";

export interface HeroSlideItem {
  id: number | string;
  title_ar: string;
  title_en: string;
  badge_ar?: string;
  badge_en?: string;
  src: string | null;
}

interface HeroSectionProps {
  locale: Locale;
  dict: Dictionary;
  initialSlides?: HeroSlideItem[];
}

const HERO_SLIDES: HeroSlideItem[] = [
  {
    id: 1,
    title_ar: "واجهات زجاجية هيكلية (Structural Glazing) — برج الأعمال، العليا",
    title_en: "Structural Glazing Facade — Business Tower, Olaya",
    badge_ar: "سيكوريت دبل 24مم عازل حراري",
    badge_en: "24mm Double Tempered",
    src: "/images/defaults/projects/project-1.webp",
  },
  {
    id: 2,
    title_ar: "واجهات كرتن وول وسبايدر — مجمع تجاري، طريق الملك فهد",
    title_en: "Curtain Wall & Spider Systems — King Fahd Road",
    badge_ar: "إكسسوارات ستانلس 316 معتمدة",
    badge_en: "Stainless 316 Hardware",
    src: "/images/defaults/services/glass-facades.webp",
  },
  {
    id: 3,
    title_ar: "قواطع مكاتب زجاجية وأبواب سيكوريت — حي الملقا بالرياض",
    title_en: "Glass Partitions & Securit Doors — Al Malqa District",
    badge_ar: "عزل صوتي تام 100% سوفت كلوز",
    badge_en: "100% Soundproof Soft-Close",
    src: "/images/defaults/services/luxury-facade.webp",
  },
  {
    id: 4,
    title_ar: "أعمال الألمنيوم المعزول والكلادينج — مجمع سكني فاخر",
    title_en: "Thermal-Break Aluminum & Cladding — Luxury Complex",
    badge_ar: "كود البناء السعودي SBC معتمد",
    badge_en: "SBC Saudi Building Code",
    src: "/images/defaults/services/aluminum-works.webp",
  },
];

/**
 * Premium Cinematic Hero Section — Architectural & Facade Engineering Authority
 * GPU-accelerated, SEO-friendly, fully responsive, and conversion-optimized.
 */
export function HeroSection({ locale, dict: _dict, initialSlides }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeSlide, setActiveSlide] = useState(0);
  const isRtl = locale === "ar";

  const slides = initialSlides && initialSlides.length > 0 ? initialSlides : HERO_SLIDES;

  // Automatic periodic slide change every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const currentSlide = slides[activeSlide % slides.length];

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

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex items-center justify-center pt-[calc(var(--header-height)+0.5rem)] sm:pt-[var(--header-height)] pb-10 sm:pb-16 sm:min-h-dvh overflow-hidden bg-slate-50 dark:bg-[#070d1e] select-none transition-colors duration-300"
      aria-label={isRtl ? "القسم الرئيسي للشركة" : "Main Hero Section"}
    >
      {/* ── 1. Architectural Canvas Backdrop ──────────────────────────── */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ y: backgroundY }}
      >
        <PageHeroBackground pageKey="home" overlayOpacity={0.4} />

        <AnimatedCanvasBanner
          aspectRatio="auto"
          showDetailedGrid={true}
          transparentBackground={true}
          className="w-full h-full opacity-40 dark:opacity-30"
        />

        {/* Ambient Radial Lighting Orbs */}
        <motion.div
          className="absolute top-1/4 start-1/6 w-72 sm:w-[34rem] h-72 sm:h-[34rem] rounded-full opacity-30 dark:opacity-20 filter blur-[50px] sm:blur-[90px]"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(212,175,55,0.12) 60%, transparent 100%)",
            x: mousePos.x * 0.4,
            y: mousePos.y * 0.4,
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 end-1/6 w-64 sm:w-[30rem] h-64 sm:h-[30rem] rounded-full opacity-25 dark:opacity-15 filter blur-[40px] sm:blur-[80px]"
          style={{
            background: "radial-gradient(circle, rgba(212,175,55,0.25) 0%, rgba(245,158,11,0.15) 60%, transparent 100%)",
            x: mousePos.x * -0.4,
            y: mousePos.y * -0.4,
          }}
          animate={{ scale: [1.1, 0.95, 1.1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/80 to-slate-100/40 dark:from-[#070d1e] dark:via-[#070d1e]/40 dark:to-[#070d1e]/70 transition-colors duration-300" />
      </motion.div>

      {/* ── 2. Hero Content Container ─────────────────────────────────── */}
      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-2 sm:pt-10"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Left Column: Typography, CTAs & Architectural Trust Strip */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-6 text-center lg:text-start">
            {/* Royal Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-amber-500/10 dark:bg-[#0b172e] text-amber-700 dark:text-amber-400 shadow-sm backdrop-blur-xl border border-amber-500/30 dark:border-amber-500/40"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-[11px] sm:text-sm font-bold tracking-wide text-amber-700 dark:text-amber-400">
                {isRtl
                  ? "مؤسسة القوة العاشرة للمقاولات العامة والواجهات المعمارية"
                  : "Tenth Power General Contracting & Facades"}
              </span>
            </motion.div>

            {/* Main H1 Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl sm:text-4xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-snug sm:leading-[1.15] tracking-tight"
            >
              {isRtl ? (
                <>
                  <span>حلول هندسية متكاملة</span>{" "}
                  <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-amber-400 dark:via-amber-300 dark:to-yellow-200 bg-clip-text text-transparent">
                    للواجهات المعمارية
                  </span>{" "}
                  <span>والمقاولات العامة</span>
                </>
              ) : (
                <>
                  <span>Integrated Engineering Solutions for</span>{" "}
                  <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-amber-400 dark:via-amber-300 dark:to-yellow-200 bg-clip-text text-transparent">
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
              className="text-xs sm:text-base lg:text-lg text-slate-600 dark:text-slate-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              {isRtl
                ? "تنفيذ وتوريد الزجاج السيكوريت، واجهات الاستركشر والكرتن وول، قطاعات الألمنيوم المعزولة حرارياً، وكبائن الشاور الفاخرة بأعلى معايير كود البناء السعودي SBC."
                : "Fabrication and installation of securit glass, curtain walls, thermal-break aluminum, and luxury architectural partitions according to Saudi Building Code SBC."}
            </motion.p>

            {/* CTAs Action Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-w-lg mx-auto lg:mx-0 pt-1"
            >
              <Link
                href={`/${locale}/quote`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-95 transition-all duration-300"
              >
                <Ruler className="w-4 h-4 text-slate-950 shrink-0" />
                <span>{isRtl ? "طلب معاينة ورفع مساحي مجاني" : "Request Free Site Survey"}</span>
                <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
              </Link>

              <Link
                href={`/${locale}/projects`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300/80 shadow-sm dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/20 backdrop-blur-md hover:scale-[1.02] active:scale-95 transition-all duration-300"
              >
                <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{isRtl ? "استعراض المشاريع المنفذة" : "View Completed Projects"}</span>
              </Link>
            </motion.div>

            {/* Architectural Trust & Authority Badges Matrix */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-1 sm:pt-2 text-start"
            >
              <div className="rounded-xl border border-slate-200/90 dark:border-white/10 bg-white/85 dark:bg-white/[0.04] p-2 sm:p-3 backdrop-blur-md shadow-sm dark:shadow-none transition-colors">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-0.5 sm:mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-bold">{isRtl ? "10 سنوات" : "10 Years"}</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                  {isRtl ? "ضمان شامل معتمد على التركيب والعوازل" : "Warranty on Installation & Seals"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/90 dark:border-white/10 bg-white/85 dark:bg-white/[0.04] p-2 sm:p-3 backdrop-blur-md shadow-sm dark:shadow-none transition-colors">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-0.5 sm:mb-1">
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-bold">{isRtl ? "كود SBC" : "SBC Code"}</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                  {isRtl ? "مطابقة تامة لكود البناء السعودي" : "Saudi Building Code Compliant"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/90 dark:border-white/10 bg-white/85 dark:bg-white/[0.04] p-2 sm:p-3 backdrop-blur-md shadow-sm dark:shadow-none transition-colors">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-0.5 sm:mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-bold">{isRtl ? "+450 مشروع" : "+450 Projects"}</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                  {isRtl ? "منفذة بنجاح بالرياض والمنطقة الوسطى" : "Executed Across Riyadh"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/90 dark:border-white/10 bg-white/85 dark:bg-white/[0.04] p-2 sm:p-3 backdrop-blur-md shadow-sm dark:shadow-none transition-colors">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-0.5 sm:mb-1">
                  <Ruler className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-bold">{isRtl ? "رفع مساحي" : "Surveying"}</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                  {isRtl ? "معاينة هندسية ميدانية فورية مجانية" : "Free On-Site Measurements"}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: 3D Image Showcase Slideshow Carousel & Controls */}
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
              className="relative w-full max-w-md rounded-2xl overflow-hidden border border-slate-200/90 dark:border-white/20 bg-white dark:bg-[#0b172e]/95 backdrop-blur-2xl shadow-xl shadow-slate-300/40 dark:shadow-2xl flex flex-col group transition-colors"
            >
              {/* Image Frame Container */}
              <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-slate-100 dark:bg-[#070d1e]">
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

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Top Badge Overlay */}
                <div className="absolute top-2.5 start-2.5 end-2.5 flex items-center justify-between z-10">
                  <span className="bg-amber-500 text-slate-950 font-bold shadow-sm backdrop-blur-md text-[11px] px-2.5 py-0.5 rounded-full">
                    {isRtl ? currentSlide.badge_ar : currentSlide.badge_en}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                      aria-label="Previous Slide"
                      className="w-7 h-7 rounded-full bg-black/60 hover:bg-amber-500 hover:text-slate-950 text-white transition-colors flex items-center justify-center border border-white/20"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
                      aria-label="Next Slide"
                      className="w-7 h-7 rounded-full bg-black/60 hover:bg-amber-500 hover:text-slate-950 text-white transition-colors flex items-center justify-center border border-white/20"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Title on Image */}
                <div className="absolute bottom-2.5 start-3 end-3 z-10">
                  <p className="text-xs sm:text-sm font-bold text-white drop-shadow-md line-clamp-1">
                    {isRtl ? currentSlide.title_ar : currentSlide.title_en}
                  </p>
                </div>
              </div>

              {/* Bottom Quick Spec Bar */}
              <div className="p-3 bg-slate-50 dark:bg-[#081329] border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs transition-colors">
                <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  {isRtl ? "موقع التنفيذ: الرياض والمملكة" : "Location: Riyadh & KSA"}
                </span>
                <Link
                  href={`/${locale}/projects`}
                  className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
                >
                  <span>{isRtl ? "تفاصيل المشروع" : "Details"}</span>
                  <ArrowRight className={cn("w-3 h-3", isRtl && "rotate-180")} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
