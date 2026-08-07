import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { CityPageContent } from "@/components/pages/CityPageContent";
import { getCityPageBySlug, getCityPagesList } from "@/lib/actions/content";

const FALLBACK_CITIES: Record<string, { ar: string; en: string; region_ar: string; region_en: string }> = {
  riyadh: { ar: "الرياض", en: "Riyadh", region_ar: "منطقة الرياض", region_en: "Riyadh Region" },
  jeddah: { ar: "جدة", en: "Jeddah", region_ar: "منطقة مكة المكرمة", region_en: "Mecca Region" },
  dammam: { ar: "الدمام", en: "Dammam", region_ar: "المنطقة الشرقية", region_en: "Eastern Province" },
  khobar: { ar: "الخبر", en: "Al Khobar", region_ar: "المنطقة الشرقية", region_en: "Eastern Province" },
  mecca: { ar: "مكة المكرمة", en: "Mecca", region_ar: "منطقة مكة المكرمة", region_en: "Mecca Region" },
  madinah: { ar: "المدينة المنورة", en: "Madinah", region_ar: "منطقة المدينة", region_en: "Madinah Region" },
};

export async function generateStaticParams() {
  const dbCities = await getCityPagesList("ar").catch(() => []);
  if (dbCities && dbCities.length > 0) {
    return dbCities.map((c) => ({ city: (c as unknown as { slug: string }).slug }));
  }
  return Object.keys(FALLBACK_CITIES).map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; city: string }>;
}): Promise<Metadata> {
  const { locale, city } = await params;
  const dbCity = await getCityPageBySlug(city, locale).catch(() => null);
  const fallback = FALLBACK_CITIES[city];

  const cityName = dbCity?.cityName || (locale === "ar" ? fallback?.ar : fallback?.en) || city;
  const regionName = dbCity?.regionName || (locale === "ar" ? fallback?.region_ar : fallback?.region_en) || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://webtaky.com";

  const isAr = locale === "ar";
  const title = isAr
    ? `خدمات الزجاج والألمنيوم في ${cityName} | WebTaky`
    : `Glass & Aluminum Services in ${cityName} | WebTaky`;
  const description = dbCity?.description || (isAr
    ? `أفضل شركة لخدمات الزجاج السكريت والألمنيوم والمطابخ والديكورات في ${cityName} - ${regionName}. تركيب احترافي وضمان شامل.`
    : `Best glass, aluminum, kitchens & decoration services in ${cityName} - ${regionName}. Professional installation with comprehensive warranty.`);

  return {
    title,
    description,
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
  const dbCity = await getCityPageBySlug(city, locale).catch(() => null);
  const fallback = FALLBACK_CITIES[city];

  if (!dbCity && !fallback) {
    const { notFound } = await import("next/navigation");
    notFound();
  }

  const cityData = {
    ar: dbCity?.city_name_ar || fallback?.ar || city,
    en: dbCity?.city_name_en || fallback?.en || city,
    region_ar: dbCity?.region_ar || fallback?.region_ar || "",
    region_en: dbCity?.region_en || fallback?.region_en || "",
  };

  return (
    <CityPageContent
      locale={locale as Locale}
      city={city}
      cityData={cityData}
    />
  );
}

