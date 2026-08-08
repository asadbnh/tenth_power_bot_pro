"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Building, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface AnimatedStatsProps {
  locale: Locale;
  dict: Dictionary;
}

interface StatItem {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label_ar: string;
  label_en: string;
  color: string;
}

const STATS: StatItem[] = [
  {
    icon: Building,
    value: 500,
    suffix: "+",
    label_ar: "مشروع هندسي منفذ",
    label_en: "Executed Engineering Projects",
    color: "text-blue-400",
  },
  {
    icon: Users,
    value: 1200,
    suffix: "+",
    label_ar: "جهة وشريك نجاح",
    label_en: "Corporate Partners",
    color: "text-emerald-400",
  },
  {
    icon: Clock,
    value: 15,
    suffix: "+",
    label_ar: "سنوات الخبرة الهندسية",
    label_en: "Years Engineering Experience",
    color: "text-amber-400",
  },
  {
    icon: Award,
    value: 25,
    suffix: "+",
    label_ar: "اعتماد وجودة قياسية",
    label_en: "Quality Certifications",
    color: "text-purple-400",
  },
];

/**
 * Animated counter that counts up when element enters viewport.
 */
function AnimatedCounter({
  target,
  suffix,
  isVisible,
}: {
  target: number;
  suffix: string;
  isVisible: boolean;
}) {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isVisible || !mounted) return;

    const duration = 2000; // ms
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [isVisible, mounted, target]);

  // Render 0 on server to avoid hydration mismatch
  return (
    <span suppressHydrationWarning>
      {mounted ? count.toLocaleString("en-US") : 0}
      {suffix}
    </span>
  );
}

export function AnimatedStats({ locale, dict }: AnimatedStatsProps) {
  const isRtl = locale === "ar";
  // Suppress unused variable warning — dict is kept for API consistency
  void dict;

  return (
    <section
      id="stats"
      className="relative py-10 sm:py-20 overflow-hidden"
      aria-label={isRtl ? "إحصائيات" : "Statistics"}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-[#0c1445] to-primary-900" />
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 lg:gap-12">
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label_en}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="text-center"
              >
                <div
                  className={cn(
                    "inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl mb-3",
                    "bg-white/10 backdrop-blur-sm",
                    stat.color
                  )}
                >
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-1">
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    isVisible={true}
                  />
                </div>
                <div className="text-xs sm:text-sm text-white/70 font-medium">
                  {isRtl ? stat.label_ar : stat.label_en}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
