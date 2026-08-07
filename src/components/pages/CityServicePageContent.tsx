"use client";

import Link from "next/link";
import { MapPin, CheckCircle2, Phone, ArrowRight, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import { PageHeroBackground } from "@/components/ui/PageHeroBackground";

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

      {/* Cinematic Localized Service Hero */}
      <section className="relative py-20 sm:py-28 bg-[#070e1c] text-white text-center overflow-hidden">
        {/* Ambient Spotlight */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageHeroBackground pageKey="city-service" />
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[22rem] bg-gradient-to-r from-amber-500/20 via-blue-600/15 to-yellow-400/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070e1c]/80 via-transparent to-[#070e1c]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full royal-badge shadow-xl backdrop-blur-xl border border-amber-500/30">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-bold">
              {cityName} — {regionName}
            </span>
          </span>

          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight">
            {isRtl ? (
              <>
                خدمة {serviceName} في{" "}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                  {cityName}
                </span>
              </>
            ) : (
              <>
                {serviceName} Services in{" "}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                  {cityName}
                </span>
              </>
            )}
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isRtl
              ? `أفضل حلول ومواصفات ${serviceName} في مدينة ${cityName} وجميع أحياء ${regionName} بإشراف مهندسين متخصصين وضمان شامل 10 سنوات.`
              : `Certified ${serviceName} engineering solutions in ${cityName} covering all neighborhoods with 10-year warranty.`}
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
