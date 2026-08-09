"use client";

import Link from "next/link";
import {
  CheckCircle2, ArrowRight, Phone, ShieldCheck, Clock, Award,
  Sparkles, Layers3, Building2, RectangleHorizontal, PaintBucket, ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

import { AnimatedCanvasBanner } from "@/components/ui/AnimatedCanvasBanner";

interface Props {
  slug: string;
  locale: Locale;
  dict: Dictionary;
  initialService?: any;
}

const iconMap: Record<string, React.ElementType> = {
  Layers3,
  Building2,
  RectangleHorizontal,
  PaintBucket,
};

export function ServiceDetailPageContent({ slug, locale, dict, initialService }: Props) {
  const isRtl = locale === "ar";

  const service = initialService || {
    slug,
    name_ar: isRtl ? "خدمة متخصصة" : "Specialized Service",
    name_en: "Specialized Service",
    short_description_ar: "نقدم حلولاً متكاملة بأعلى معايير الجودة والضمان",
    short_description_en: "Providing comprehensive high-quality solutions with warranty",
    full_description_ar: "نحن متخصصون في تقديم هذه الخدمة وفق أعلى المقاييس العالمية باستخدام أفضل الخامات والمعدات الحديثة وشبكة فنيين محترفين.",
    full_description_en: "We specialize in delivering this service according to top global standards using superior materials and skilled technicians.",
    icon: "Layers3",
    features_ar: ["جودة عالية وتنفيذ دقيق", "ضمان شامل على المواد والعمل", "فريق عمل مؤهل ومختص", "أسعار تنافسية وحلول مخصصة"],
    features_en: ["High quality & precise execution", "Comprehensive warranty on work", "Qualified specialist team", "Competitive pricing"],
    specs: [
      { label_ar: "مدة التنفيذ", label_en: "Execution Time", value_ar: "3 - 7 أيام عمل", value_en: "3 - 7 Working Days" },
      { label_ar: "الضمان", label_en: "Warranty", value_ar: "5 إلى 10 سنوات", value_en: "5 to 10 Years" },
    ],
    faqs: [
      { q_ar: "كيف يمكنني طلب عرض سعر للخدمة؟", q_en: "How can I request a service quote?", a_ar: "يمكنك الضغط على زر طلب عرض السعر وتعبئة تفاصيل مشروعك وسنتواصل معك فوراً.", a_en: "Click the Get Quote button, enter your details, and our engineers will contact you instantly." }
    ]
  };

  const name = isRtl ? (service.name_ar || service.name) : (service.name_en || service.name_ar || service.name);
  const shortDesc = isRtl ? (service.short_description_ar || service.short_description) : (service.short_description_en || service.short_description_ar || service.short_description);
  const fullDesc = isRtl ? (service.full_description_ar || service.description) : (service.full_description_en || service.full_description_ar || service.description);
  const features: string[] = isRtl ? (service.features_ar || service.features || []) : (service.features_en || service.features_ar || service.features || []);
  const specs = service.specs || [];
  const faqs = service.faqs || [];
  const coverImage = service.cover_image_url;

  const rawIcon = service.icon;
  const IconComponent = typeof rawIcon === "string" && iconMap[rawIcon] ? iconMap[rawIcon] : (typeof rawIcon === "function" ? rawIcon : Layers3);

  return (
    <div className="pt-[var(--header-height)] min-h-dvh bg-gradient-to-b from-background to-surface">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-br from-primary-950 via-[#0c1445] to-primary-900 overflow-hidden text-white">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-white/60 mb-6">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">{isRtl ? "الرئيسية" : "Home"}</Link>
            <ChevronLeft className={cn("w-3 h-3", !isRtl && "rotate-180")} />
            <Link href={`/${locale}/services`} className="hover:text-white transition-colors">{dict.services.title}</Link>
            <ChevronLeft className={cn("w-3 h-3", !isRtl && "rotate-180")} />
            <span className="text-white font-medium">{name}</span>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-primary-200 backdrop-blur-md">
                <IconComponent className="w-4 h-4" />
                <span>{isRtl ? "خدمة متخصصة وضمان شامل" : "Specialized Service & Full Warranty"}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
                {name}
              </h1>

              <p className="text-base sm:text-lg text-white/70 leading-relaxed">
                {shortDesc}
              </p>
            </div>

            <div className="shrink-0 space-y-3 w-full md:w-auto">
              <Link href={`/${locale}/quote`}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-accent-500 to-amber-500 text-primary-950 font-extrabold text-base shadow-xl hover:shadow-accent-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                <Sparkles className="w-5 h-5" />
                {dict.services.requestQuote}
              </Link>

              <div className="flex items-center justify-center gap-4 text-xs text-white/60">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-accent-400" /> {isRtl ? "ضمان 10 سنوات" : "10-Year Warranty"}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-accent-400" /> {isRtl ? "معاينة مجانية" : "Free Measurement"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Service Showcase Canvas Banner */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-border-light">
          {coverImage ? (
            <img src={coverImage} alt={name} className="w-full h-80 object-cover" />
          ) : (
            <AnimatedCanvasBanner 
              aspectRatio="wide"
              title={name}
              subtitle={shortDesc}
              badge={isRtl ? "مواصفات وإطارات هندسية معتمدة" : "Certified Architectural Specs"}
              icon={<IconComponent className="w-5 h-5" />}
            />
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {/* Main info */}
          <div className="md:col-span-2 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold text-text-primary">{isRtl ? "عن الخدمة والمواصفات" : "About the Service"}</h2>
              <p className="text-text-secondary leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {fullDesc}
              </p>
            </div>

            {/* Key features */}
            {features.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-text-primary">{isRtl ? "مميزات الخدمة:" : "Key Features:"}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-elevated border border-border-light text-sm font-medium text-text-primary">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {faqs.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-border-light">
                <h3 className="text-lg font-bold text-text-primary">{isRtl ? "الأسئلة الشائعة حول الخدمة:" : "Service FAQs:"}</h3>
                <div className="space-y-3">
                  {faqs.map((faq: any, i: number) => (
                    <div key={i} className="p-4 rounded-2xl bg-surface-elevated border border-border-light space-y-2">
                      <h4 className="font-bold text-sm text-text-primary">{isRtl ? (faq.q_ar || faq.question) : (faq.q_en || faq.q_ar || faq.question)}</h4>
                      <p className="text-xs sm:text-sm text-text-secondary">{isRtl ? (faq.a_ar || faq.answer) : (faq.a_en || faq.a_ar || faq.answer)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar specs */}
          <div className="space-y-6">
            <div className="bg-surface-elevated rounded-3xl border border-border-light p-6 space-y-6 self-start shadow-sm">
              <h3 className="text-lg font-bold border-b border-border-light pb-3 text-text-primary flex items-center gap-2">
                <Award className="w-5 h-5 text-accent-500" />
                {isRtl ? "المواصفات الفنية" : "Technical Specs"}
              </h3>

              {specs.length > 0 ? (
                <div className="space-y-4 text-sm">
                  {specs.map((spec: any, i: number) => (
                    <div key={i} className="border-b border-border-light/60 pb-3 last:border-0 last:pb-0">
                      <p className="text-xs text-text-tertiary">{isRtl ? (spec.label_ar || spec.label) : (spec.label_en || spec.label_ar || spec.label)}</p>
                      <p className="font-semibold text-text-primary mt-0.5">{isRtl ? (spec.value_ar || spec.value) : (spec.value_en || spec.value_ar || spec.value)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-xs text-text-tertiary">{isRtl ? "معيار الأمان" : "Safety Standard"}</p>
                    <p className="font-semibold text-text-primary">ANSI Z97.1 / Saudi Standard</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">{isRtl ? "مدة الضمان" : "Warranty Period"}</p>
                    <p className="font-semibold text-text-primary">{isRtl ? "10 سنوات شاملة" : "10 Years Full Warranty"}</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border-light space-y-3">
                <Link href={`/${locale}/quote`}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 active:scale-95 transition-all">
                  {dict.services.requestQuote}
                  <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
                </Link>

                <a href="tel:+966500000000"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface text-text-primary border border-border-light font-semibold text-xs hover:bg-surface-elevated transition-all">
                  <Phone className="w-3.5 h-3.5 text-primary-500" />
                  {isRtl ? "اتصل بمهندس الموقع" : "Call Site Engineer"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
