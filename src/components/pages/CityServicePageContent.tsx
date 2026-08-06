"use client";

import Link from "next/link";
import { MapPin, CheckCircle2, Phone, ArrowRight, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

interface Props {
  locale: Locale;
  city: string;
  service: string;
  cityName: string;
  serviceName: string;
  regionName: string;
}

export function CityServicePageContent({ locale, city, service, cityName, serviceName, regionName }: Props) {
  const isRtl = locale === "ar";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${serviceName} في ${cityName}`,
    provider: {
      "@type": "LocalBusiness",
      name: "WebTaky",
      address: {
        "@type": "PostalAddress",
        addressLocality: cityName,
        addressCountry: "SA",
      },
    },
    areaServed: cityName,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/cities/${city}/${service}`,
  };

  return (
    <div className="pt-[var(--header-height)] min-h-dvh bg-gradient-to-b from-background to-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Hero */}
      <section className="relative py-20 sm:py-28 bg-gradient-to-br from-primary-950 via-[#0c1445] to-primary-900 text-white text-center overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-white/80">
            <MapPin className="w-4 h-4 text-accent-400" />
            {cityName} — {regionName}
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
            {isRtl ? `خدمة ${serviceName} في ${cityName}` : `${serviceName} Services in ${cityName}`}
          </h1>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            {isRtl
              ? `أفضل حلول ومواصفات ${serviceName} في مدينة ${cityName} وجميع أحياء ${regionName} بشهادة وإشراف فنيين متخصصين وضمان شامل.`
              : `Premium ${serviceName} solutions in ${cityName} covering all neighborhoods across ${regionName} with full warranty.`}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href={`/${locale}/quote`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-accent-500 text-white font-bold text-sm hover:bg-accent-600 shadow-lg active:scale-95 transition-all">
              {isRtl ? `طلب عرض سعر في ${cityName}` : `Get Quote in ${cityName}`}
              <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
            </Link>
            <a href="tel:+966500000000"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 transition-all">
              <Phone className="w-4 h-4" />
              +966 50 000 0000
            </a>
          </div>
        </div>
      </section>

      {/* Details */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-extrabold">
              {isRtl ? `لماذا خيارنا في ${serviceName} هو الأفضل في ${cityName}؟` : `Why Choose Our ${serviceName} in ${cityName}?`}
            </h2>
            <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
              {isRtl
                ? `نوفر في ${cityName} أحدث المعدات والخبرات الفنية المتخصصة لتنفيذ ${serviceName} بأعلى دقة، مع الالتزام التام بالمواعيد المحددة وتقديم ضمان حقيقي مكتوب يضمن راحة بالك.`
                : `We bring state-of-the-art equipment and specialized technicians to ${cityName} for executing ${serviceName} with high accuracy and strict deadline adherence.`}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              {[
                { title_ar: "تغطية شاملة لكل أحياء " + cityName, title_en: "Full coverage across " + cityName, desc_ar: "فريق سرعة استجابة ومعاينة موقعية فورية", desc_en: "Fast site inspection team available" },
                { title_ar: "ضمان شامل معتمد", title_en: "Certified Full Warranty", desc_ar: "ضمان حقيقي يصل إلى 10 سنوات على المواد والتركيب", desc_en: "Up to 10 years written warranty" },
                { title_ar: "فنيون محترفون", title_en: "Expert Technicians", desc_ar: "خبرة واسعة في تنفيذ أكبر مشاريع " + cityName, desc_en: "Extensive experience across top projects" },
                { title_ar: "أسعار تنافسية", title_en: "Competitive Rates", desc_ar: "عروض أسعار شفافة بدون أي تكاليف خفية", desc_en: "Transparent pricing without hidden fees" },
              ].map((item, i) => (
                <div key={i} className="p-5 rounded-2xl bg-surface border border-border-light space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm text-primary-700 dark:text-primary-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{isRtl ? item.title_ar : item.title_en}</span>
                  </div>
                  <p className="text-xs text-text-tertiary">{isRtl ? item.desc_ar : item.desc_en}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-elevated rounded-3xl border border-border-light p-6 space-y-6 self-start text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mx-auto text-primary-600 dark:text-primary-400">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-base">{isRtl ? `طلب معاينة موقعية في ${cityName}` : `Site Visit in ${cityName}`}</h3>
              <p className="text-xs text-text-tertiary mt-1">{isRtl ? "معاينة مجانية ورفع مقاسات بدون أي التزام" : "Free site inspection & measurements"}</p>
            </div>
            <Link href={`/${locale}/quote`}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 active:scale-95 transition-all">
              {isRtl ? "احجز موعد المعاينة" : "Book Site Visit"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
