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

      {/* Architectural Localized Service Hero */}
      <section className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 bg-[#070d1e] text-white text-center overflow-hidden">
        {/* Layered Architectural Atmosphere */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageHeroBackground pageKey="city-service" overlayOpacity={0.78} />
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[18rem] bg-gradient-to-r from-amber-500/15 via-blue-600/10 to-amber-400/10 rounded-full blur-[90px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070d1e]/85 via-[#070d1e]/75 to-[#070d1e]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-5">
          {/* Breadcrumbs Navigation */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">
              {isRtl ? "الرئيسية" : "Home"}
            </Link>
            <span className="text-slate-600">/</span>
            <Link href={`/${locale}/cities/${city}`} className="hover:text-white transition-colors">
              {cityName}
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-amber-400/90 font-medium">{serviceName}</span>
          </div>

          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-[#D4AF37]/30 shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-200/90 tracking-wide">
              {cityName} — {regionName}
            </span>
          </span>

          <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
            {isRtl ? (
              <>
                خدمة {serviceName} في{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F3E7C4] via-[#E5C378] to-[#C99E32]">
                  {cityName}
                </span>
              </>
            ) : (
              <>
                {serviceName} Services in{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F3E7C4] via-[#E5C378] to-[#C99E32]">
                  {cityName}
                </span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isRtl
              ? `أفضل حلول ومواصفات ${serviceName} في مدينة ${cityName} وجميع أحياء ${regionName} بإشراف مهندسين متخصصين وضمان شامل 10 سنوات.`
              : `Certified ${serviceName} engineering solutions in ${cityName} covering all neighborhoods with 10-year warranty.`}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href={`/${locale}/quote`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#E5C378] to-[#C99E32] text-primary-950 font-bold text-sm shadow-md hover:brightness-105 active:scale-95 transition-all">
              {isRtl ? `طلب عرض سعر في ${cityName}` : `Get Quote in ${cityName}`}
              <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
            </Link>
            <a href="tel:+966532438253"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all">
              <Phone className="w-4 h-4 text-amber-400" />
              <span dir="ltr">+966 53 243 8253</span>
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
