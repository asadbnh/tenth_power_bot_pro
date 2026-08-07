import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { CityPageContent } from "@/components/pages/CityPageContent";
import { getCityPageBySlug, getCityPagesList } from "@/lib/actions/content";
import { getFallbackCities, getFallbackServices } from "@/lib/fallback-provider";

export async function generateStaticParams() {
  const dbCities = await getCityPagesList("ar").catch(() => []);
  if (dbCities && dbCities.length > 0) {
    return dbCities.map((c) => ({ city: (c as unknown as { slug: string }).slug }));
  }
  return getFallbackCities().map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; city: string }>;
}): Promise<Metadata> {
  const { locale, city } = await params;
  const dbCity = await getCityPageBySlug(city, locale).catch(() => null);
  const fallbacks = getFallbackCities();
  const fallback = fallbacks.find((c) => c.slug === city) || fallbacks[0];

  const cityName = dbCity?.cityName || (locale === "ar" ? fallback?.city_name_ar : fallback?.city_name_en) || city;
  const regionName = dbCity?.regionName || (locale === "ar" ? fallback?.region_ar : fallback?.region_en) || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://webtaky.com";

  const isAr = locale === "ar";
  const title = String(isAr
    ? `خدمات الزجاج والألمنيوم في ${cityName} | WebTaky`
    : `Glass & Aluminum Services in ${cityName} | WebTaky`);
  const description = String(dbCity?.description || (isAr
    ? `أفضل شركة لخدمات الزجاج السكريت والألمنيوم والمطابخ والديكورات في ${cityName} - ${regionName}. تركيب احترافي وضمان شامل.`
    : `Best glass, aluminum, kitchens & decoration services in ${cityName} - ${regionName}. Professional installation with comprehensive warranty.`));

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
  const fallbacks = getFallbackCities();
  const fallback = fallbacks.find((c) => c.slug === city) || fallbacks[0];

  if (!dbCity && !fallback) {
    const { notFound } = await import("next/navigation");
    notFound();
  }

  const cityData = {
    ar: String(dbCity?.cityName || fallback?.city_name_ar || city),
    en: String(dbCity?.cityName || fallback?.city_name_en || city),
    region_ar: String(dbCity?.regionName || fallback?.region_ar || ""),
    region_en: String(dbCity?.regionName || fallback?.region_en || ""),
  };

  const services = (dbCity?.services && (dbCity.services as any[]).length > 0)
    ? dbCity.services
    : getFallbackServices();

  return (
    <CityPageContent
      locale={locale as Locale}
      city={city}
      cityData={cityData}
      initialServices={services as any[]}
    />
  );
}
