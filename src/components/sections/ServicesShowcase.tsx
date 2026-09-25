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
  ShieldCheck,
  Award,

  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

import fallbackServices from "../../../public/fallback-data/services.json";

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
  cover_image_url?: string;
}

interface ServicesShowcaseProps {
  locale: Locale;
  dict: Dictionary;
  initialServices?: ServiceItem[];
}

const iconMap: Record<string, LucideIcon> = {
  Layers3, Building2, RectangleHorizontal, PaintBucket, GalleryHorizontalEnd, DoorOpen, Hammer, Wrench, ShieldCheck
};

export function ServicesShowcase({ locale, dict, initialServices }: ServicesShowcaseProps) {
  const isRtl = locale === "ar";
  const services = (initialServices && initialServices.length > 0) ? initialServices : (fallbackServices as ServiceItem[]);

  return (
    <section
      id="services"
      className="relative py-16 sm:py-24 bg-slate-50 dark:bg-[#070d19] text-slate-900 dark:text-white overflow-hidden border-y border-slate-200/80 dark:border-white/5 transition-colors duration-300"
      aria-labelledby="services-heading"
    >
      {/* Background Subtle Gradient Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 start-1/4 w-[34rem] h-[34rem] bg-amber-500/5 rounded-full filter blur-[130px]" />
        <div className="absolute bottom-1/4 end-1/4 w-[34rem] h-[34rem] bg-blue-500/5 rounded-full filter blur-[130px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-transparent to-slate-50 dark:from-[#070d19]/80 dark:via-transparent dark:to-[#070d19] transition-colors duration-300" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-white/5 border border-amber-500/30 text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-widest mb-3 shadow-xs">
            <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{isRtl ? "خدمات معمارية متخصصة بالرياض" : "SPECIALIZED ARCHITECTURAL SERVICES"}</span>
          </div>
          <h2
            id="services-heading"
            className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight tracking-tight"
          >
            {isRtl ? "حلول الزجاج المعماري والواجهات والألمنيوم" : "Architectural Glass, Facades & Aluminum Solutions"}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {isRtl
              ? "ننفذ كافة أعمال الواجهات الزجاجية الهيكلية، أنظمة السبايدر، قواطع المكاتب، وأعمال الألمنيوم المعزول بأعلى معايير كود البناء السعودي SBC وضمان شامل 10 سنوات."
              : "We execute structural facades, spider glazing, acoustic office partitions, and thermal-break aluminum according to Saudi Building Code SBC."}
          </p>

          {/* Gold Diamond Divider */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-500/80" />
            <div className="w-2 h-2 bg-amber-500 rotate-45 shrink-0" />
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-500/80" />
          </div>
        </motion.div>

        {/* Services Grid (6 Cards, 3 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.slice(0, 6).map((service, index) => {
            const Icon = (service.icon && iconMap[service.icon]) ? iconMap[service.icon] : Building2;
            const name = isRtl ? service.name_ar : (service.name_en || service.name_ar);
            const desc = isRtl
              ? (service.desc_ar || service.short_description_ar || "")
              : (service.desc_en || service.short_description_en || service.desc_ar || "");
            const coverImage = service.cover_image_url || "/images/defaults/services/glass-facades.webp";

            return (
              <motion.article
                key={service.slug || index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.07 }}
                className={cn(
                  "group relative rounded-2xl overflow-hidden flex flex-col justify-between h-full bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-white/10 shadow-lg dark:shadow-xl transition-all duration-300 hover:border-amber-500/60 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-amber-500/10"
                )}
              >
                {/* Image Section */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 dark:bg-[#050b18]">
                  <img
                    src={coverImage}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-[#0d1527] dark:via-[#0d1527]/40 dark:to-transparent transition-colors duration-300" />

                  {/* Overlapping Floating Icon */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 z-10">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#0d1527] border border-amber-500/80 flex items-center justify-center shadow-md dark:shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:border-amber-400">
                      <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="pt-8 px-5 pb-6 flex-1 flex flex-col justify-between items-center text-center">
                  <div className="w-full flex flex-col items-center">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                      {name}
                    </h3>
                    <div className="w-8 h-[1.5px] bg-amber-500/80 my-3" />
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {desc}
                    </p>
                  </div>

                  {/* Explore & Quote Action Row */}
                  <div className="mt-5 w-full flex items-center justify-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    <Link
                      href={`/${locale}/services/${service.slug || ""}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-amber-500/30 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-500/10 transition-all"
                    >
                      <span>{isRtl ? "تفاصيل الخدمة" : "Specifications"}</span>
                      <span className={cn("transition-transform duration-300", isRtl ? "group-hover:-translate-x-1" : "group-hover:translate-x-1")}>
                        {isRtl ? "←" : "→"}
                      </span>
                    </Link>

                    <Link
                      href={`/${locale}/quote`}
                      className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-amber-500/15 dark:bg-amber-500/20 hover:bg-amber-500 text-amber-800 dark:text-amber-300 hover:text-slate-950 text-[11px] font-bold border border-amber-500/40 transition-colors"
                    >
                      <span>{isRtl ? "طلب تسعير" : "Quote"}</span>
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* View All Services Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            href={`/${locale}/services`}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl border border-amber-500/40 bg-white dark:bg-white/5 font-bold text-sm sm:text-base text-slate-900 dark:text-white transition-all duration-300 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 shadow-md hover:shadow-lg hover:shadow-amber-500/20"
          >
            <span>{dict.services.viewAll}</span>
            <span className={cn("transition-transform duration-300", isRtl ? "rotate-180" : "")}>→</span>
          </Link>
        </motion.div>

       

      </div>
    </section>
  );
}
