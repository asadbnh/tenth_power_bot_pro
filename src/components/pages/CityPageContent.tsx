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
    name: `tenth-power-glass — ${cityName}`,
    description: isRtl
      ? `خدمات الزجاج والألمنيوم والمقاولات في ${cityName}`
      : `Glass and aluminum services in ${cityName}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: cityName,
      addressRegion: regionName,
      addressCountry: "SA",
    },
    telephone: "+966532438253",
    url: `${process.env.NEXT_PUBLIC_APP_URL || "https://powerof10.netlify.app"}/${locale}/cities/${city}`,
    priceRange: "$$",
    areaServed: cityName,
    "@id": `${process.env.NEXT_PUBLIC_APP_URL || "https://powerof10.netlify.app"}/${locale}/cities/${city}#localbusiness`,
  };

  return (
    <div className="pt-[var(--header-height)]">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Architectural City Coverage Hero */}
      <section className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 bg-slate-50 dark:bg-[#070d1e] overflow-hidden border-b border-slate-200/80 dark:border-amber-500/10 transition-colors duration-300">
        {/* Layered Regional Atmosphere */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageHeroBackground pageKey="cities" overlayOpacity={0.4} />
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[18rem] bg-gradient-to-r from-blue-600/15 via-amber-500/10 to-blue-600/10 rounded-full blur-[90px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/85 via-slate-50/75 to-slate-50 dark:from-[#070d1e]/85 dark:via-[#070d1e]/75 dark:to-[#070d1e] transition-colors duration-300" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-5">
          {/* Breadcrumbs Navigation */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Link href={`/${locale}`} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              {isRtl ? "الرئيسية" : "Home"}
            </Link>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <span className="text-slate-600 dark:text-slate-300">
              {isRtl ? "المناطق والمدن" : "Regions & Cities"}
            </span>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <span className="text-amber-600 dark:text-amber-400/90 font-medium">{cityName}</span>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-white/5 backdrop-blur-md border border-amber-500/30 shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-200/90 tracking-wide">
              {isRtl ? `تغطية ميدانية شاملة — ${cityName} (${regionName})` : `Full Field Coverage — ${cityName} (${regionName})`}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
            className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            {isRtl ? (
              <>
                خدمات الزجاج والألمنيوم والواجهات في{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-[#F3E7C4] dark:via-[#E5C378] dark:to-[#C99E32]">
                  {cityName}
                </span>
              </>
            ) : (
              <>
                Glass, Facades & Aluminum Solutions in{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-[#F3E7C4] dark:via-[#E5C378] dark:to-[#C99E32]">
                  {cityName}
                </span>
              </>
            )}
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isRtl
              ? `نوفر أفضل خدمات تصنيع وتوريد وتركيب الزجاج السيكوريت، الواجهات المعمارية، الألمنيوم، والمقاولات في ${cityName} مع معاينة هندسية مجانية وضمان 10 سنوات.`
              : `Certified installation of securit glass, curtain walls, and aluminum systems in ${cityName} with free engineering survey and 10-year warranty.`}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href={`/${locale}/quote`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#E5C378] to-[#C99E32] text-primary-950 font-bold text-sm shadow-md hover:brightness-105 active:scale-95 transition-all">
              {isRtl ? "اطلب عرض سعر مجاني" : "Request Free Quote"}
              <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
            </Link>
            <a href="tel:+966532438253"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-colors">
              <Phone className="w-4 h-4 text-amber-400" />
              <span dir="ltr">+966 53 243 8253</span>
            </a>
          </motion.div>
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
