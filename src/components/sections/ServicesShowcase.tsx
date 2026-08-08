"use client";

import { motion } from "framer-motion";
import {
  Building2,
  DoorOpen,
  GalleryHorizontalEnd,
  Hammer,
  Layers3,
  PaintBucket,
  RectangleHorizontal,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export interface ServiceItem {
  id?: string;
  slug?: string;
  icon?: string;
  name_ar: string;
  name_en?: string;
  desc_ar?: string;
  desc_en?: string;
  short_description_ar?: string;
  short_description_en?: string;
  color?: string;
}

interface ServicesShowcaseProps {
  locale: Locale;
  dict: Dictionary;
  initialServices?: ServiceItem[];
}

const DEMO_SERVICES: ServiceItem[] = [
  {
    slug: "securit-glass",
    icon: "Layers3",
    name_ar: "زجاج سكريت",
    name_en: "Tempered Glass",
    desc_ar: "زجاج مقوى بأعلى معايير السلامة والجودة للمباني والواجهات",
    desc_en: "High-quality tempered glass for buildings and facades",
    color: "from-blue-500 to-cyan-400",
  },
  {
    slug: "glass-facades",
    icon: "Building2",
    name_ar: "واجهات زجاجية",
    name_en: "Glass Facades",
    desc_ar: "تصميم وتنفيذ واجهات زجاجية عصرية للمباني التجارية والسكنية",
    desc_en: "Modern glass facade design for commercial and residential buildings",
    color: "from-indigo-500 to-purple-400",
  },
  {
    slug: "aluminum",
    icon: "RectangleHorizontal",
    name_ar: "ألمنيوم",
    name_en: "Aluminum",
    desc_ar: "أعمال الألمنيوم بجميع أنواعه للنوافذ والأبواب والديكورات",
    desc_en: "All types of aluminum work for windows, doors, and decorations",
    color: "from-slate-500 to-gray-400",
  },
  {
    slug: "kitchens",
    icon: "PaintBucket",
    name_ar: "مطابخ",
    name_en: "Kitchens",
    desc_ar: "تصميم وتصنيع مطابخ عصرية بأجود الخامات والتصاميم",
    desc_en: "Modern kitchen design and manufacturing with premium materials",
    color: "from-amber-500 to-orange-400",
  },
  {
    slug: "decorations",
    icon: "GalleryHorizontalEnd",
    name_ar: "ديكورات",
    name_en: "Decorations",
    desc_ar: "ديكورات داخلية وخارجية بتصاميم عصرية وإبداعية",
    desc_en: "Interior and exterior decorations with creative modern designs",
    color: "from-rose-500 to-pink-400",
  },
  {
    slug: "doors-windows",
    icon: "DoorOpen",
    name_ar: "أبواب ونوافذ",
    name_en: "Doors & Windows",
    desc_ar: "تركيب أبواب ونوافذ بأنظمة حديثة وعازلة للصوت والحرارة",
    desc_en: "Modern door and window installation with sound and heat insulation",
    color: "from-emerald-500 to-teal-400",
  },
  {
    slug: "contracting",
    icon: "Hammer",
    name_ar: "مقاولات",
    name_en: "Contracting",
    desc_ar: "خدمات مقاولات شاملة من التأسيس حتى التشطيب النهائي",
    desc_en: "Comprehensive contracting services from foundation to final finishing",
    color: "from-yellow-500 to-amber-400",
  },
  {
    slug: "maintenance",
    icon: "Wrench",
    name_ar: "صيانة",
    name_en: "Maintenance",
    desc_ar: "خدمات صيانة دورية وطارئة لجميع الأعمال المنفذة",
    desc_en: "Regular and emergency maintenance for all executed works",
    color: "from-violet-500 to-fuchsia-400",
  },
];

const iconMap: Record<string, LucideIcon> = {
  Layers3, Building2, RectangleHorizontal, PaintBucket, GalleryHorizontalEnd, DoorOpen, Hammer, Wrench
};

export function ServicesShowcase({ locale, dict, initialServices }: ServicesShowcaseProps) {
  const isRtl = locale === "ar";
  const services = (initialServices && initialServices.length > 0) ? initialServices : DEMO_SERVICES;

  return (
    <section
      id="services"
      className="relative py-6 sm:py-16 lg:py-20 bg-background overflow-hidden"
      aria-labelledby="services-heading"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-5 sm:mb-12"
        >
          <span className="inline-block text-xs sm:text-sm font-semibold text-primary-600 dark:text-primary-400 mb-1 tracking-wider uppercase">
            {dict.services.title}
          </span>
          <h2
            id="services-heading"
            className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-2"
          >
            {dict.services.title}
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary max-w-2xl mx-auto">
            {dict.services.subtitle}
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
          {services.map((service, index) => {
            const Icon = (service.icon && iconMap[service.icon]) ? iconMap[service.icon] : Building2;
            const name = isRtl ? service.name_ar : (service.name_en || service.name_ar);
            const desc = isRtl
              ? (service.desc_ar || service.short_description_ar || "")
              : (service.desc_en || service.short_description_en || service.desc_ar || "");

            return (
              <motion.article
                key={service.slug || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className={cn(
                  "group relative rounded-xl p-3 sm:p-5",
                  "bg-surface-elevated border border-border-light",
                  "hover:border-primary-200 dark:hover:border-primary-800",
                  "hover:shadow-md dark:hover:shadow-primary-900/20",
                  "transition-all duration-300 ease-out"
                )}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className={cn(
                      "w-8 h-8 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center shrink-0",
                      "bg-gradient-to-br",
                      service.color || "from-blue-500 to-indigo-600",
                      "shadow-sm group-hover:scale-105 transition-transform duration-300"
                    )}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-xs sm:text-base font-bold text-text-primary group-hover:text-primary-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                    {name}
                  </h3>
                </div>

                <p className="text-[11px] sm:text-xs text-text-secondary leading-relaxed line-clamp-2">
                  {desc}
                </p>

                <Link
                  href={`/${locale}/services/${service.slug || ""}`}
                  className={cn(
                    "mt-2 flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-amber-400",
                    "opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  )}
                >
                  <span>{dict.services.viewDetails}</span>
                  <span className={cn(isRtl ? "rotate-180" : "")}>→</span>
                </Link>
              </motion.article>
            );
          })}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link
            href={`/${locale}/services`}
            className={cn(
              "inline-flex items-center gap-2 px-8 py-3 rounded-xl",
              "border-2 border-primary-500 text-primary-600 dark:text-primary-400",
              "hover:bg-primary-50 dark:hover:bg-primary-950",
              "font-semibold transition-all duration-200"
            )}
          >
            {dict.services.viewAll}
            <span className={cn(isRtl ? "rotate-180" : "")}>→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
