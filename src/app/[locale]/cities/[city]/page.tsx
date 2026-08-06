import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { CityPageContent } from "@/components/pages/CityPageContent";

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

export async function generateStaticParams() {
  return Object.keys(CITIES).map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; city: string }>;
}): Promise<Metadata> {
  const { locale, city } = await params;
  const cityData = CITIES[city];
  if (!cityData) return {};

  const isAr = locale === "ar";
  const cityName = isAr ? cityData.ar : cityData.en;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const title = isAr
    ? `خدمات الزجاج والألمنيوم في ${cityName} | WebTaky`
    : `Glass & Aluminum Services in ${cityName} | WebTaky`;
  const description = isAr
    ? `أفضل شركة لخدمات الزجاج السكريت والألمنيوم والمطابخ والديكورات في ${cityName} - ${cityData.region_ar}. تركيب احترافي وضمان شامل.`
    : `Best glass, aluminum, kitchens & decoration services in ${cityName} - ${cityData.region_en}. Professional installation with comprehensive warranty.`;

  return {
    title, description,
    alternates: {
      canonical: `${appUrl}/${locale}/cities/${city}`,
      languages: { ar: `${appUrl}/ar/cities/${city}`, en: `${appUrl}/en/cities/${city}` },
    },
    openGraph: { title, description },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ locale: string; city: string }>;
}) {
  const { locale, city } = await params;
  const cityData = CITIES[city];

  if (!cityData) {
    const { notFound } = await import("next/navigation");
    notFound();
  }

  return (
    <CityPageContent
      locale={locale as Locale}
      city={city}
      cityData={cityData!}
    />
  );
}
