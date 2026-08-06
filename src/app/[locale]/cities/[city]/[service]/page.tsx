import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { CityServicePageContent } from "@/components/pages/CityServicePageContent";

const CITIES: Record<string, { ar: string; en: string; region_ar: string; region_en: string }> = {
  riyadh: { ar: "الرياض", en: "Riyadh", region_ar: "منطقة الرياض", region_en: "Riyadh Region" },
  jeddah: { ar: "جدة", en: "Jeddah", region_ar: "منطقة مكة المكرمة", region_en: "Mecca Region" },
  dammam: { ar: "الدمام", en: "Dammam", region_ar: "المنطقة الشرقية", region_en: "Eastern Province" },
  khobar: { ar: "الخبر", en: "Al Khobar", region_ar: "المنطقة الشرقية", region_en: "Eastern Province" },
  mecca: { ar: "مكة المكرمة", en: "Mecca", region_ar: "منطقة مكة المكرمة", region_en: "Mecca Region" },
  madinah: { ar: "المدينة المنورة", en: "Madinah", region_ar: "منطقة المدينة", region_en: "Madinah Region" },
  abha: { ar: "أبها", en: "Abha", region_ar: "منطقة عسير", region_en: "Asir Region" },
  tabuk: { ar: "تبوك", en: "Tabuk", region_ar: "منطقة تبوك", region_en: "Tabuk Region" },
  jizan: { ar: "جازان", en: "Jizan", region_ar: "منطقة جازان", region_en: "Jizan Region" },
  najran: { ar: "نجران", en: "Najran", region_ar: "منطقة نجران", region_en: "Najran Region" },
};

const SERVICES: Record<string, { ar: string; en: string }> = {
  "tempered-glass": { ar: "زجاج سكريت", en: "Tempered Glass" },
  "glass-facades": { ar: "واجهات زجاجية", en: "Glass Facades" },
  "aluminum": { ar: "ألمنيوم", en: "Aluminum" },
  "kitchens": { ar: "مطابخ", en: "Kitchens" },
};

export async function generateStaticParams() {
  const params: { city: string; service: string }[] = [];
  for (const city of Object.keys(CITIES)) {
    for (const service of Object.keys(SERVICES)) {
      params.push({ city, service });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; city: string; service: string }>;
}): Promise<Metadata> {
  const { locale, city, service } = await params;
  const cityData = CITIES[city];
  const serviceData = SERVICES[service];
  if (!cityData || !serviceData) return {};

  const isAr = locale === "ar";
  const cityName = isAr ? cityData.ar : cityData.en;
  const serviceName = isAr ? serviceData.ar : serviceData.en;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const title = isAr
    ? `خدمة ${serviceName} في ${cityName} | WebTaky`
    : `${serviceName} Services in ${cityName} | WebTaky`;

  const description = isAr
    ? `افضل شركة توريد وتركيب ${serviceName} في ${cityName} وجميع أحياء ${cityData.region_ar}. ضمان شامل واسعار منافسة.`
    : `Best ${serviceName} supply & installation services in ${cityName} - ${cityData.region_en}. Comprehensive warranty and competitive rates.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${appUrl}/${locale}/cities/${city}/${service}`,
      languages: { ar: `${appUrl}/ar/cities/${city}/${service}`, en: `${appUrl}/en/cities/${city}/${service}` },
    },
  };
}

export default async function CityServicePage({
  params,
}: {
  params: Promise<{ locale: string; city: string; service: string }>;
}) {
  const { locale, city, service } = await params;
  const cityData = CITIES[city];
  const serviceData = SERVICES[service];

  if (!cityData || !serviceData) {
    const { notFound } = await import("next/navigation");
    notFound();
  }

  const isAr = locale === "ar";

  return (
    <CityServicePageContent
      locale={locale as Locale}
      city={city}
      service={service}
      cityName={isAr ? cityData.ar : cityData.en}
      serviceName={isAr ? serviceData.ar : serviceData.en}
      regionName={isAr ? cityData.region_ar : cityData.region_en}
    />
  );
}
