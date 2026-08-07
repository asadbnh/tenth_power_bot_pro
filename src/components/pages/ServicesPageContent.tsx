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

interface Props {
  locale: Locale;
  dict: Dictionary;
  initialServices?: any[];
}

const iconMap: Record<string, LucideIcon> = {
  Layers3, Building2, RectangleHorizontal, PaintBucket, GalleryHorizontalEnd, DoorOpen, Hammer, Wrench
};

const DEFAULT_SERVICES = [
  {
    icon: Layers3,
    slug: "securit-glass",
    name_ar: "زجاج سكريت (مقوى)",
    name_en: "Tempered Glass",
    desc_ar: "زجاج مقوى بأعلى معايير السلامة والجودة للمباني والواجهات التجارية والسكنية. يتحمل أربعة أضعاف قوة الزجاج العادي.",
    desc_en: "High-strength tempered glass for commercial and residential facades. Withstands four times the pressure of standard glass.",
    features_ar: ["مقاوم للصدمات", "آمن عند الكسر", "عازل للحرارة", "متوفر بجميع الأبعاد"],
    features_en: ["Impact resistant", "Safety-compliant", "Heat insulating", "All sizes available"],
    color: "from-blue-500 to-cyan-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: Building2,
    slug: "glass-facades",
    name_ar: "واجهات زجاجية",
    name_en: "Glass Facades",
    desc_ar: "تصميم وتنفيذ واجهات زجاجية عصرية للمباني التجارية والمجمعات السكنية بمواد عالية الجودة.",
    desc_en: "Modern glass facade design and installation for commercial buildings and residential complexes.",
    features_ar: ["تصميم مخصص", "تركيب احترافي", "ضمان 10 سنوات", "عازل للصوت"],
    features_en: ["Custom design", "Professional install", "10-year warranty", "Sound insulating"],
    color: "from-indigo-500 to-purple-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
  },
  {
    icon: RectangleHorizontal,
    slug: "aluminum",
    name_ar: "أعمال الألمنيوم",
    name_en: "Aluminum Works",
    desc_ar: "أعمال الألمنيوم بجميع أنواعه للنوافذ والأبواب والديكورات الداخلية والخارجية.",
    desc_en: "All types of aluminum works for windows, doors, and interior/exterior decorations.",
    features_ar: ["ألمنيوم أمريكي وألماني", "تشطيبات متعددة", "مقاوم للصدأ", "سهل الصيانة"],
    features_en: ["American & German aluminum", "Multiple finishes", "Rust resistant", "Easy maintenance"],
    color: "from-slate-500 to-gray-400",
    bg: "bg-slate-50 dark:bg-slate-900/30",
  },
  {
    icon: PaintBucket,
    slug: "kitchens",
    name_ar: "مطابخ",
    name_en: "Kitchens",
    desc_ar: "تصميم وتصنيع مطابخ عصرية بأجود الخامات، مع تركيب احترافي وضمان شامل.",
    desc_en: "Modern kitchen design and manufacturing with premium materials and professional installation.",
    features_ar: ["تصميم 3D مجاني", "خامات مستوردة", "تركيب في 48 ساعة", "ضمان 5 سنوات"],
    features_en: ["Free 3D design", "Imported materials", "48h installation", "5-year warranty"],
    color: "from-amber-500 to-orange-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    icon: GalleryHorizontalEnd,
    slug: "decorations",
    name_ar: "ديكورات",
    name_en: "Decorations",
    desc_ar: "ديكورات داخلية وخارجية بتصاميم عصرية وإبداعية تلائم جميع الأذواق والميزانيات.",
    desc_en: "Interior and exterior decorations with modern creative designs for all tastes and budgets.",
    features_ar: ["مصمم داخلي متخصص", "تنفيذ دقيق", "خامات فاخرة", "تسليم في الوقت المحدد"],
    features_en: ["Specialist designer", "Precise execution", "Premium materials", "On-time delivery"],
    color: "from-rose-500 to-pink-400",
    bg: "bg-rose-50 dark:bg-rose-950/30",
  },
  {
    icon: DoorOpen,
    slug: "doors-windows",
    name_ar: "أبواب ونوافذ",
    name_en: "Doors & Windows",
    desc_ar: "تركيب أبواب ونوافذ بأنظمة حديثة وعازلة للصوت والحرارة بأعلى معايير الأمان.",
    desc_en: "Modern door and window installation with sound and heat insulation and top safety standards.",
    features_ar: ["عازل للصوت 80%", "عازل للحرارة", "أنظمة قفل أمنية", "أبواب ذكية"],
    features_en: ["80% sound insulation", "Heat insulating", "Security lock systems", "Smart doors"],
    color: "from-emerald-500 to-teal-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    icon: Hammer,
    slug: "contracting",
    name_ar: "مقاولات",
    name_en: "Contracting",
    desc_ar: "خدمات مقاولات شاملة من التأسيس حتى التشطيب النهائي للمشاريع السكنية والتجارية.",
    desc_en: "Comprehensive contracting services from foundation to final finishing for residential and commercial projects.",
    features_ar: ["فريق متخصص", "معدات حديثة", "إشراف هندسي", "مطابق للكود السعودي"],
    features_en: ["Specialist team", "Modern equipment", "Engineering supervision", "Saudi code compliant"],
    color: "from-yellow-500 to-amber-400",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
  },
  {
    icon: Wrench,
    slug: "maintenance",
    name_ar: "صيانة",
    name_en: "Maintenance",
    desc_ar: "خدمات صيانة دورية وطارئة لجميع الأعمال المنفذة مع فريق متاح على مدار الساعة.",
    desc_en: "Regular and emergency maintenance for all executed works with a 24/7 available team.",
    features_ar: ["24/7 طوارئ", "زيارة دورية مجانية", "قطع غيار أصلية", "تقرير مفصل"],
    features_en: ["24/7 emergency", "Free periodic visit", "Original spare parts", "Detailed report"],
    color: "from-violet-500 to-fuchsia-400",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
];

export function ServicesPageContent({ locale, dict, initialServices }: Props) {
  const isRtl = locale === "ar";
  const services = (initialServices && initialServices.length > 0) ? initialServices : DEFAULT_SERVICES;

  return (
    <div className="pt-[var(--header-height)]">
      {/* Page Hero */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-br from-primary-950 via-[#0c1445] to-primary-900 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-sm font-semibold text-primary-300 uppercase tracking-widest mb-3">
            {dict.services.title}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            {isRtl ? "خدماتنا المتكاملة" : "Our Complete Services"}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/60 max-w-2xl mx-auto">
            {dict.services.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, i) => {
              const Icon = (service.icon && typeof service.icon === "string" && iconMap[service.icon])
                ? iconMap[service.icon]
                : (typeof service.icon === "function" ? service.icon : Building2);
              const name = service.name || (isRtl ? service.name_ar : service.name_en) || service.name_ar;
              const desc = service.description || service.short_description || (isRtl ? service.desc_ar : service.desc_en) || service.desc_ar;

              const feats: string[] = service.features_ar || service.features_en || (isRtl ? ["جودة عالية", "ضمان شامل", "تنفيذ احترافي"] : ["High Quality", "Comprehensive Warranty", "Professional Execution"]);

              return (
                <motion.article key={service.slug || i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="group relative rounded-2xl border border-border-light hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-xl transition-all duration-300 overflow-hidden">

                  {/* Header */}
                  <div className={cn("p-6 flex items-start gap-4", service.bg || "bg-surface-elevated")}>
                    <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-md", service.color || "from-blue-500 to-indigo-600")}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {name}
                      </h2>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="p-6 bg-background">
                    <ul className="grid grid-cols-2 gap-2">
                      {feats.map((feat) => (
                        <li key={feat} className="flex items-center gap-2 text-sm text-text-secondary">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <Link href={`/${locale}/quote`}
                      className={cn("mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:gap-3 transition-all")}>
                      {dict.services.requestQuote}
                      <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-surface border-t border-border-light">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">
            {isRtl ? "هل تحتاج خدمة مخصصة؟" : "Need a custom service?"}
          </h3>
          <p className="text-text-secondary mb-8">
            {isRtl ? "تواصل معنا للحصول على استشارة مجانية وعرض سعر مخصص لمشروعك" : "Contact us for a free consultation and custom quote for your project"}
          </p>
          <Link href={`/${locale}/quote`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl active:scale-[0.98]">
            {dict.services.requestQuote}
            <ArrowRight className={cn("w-5 h-5", isRtl && "rotate-180")} />
          </Link>
        </div>
      </section>
    </div>
  );
}
