"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  locale: Locale;
  dict: Dictionary;
}

/**
 * Cinematic full-screen hero section.
 * Features: animated gradient background, floating particles,
 * glassmorphism overlay, parallax depth, premium typography, CTAs.
 */
export function HeroSection({ locale, dict }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const isRtl = locale === "ar";

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  // Mouse parallax (desktop only)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-dvh flex items-center justify-center overflow-hidden"
      aria-label={isRtl ? "القسم الرئيسي" : "Hero Section"}
    >
      {/* ── Animated Background ─────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: backgroundY }}
      >
        {/* Deep animated gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-[#0c1445] to-[#0a0f2e] animate-gradient" />

        {/* Floating orbs for depth */}
        <motion.div
          className="absolute top-1/4 start-1/4 w-[30rem] h-[30rem] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",
            x: mousePos.x * 0.5,
            y: mousePos.y * 0.5,
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 end-1/4 w-[25rem] h-[25rem] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, rgba(245,158,11,0.3) 0%, transparent 70%)",
            x: mousePos.x * -0.3,
            y: mousePos.y * -0.3,
          }}
          animate={{
            scale: [1.1, 0.9, 1.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-2/3 start-1/2 w-[20rem] h-[20rem] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)",
            x: mousePos.x * 0.2,
            y: mousePos.y * 0.2,
          }}
          animate={{
            scale: [0.9, 1.15, 0.9],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Grid pattern overlay for texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-[#0a0f1e]/50" />
      </motion.div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
        >
          <Sparkles className="w-4 h-4 text-accent-400" />
          <span className="text-sm font-medium text-white/80">
            {isRtl ? "حلول احترافية متكاملة" : "Complete Professional Solutions"}
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={cn(
            "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6",
            "tracking-tight"
          )}
        >
          {dict.hero.title.split(" ").map((word, i, arr) => (
            <span key={i}>
              {i >= arr.length - 2 ? (
                <span className="bg-gradient-to-r from-accent-400 via-accent-300 to-primary-300 bg-clip-text text-transparent">
                  {word}
                </span>
              ) : (
                word
              )}
              {i < arr.length - 1 ? " " : ""}
            </span>
          ))}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg sm:text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          {dict.hero.subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            variant="accent"
            size="xl"
            className="min-w-[200px] text-base"
            leftIcon={<Sparkles className="w-5 h-5" />}
          >
            {dict.hero.cta}
          </Button>
          <Button
            variant="outline"
            size="xl"
            className="min-w-[200px] text-base border-white/30 text-white hover:bg-white/10 dark:hover:bg-white/10"
            leftIcon={<MessageCircle className="w-5 h-5" />}
          >
            {dict.hero.ctaSecondary}
          </Button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/40"
        >
          {[
            { value: "500+", label: isRtl ? "مشروع منجز" : "Projects" },
            { value: "15+", label: isRtl ? "سنة خبرة" : "Years" },
            { value: "98%", label: isRtl ? "رضا العملاء" : "Satisfaction" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white/80">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Scroll Indicator ─────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-white/40"
        >
          <span className="text-xs font-medium">
            {isRtl ? "اسحب للأسفل" : "Scroll Down"}
          </span>
          <ArrowDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
