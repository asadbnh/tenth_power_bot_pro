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
  Clock,
  Headphones,
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
  cover_image_url?: string;
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
    name_ar: "زجاج سكريت مقوى",
    name_en: "Tempered Glass",
    desc_ar: "تركيب زجاج سكريت مقوى عالي المقاومة للصدمات بسماكات من 6مم إلى 12مم للأبواب والواجهات والكابينات.",
    desc_en: "High-impact tempered glass installation (6mm-12mm) for doors, showers, and office partitions.",
    color: "from-blue-500 to-cyan-400",
    cover_image_url: "/images/defaults/services/luxury-partitions.png",
  },
  {
    slug: "glass-facades",
    icon: "Building2",
    name_ar: "واجهات زجاجية (كرتن وول & سبايدر)",
    name_en: "Glass Facades & Curtain Walls",
    desc_ar: "تصميم وتنفيذ واجهات المباني الزجاجية الهيكلية وأنظمة الكرتن وول والسبايدر بأعلى معدلات عزل ومتانة.",
    desc_en: "Structural glass facades, curtain walls, and spider fittings for commercial buildings.",
    color: "from-indigo-500 to-purple-400",
    cover_image_url: "/images/defaults/services/luxury-facade.png",
  },
  {
    slug: "aluminum",
    icon: "RectangleHorizontal",
    name_ar: "أعمال الألمنيوم والنوافذ المعزولة",
    name_en: "Aluminum Works & Insulated Windows",
    desc_ar: "تصنيع وتركيب قطاعات الألمنيوم المعزولة حرارياً للنوافذ والأبواب والواجهات بأحدث التقنيات العالمية.",
    desc_en: "Fabrication and installation of thermal-break aluminum windows, doors, and storefronts.",
    color: "from-slate-500 to-gray-400",
    cover_image_url: "/images/defaults/services/luxury-sliding-doors.png",
  },
  {
    slug: "kitchens",
    icon: "PaintBucket",
    name_ar: "المطابخ والديكورات الحديثة",
    name_en: "Modern Kitchens & Interior Decor",
    desc_ar: "تصميم وتنفيذ المطابخ الأكريليك والألمنيوم الفاخرة مع أرواح هيدروليكية وإضاءات مخفية تناسب ذوقك.",
    desc_en: "Design and installation of modern acrylic & aluminum kitchens with soft-close drawers.",
    color: "from-amber-500 to-orange-400",
    cover_image_url: "/images/defaults/services/luxury-kitchen.png",
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
      className="relative py-16 sm:py-24 bg-slate-50 dark:bg-[#070d19] text-slate-900 dark:text-white overflow-hidden border-y border-slate-200 dark:border-white/5"
      aria-labelledby="services-heading"
    >
      {/* Background Subtle Gradient Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 start-1/4 w-[30rem] h-[30rem] bg-amber-500/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-1/4 end-1/4 w-[30rem] h-[30rem] bg-blue-500/5 rounded-full filter blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="inline-block text-xs sm:text-sm font-bold text-amber-500 mb-2 tracking-widest uppercase">
            — {isRtl ? "خدماتنا" : "OUR SERVICES"} —
          </span>
          <h2
            id="services-heading"
            className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight"
          >
            {isRtl ? "حلول زجاجية وألمنيوم متكاملة" : "Integrated Glass & Aluminum Solutions"}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            {isRtl
              ? "نقدم مجموعة متكاملة من الخدمات بأعلى معايير الجودة والدقة، لتطبيقات الزجاج والألمنيوم بأسلوب عصري واحترافي."
              : "We offer a comprehensive suite of services with the highest standards of quality and precision, for glass and aluminum applications in a modern and professional style."}
          </p>

          {/* Gold Diamond Divider */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-500/80" />
            <div className="w-2 h-2 bg-amber-500 rotate-45 shrink-0" />
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-500/80" />
          </div>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.slice(0, 4).map((service, index) => {
            const Icon = (service.icon && iconMap[service.icon]) ? iconMap[service.icon] : Building2;
            const name = isRtl ? service.name_ar : (service.name_en || service.name_ar);
            const desc = isRtl
              ? (service.desc_ar || service.short_description_ar || "")
              : (service.desc_en || service.short_description_en || service.desc_ar || "");
            const coverImage = service.cover_image_url || "/images/defaults/services/glass-facades.jpg";

            return (
              <motion.article
                key={service.slug || index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={cn(
                  "group relative rounded-2xl overflow-hidden flex flex-col justify-between h-full bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/5 shadow-md dark:shadow-xl transition-all duration-300 hover:border-amber-500/50 dark:hover:border-amber-500/40 hover:-translate-y-1.5 hover:shadow-lg dark:hover:shadow-amber-500/5"
                )}
              >
                {/* Image Section */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#050b18]">
                  <img
                    src={coverImage}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0d1527] via-transparent to-transparent" />
                  
                  {/* Overlapping Floating Icon */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4 z-10">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#0d1527] border border-amber-500/80 flex items-center justify-center shadow-md dark:shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:border-amber-500">
                      <Icon className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="pt-8 px-5 pb-6 flex-1 flex flex-col justify-between items-center text-center">
                  <div className="w-full flex flex-col items-center">
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug max-w-[95%]">
                      {name}
                    </h3>
                    <div className="w-8 h-[1.5px] bg-amber-500/80 my-3" />
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[98%]">
                      {desc}
                    </p>
                  </div>

                  {/* Explore Button */}
                  <div className="mt-5 w-full flex justify-center">
                    <Link
                      href={`/${locale}/services/${service.slug || ""}`}
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg border border-amber-500/30 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-white hover:border-amber-500 dark:hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-500/5 dark:hover:bg-amber-500/10 transition-all duration-300"
                    >
                      {isRtl ? (
                        <>
                          <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
                          <span>استكشف الخدمة</span>
                        </>
                      ) : (
                        <>
                          <span>Explore Service</span>
                          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                        </>
                      )}
                    </Link>
                  </div>
                </div>
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
            className="inline-flex items-center gap-2.5 px-8 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 font-bold text-sm sm:text-base text-slate-700 dark:text-white transition-all duration-300 hover:bg-amber-500/15 dark:hover:bg-[#f59e0b]/20 hover:border-amber-500 dark:hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-200"
          >
            <span>{dict.services.viewAll}</span>
            <span className={cn("transition-transform duration-300", isRtl ? "rotate-180" : "")}>→</span>
          </Link>
        </motion.div>

        {/* Bottom Features Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#091020]/90 border border-slate-200/80 dark:border-white/5 shadow-md dark:shadow-xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                title_ar: "جودة عالية",
                title_en: "High Quality",
                desc_ar: "أعلى معايير الجودة في التنفيذ",
                desc_en: "Highest quality execution standards",
              },
              {
                icon: Award,
                title_ar: "ضمان ممتد",
                title_en: "Extended Warranty",
                desc_ar: "ضمان على جميع الأعمال والخدمات",
                desc_en: "Full warranty on all projects",
              },
              {
                icon: Clock,
                title_ar: "الالتزام بالمواعيد",
                title_en: "On-Time Delivery",
                desc_ar: "نسلم في الوقت المحدد وباحترافية",
                desc_en: "Professional timely completion",
              },
              {
                icon: Headphones,
                title_ar: "دعم مستمر",
                title_en: "Continuous Support",
                desc_ar: "فريق دعم جاهز لخدمتك دائماً",
                desc_en: "Support team ready to assist you",
              },
            ].map((feat, i) => {
              const FeatIcon = feat.icon;
              return (
                <div key={i} className="flex items-center gap-3.5 px-2">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <FeatIcon className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                      {isRtl ? feat.title_ar : feat.title_en}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                      {isRtl ? feat.desc_ar : feat.desc_en}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
