"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Star, Phone, ArrowRight, Building2, Layers3, RectangleHorizontal, PaintBucket } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import { PageHeroBackground } from "@/components/ui/PageHeroBackground";

interface CityData { ar: string; en: string; region_ar: string; region_en: string; }
interface Props { locale: Locale; city: string; cityData: CityData; initialServices?: any[]; }

const iconMap: Record<string, React.ElementType> = {
  Layers3,
  Building2,
  RectangleHorizontal,
  PaintBucket,
};

const DEFAULT_CITY_SERVICES = [
  { icon: "Layers3", slug: "tempered-glass", name_ar: "زجاج سكريت مقوى", name_en: "Tempered Glass", color: "from-blue-500 to-cyan-400" },
  { icon: "Building2", slug: "glass-facades", name_ar: "واجهات زجاجية", name_en: "Glass Facades", color: "from-indigo-500 to-purple-400" },
  { icon: "RectangleHorizontal", slug: "aluminum", name_ar: "أعمال الألمنيوم", name_en: "Aluminum Works", color: "from-slate-500 to-gray-400" },
  { icon: "PaintBucket", slug: "kitchens", name_ar: "مطابخ", name_en: "Kitchens", color: "from-amber-500 to-orange-400" },
];

export function CityPageContent({ locale, city, cityData, initialServices }: Props) {
  const isRtl = locale === "ar";
  const cityName = isRtl ? cityData.ar : cityData.en;
  const regionName = isRtl ? cityData.region_ar : cityData.region_en;

  const servicesList = (initialServices && initialServices.length > 0) ? initialServices : DEFAULT_CITY_SERVICES;

  // LocalBusiness structured data for this city
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `WebTaky — ${cityName}`,
    description: isRtl
      ? `خدمات الزجاج والألمنيوم والمقاولات في ${cityName}`
      : `Glass and aluminum services in ${cityName}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: cityName,
      addressRegion: regionName,
      addressCountry: "SA",
    },
    telephone: "+966500000000",
    url: `${process.env.NEXT_PUBLIC_APP_URL || "https://powerof10.netlify.app"}/${locale}/cities/${city}`,
    priceRange: "$$",
    areaServed: cityName,
    "@id": `${process.env.NEXT_PUBLIC_APP_URL || "https://powerof10.netlify.app"}/${locale}/cities/${city}#localbusiness`,
  };

  return (
    <div className="pt-[var(--header-height)]">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Cinematic City Coverage Hero */}
      <section className="relative py-20 sm:py-28 bg-[#070d1e] overflow-hidden">
        {/* Regional Ambient Spotlight */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageHeroBackground pageKey="cities" />
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[25rem] bg-gradient-to-r from-blue-600/20 via-amber-500/15 to-purple-600/20 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070d1e]/80 via-transparent to-[#070d1e]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full royal-badge shadow-xl backdrop-blur-xl border border-amber-500/30">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-bold text-white">
              {isRtl ? `تغطية شاملة ومباشرة — ${cityName} (${regionName})` : `Full Local Coverage — ${cityName} (${regionName})`}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
            className="text-4xl sm:text-6xl font-extrabold text-white leading-tight">
            {isRtl ? (
              <>
                خدمات الزجاج والألمنيوم والواجهات في{" "}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                  {cityName}
                </span>
              </>
            ) : (
              <>
                Premier Glass & Facade Solutions in{" "}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                  {cityName}
                </span>
              </>
            )}
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.7 }}
            className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {isRtl
              ? `نوفر أفضل خدمات تصنيع وتوريد وتركيب الزجاج السيكوريت، الواجهات المعمارية، الألمنيوم، والمقاولات في ${cityName} مع معاينة هندسية مجانية وضمان 10 سنوات.`
              : `Certified installation of securit glass, curtain walls, and aluminum systems in ${cityName} with free engineering survey and 10-year warranty.`}
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href={`/${locale}/quote`}
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-accent-500 hover:bg-accent-400 text-primary-950 font-bold text-sm shadow-lg hover:shadow-accent-500/20 transition-all">
              {isRtl ? "اطلب عرض سعر مجاني" : "Request Free Quote"}
              <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
            </Link>
            <a href="tel:+966500000000"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-colors">
              <Phone className="w-4 h-4" />
              +966 50 000 0000
            </a>
          </motion.div>
        </div>
      </section>

      {/* Why us in this city */}
      <section className="py-14 bg-surface border-b border-border-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {[
              { v: "500+", l_ar: "مشروع منجز", l_en: "Projects Done" },
              { v: "24h", l_ar: "استجابة سريعة", l_en: "Fast Response" },
              { v: "10+", l_ar: "سنوات خبرة", l_en: "Years Experience" },
              { v: "✓", l_ar: "ضمان شامل", l_en: "Full Warranty" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="text-center p-5 rounded-2xl bg-background border border-border-light">
                <p className="text-2xl sm:text-3xl font-extrabold text-primary-600 dark:text-primary-400 mb-1">{s.v}</p>
                <p className="text-sm text-text-secondary">{isRtl ? s.l_ar : s.l_en}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services in this city */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
            {isRtl ? `خدماتنا في ${cityName}` : `Our Services in ${cityName}`}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {servicesList.map((s: any, i: number) => {
              const rawIcon = s.icon;
              const Icon = typeof rawIcon === "string" && iconMap[rawIcon] ? iconMap[rawIcon] : (typeof rawIcon === "function" ? rawIcon : Layers3);
              const serviceName = isRtl ? (s.name_ar || s.name) : (s.name_en || s.name_ar || s.name);
              const colorClass = s.color || "from-blue-500 to-cyan-400";
              return (
                <motion.div key={s.slug || i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Link href={`/${locale}/cities/${city}/${s.slug}`}
                    className="group block rounded-2xl border border-border-light hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-lg transition-all duration-300 p-6 text-center bg-surface-elevated">
                    <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform", colorClass)}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {serviceName}
                    </h3>
                    <p className="text-xs text-text-tertiary mt-1">
                      {isRtl ? `في ${cityName}` : `in ${cityName}`}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reviews Snapshot */}
      <section className="py-14 bg-surface border-t border-border-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-3">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />)}
          </div>
          <p className="text-xl font-bold mb-2">
            {isRtl ? `نخدم عملاءنا في ${cityName} بكل فخر` : `Proudly serving clients in ${cityName}`}
          </p>
          <p className="text-text-secondary text-sm mb-6">
            {isRtl
              ? `انضم لمئات العملاء الراضين عن خدماتنا في ${cityName} و${regionName}`
              : `Join hundreds of satisfied clients across ${cityName} and ${regionName}`}
          </p>
          <Link href={`/${locale}/quote`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition-all">
            {isRtl ? "اطلب مشروعك الآن" : "Request Your Project"}
            <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
          </Link>
        </div>
      </section>
    </div>
  );
}
