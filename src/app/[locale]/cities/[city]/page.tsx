import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { CityPageContent } from "@/components/pages/CityPageContent";
import { getCityPageBySlug, getCityPagesList } from "@/lib/actions/content";
import { getFallbackServices } from "@/lib/fallback-provider";

export const revalidate = 60;

export async function generateStaticParams() {
  const dbCities = await getCityPagesList("ar").catch(() => []);
  if (dbCities && dbCities.length > 0) {
    return dbCities.map((c) => ({ city: (c as unknown as { slug: string }).slug }));
  }
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; city: string }>;
}): Promise<Metadata> {
  const { locale, city } = await params;
  const dbCity = await getCityPageBySlug(city, locale).catch(() => null);

  const cityName = String(dbCity?.cityName || city);
  const regionName = String(dbCity?.regionName || "");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://powerof10.netlify.app";

  const isAr = locale === "ar";
  const title = String(isAr
    ? `خدمات الزجاج والألمنيوم في ${cityName} | tenth-power-glass`
    : `Glass & Aluminum Services in ${cityName} | tenth-power-glass`);
  const description = String(dbCity?.description || (isAr
    ? `أفضل شركة لخدمات الزجاج السكريت والألمنيوم والمطابخ والديكورات في ${cityName}${regionName ? ` - ${regionName}` : ""}. تركيب احترافي وضمان شامل.`
    : `Best glass, aluminum, kitchens & decoration services in ${cityName}${regionName ? ` - ${regionName}` : ""}. Professional installation with comprehensive warranty.`));

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

  if (!dbCity) {
    notFound();
  }

  const cityData = {
    ar: String(dbCity.cityName || city),
    en: String(dbCity.cityName || city),
    region_ar: String(dbCity.regionName || ""),
    region_en: String(dbCity.regionName || ""),
  };

  const services = (dbCity.services && (dbCity.services as any[]).length > 0)
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

