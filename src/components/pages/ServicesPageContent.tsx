"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2, DoorOpen, GalleryHorizontalEnd, Hammer,
  Layers3, PaintBucket, RectangleHorizontal, Wrench,
  ArrowRight, CheckCircle2, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

import { SmartFallbackImage } from "@/components/ui/SmartFallbackImage";
import { PageHeroBackground } from "@/components/ui/PageHeroBackground";

interface Props {
  locale: Locale;
  dict: Dictionary;
  initialServices?: any[];
}

const iconMap: Record<string, LucideIcon> = {
  Layers3, Building2, RectangleHorizontal, PaintBucket, GalleryHorizontalEnd, DoorOpen, Hammer, Wrench
};

export function ServicesPageContent({ locale, dict, initialServices }: Props) {
  const isRtl = locale === "ar";
  const services = (initialServices && initialServices.length > 0) ? initialServices : [];

  return (
    <div className="pt-[var(--header-height)]">
      {/* Cinematic Services Hero */}
      <section className="relative py-20 sm:py-28 bg-[#070d1e] overflow-hidden">
        {/* Background Ambient Orbs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageHeroBackground pageKey="services" />
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[25rem] bg-gradient-to-r from-blue-600/20 via-amber-500/15 to-purple-600/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070d1e]/80 via-transparent to-[#070d1e]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full royal-badge shadow-xl backdrop-blur-xl border border-amber-500/30">
            <Layers3 className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-bold">
              {isRtl ? "خدمات هندسية متكاملة بضمان 10 سنوات" : "Full Engineering Services & 10-Year Warranty"}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
            className="text-4xl sm:text-6xl font-extrabold text-white leading-tight">
            {isRtl ? (
              <>
                خدماتنا المعمارية{" "}
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">
                  المتخصصة والاحترافية
                </span>
              </>
            ) : (
              <>
                Our Specialized{" "}
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">
                  Architectural Services
                </span>
              </>
            )}
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.7 }}
            className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {dict.services.subtitle || (isRtl
              ? "نقدم مجموعة شاملة من الخدمات المتخصصة في توريد وتركيب الزجاج السيكوريت، الواجهات المعمارية، الألمنيوم، والمقاولات بجرأة تصميمة وجودة لا تضاهى."
              : "Comprehensive architectural supply and installation in securit glass, curtain walls, aluminum profiles, and contracting.")}
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = (service.icon && typeof service.icon === "string" && iconMap[service.icon])
                ? iconMap[service.icon]
                : (typeof service.icon === "function" ? service.icon : Layers3);

              const name = service.name || (isRtl ? service.name_ar : service.name_en) || service.name_ar;
              const desc = service.description || service.short_description || (isRtl ? service.short_description_ar : service.short_description_en) || service.short_description_ar;
              const feats: string[] = isRtl
                ? (service.features_ar || service.features || ["جودة عالية", "ضمان شامل", "تنفيذ احترافي"])
                : (service.features_en || service.features || ["High Quality", "Comprehensive Warranty", "Professional Execution"]);

              const serviceSlug = service.slug || "securit-glass";
              const coverImage = service.cover_image_url;

              return (
                <motion.div key={service.id || service.slug || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="rounded-3xl border border-border-light hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300 bg-surface-elevated hover:shadow-xl group flex flex-col justify-between overflow-hidden">
                  
                  {/* Service Image / Canvas Architectural Banner */}
                  <div className="h-44 bg-surface relative overflow-hidden">
                    <SmartFallbackImage 
                      src={coverImage}
                      alt={name}
                      aspectRatio="auto"
                      title={name}
                      badge={isRtl ? "خدمة معتمدة" : "Certified Service"}
                      icon={<Icon className="w-5 h-5" />}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6 sm:p-8 space-y-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-extrabold mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {name}
                        </h3>
                        <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">
                          {desc}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-2">
                        {feats.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border-light flex items-center justify-between">
                      <Link href={`/${locale}/services/${serviceSlug}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:gap-3 transition-all">
                        <span>{isRtl ? "تفاصيل الخدمة والمواصفات" : "Service Specs & Details"}</span>
                        <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
