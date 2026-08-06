"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Building2,
  DoorOpen,
  GalleryHorizontalEnd,
  Hammer,
  Layers3,
  PaintBucket,
  RectangleHorizontal,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface ServicesShowcaseProps {
  locale: Locale;
  dict: Dictionary;
}

/**
 * Placeholder services data — in production, fetched from Supabase.
 */
const DEMO_SERVICES = [
  {
    icon: Layers3,
    name_ar: "زجاج سكريت",
    name_en: "Tempered Glass",
    desc_ar: "زجاج مقوى بأعلى معايير السلامة والجودة للمباني والواجهات",
    desc_en: "High-quality tempered glass for buildings and facades",
    color: "from-blue-500 to-cyan-400",
  },
  {
    icon: Building2,
    name_ar: "واجهات زجاجية",
    name_en: "Glass Facades",
    desc_ar: "تصميم وتنفيذ واجهات زجاجية عصرية للمباني التجارية والسكنية",
    desc_en: "Modern glass facade design for commercial and residential buildings",
    color: "from-indigo-500 to-purple-400",
  },
  {
    icon: RectangleHorizontal,
    name_ar: "ألمنيوم",
    name_en: "Aluminum",
    desc_ar: "أعمال الألمنيوم بجميع أنواعه للنوافذ والأبواب والديكورات",
    desc_en: "All types of aluminum work for windows, doors, and decorations",
    color: "from-slate-500 to-gray-400",
  },
  {
    icon: PaintBucket,
    name_ar: "مطابخ",
    name_en: "Kitchens",
    desc_ar: "تصميم وتصنيع مطابخ عصرية بأجود الخامات والتصاميم",
    desc_en: "Modern kitchen design and manufacturing with premium materials",
    color: "from-amber-500 to-orange-400",
  },
  {
    icon: GalleryHorizontalEnd,
    name_ar: "ديكورات",
    name_en: "Decorations",
    desc_ar: "ديكورات داخلية وخارجية بتصاميم عصرية وإبداعية",
    desc_en: "Interior and exterior decorations with creative modern designs",
    color: "from-rose-500 to-pink-400",
  },
  {
    icon: DoorOpen,
    name_ar: "أبواب ونوافذ",
    name_en: "Doors & Windows",
    desc_ar: "تركيب أبواب ونوافذ بأنظمة حديثة وعازلة للصوت والحرارة",
    desc_en: "Modern door and window installation with sound and heat insulation",
    color: "from-emerald-500 to-teal-400",
  },
  {
    icon: Hammer,
    name_ar: "مقاولات",
    name_en: "Contracting",
    desc_ar: "خدمات مقاولات شاملة من التأسيس حتى التشطيب النهائي",
    desc_en: "Comprehensive contracting services from foundation to final finishing",
    color: "from-yellow-500 to-amber-400",
  },
  {
    icon: Wrench,
    name_ar: "صيانة",
    name_en: "Maintenance",
    desc_ar: "خدمات صيانة دورية وطارئة لجميع الأعمال المنفذة",
    desc_en: "Regular and emergency maintenance for all executed works",
    color: "from-violet-500 to-fuchsia-400",
  },
];

export function ServicesShowcase({ locale, dict }: ServicesShowcaseProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const isRtl = locale === "ar";

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative py-20 sm:py-28 lg:py-32 bg-background overflow-hidden"
      aria-labelledby="services-heading"
    >
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(59,130,246,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(245,158,11,0.1) 0%, transparent 50%)",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-primary-600 dark:text-primary-400 mb-3 tracking-wider uppercase">
            {dict.services.title}
          </span>
          <h2
            id="services-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
          >
            {dict.services.title}
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            {dict.services.subtitle}
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEMO_SERVICES.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.article
                key={service.name_en}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                className={cn(
                  "group relative rounded-2xl p-6",
                  "bg-surface-elevated border border-border-light",
                  "hover:border-primary-200 dark:hover:border-primary-800",
                  "hover:shadow-xl dark:hover:shadow-primary-900/20",
                  "transition-all duration-300 ease-out",
                  "cursor-pointer"
                )}
              >
                {/* Icon with gradient background */}
                <div
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center mb-5",
                    "bg-gradient-to-br",
                    service.color,
                    "shadow-lg group-hover:scale-110 transition-transform duration-300"
                  )}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Service Name */}
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {isRtl ? service.name_ar : service.name_en}
                </h3>

                {/* Description */}
                <p className="text-sm text-text-secondary leading-relaxed">
                  {isRtl ? service.desc_ar : service.desc_en}
                </p>

                {/* Hover arrow */}
                <div
                  className={cn(
                    "mt-4 flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  )}
                >
                  <span>{dict.services.viewDetails}</span>
                  <span className={cn(isRtl ? "rotate-180" : "")}>→</span>
                </div>

                {/* Subtle hover glow */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    "bg-gradient-to-br pointer-events-none",
                    service.color
                  )}
                  style={{ opacity: 0, mixBlendMode: "overlay" }}
                />
              </motion.article>
            );
          })}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <button
            className={cn(
              "inline-flex items-center gap-2 px-8 py-3 rounded-xl",
              "border-2 border-primary-500 text-primary-600 dark:text-primary-400",
              "hover:bg-primary-50 dark:hover:bg-primary-950",
              "font-semibold transition-all duration-200",
              "active:scale-[0.98]"
            )}
          >
            {dict.services.viewAll}
            <span className={cn(isRtl ? "rotate-180" : "")}>→</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
