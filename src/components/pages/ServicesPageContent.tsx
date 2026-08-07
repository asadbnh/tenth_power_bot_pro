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

import { AnimatedCanvasBanner } from "@/components/ui/AnimatedCanvasBanner";

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
      {/* Page Hero */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-br from-primary-950 via-[#0c1445] to-primary-900 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold text-primary-300 uppercase tracking-widest mb-3">{dict.services.title}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            {isRtl ? "خدماتنا المتخصصة" : "Our Specialized Services"}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-lg text-white/60 max-w-2xl mx-auto">{dict.services.subtitle}</motion.p>
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
                    {coverImage ? (
                      <img src={coverImage} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <AnimatedCanvasBanner 
                        aspectRatio="auto"
                        title={name}
                        badge={isRtl ? "خدمة معتمدة" : "Certified Service"}
                        icon={<Icon className="w-5 h-5" />}
                      />
                    )}
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
