import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { CityServicePageContent } from "@/components/pages/CityServicePageContent";
import { getCityServicePageBySlug, getCityPagesList, getServices } from "@/lib/actions/content";
import { getFallbackCities, getFallbackServices } from "@/lib/fallback-provider";

export async function generateStaticParams() {
  const params: { city: string; service: string }[] = [];
  const dbCities = await getCityPagesList("ar").catch(() => []);
  const dbServices = await getServices("ar").catch(() => []);

  const cities = dbCities.length ? dbCities.map((c) => (c as unknown as { slug: string }).slug) : getFallbackCities().map((c) => c.slug);
  const services = dbServices.length ? dbServices.map((s) => (s as unknown as { slug: string }).slug) : getFallbackServices().map((s) => s.slug);

  for (const city of cities) {
    for (const service of services) {
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
  const dbData = await getCityServicePageBySlug(city, service, locale).catch(() => null);

  const fallbackCities = getFallbackCities();
  const fallbackServices = getFallbackServices();
  const fallbackCity = fallbackCities.find((c) => c.slug === city) || fallbackCities[0];
  const fallbackService = fallbackServices.find((s) => s.slug === service) || fallbackServices[0];

  const isAr = locale === "ar";
  const cityName = dbData?.cityName || (isAr ? fallbackCity?.city_name_ar : fallbackCity?.city_name_en) || city;
  const serviceName = dbData?.serviceName || (isAr ? fallbackService?.name_ar : fallbackService?.name_en) || service;
  const regionName = dbData?.regionName || (isAr ? fallbackCity?.region_ar : fallbackCity?.region_en) || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://webtaky.com";

  const title = isAr
    ? `خدمة ${serviceName} في ${cityName} | WebTaky`
    : `${serviceName} Services in ${cityName} | WebTaky`;

  const description = isAr
    ? `افضل شركة توريد وتركيب ${serviceName} في ${cityName} وجميع أحياء ${regionName}. ضمان شامل واسعار منافسة.`
    : `Best ${serviceName} supply & installation services in ${cityName} - ${regionName}. Comprehensive warranty and competitive rates.`;

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
  const dbData = await getCityServicePageBySlug(city, service, locale).catch(() => null);

  const fallbackCities = getFallbackCities();
  const fallbackServices = getFallbackServices();
  const fallbackCity = fallbackCities.find((c) => c.slug === city) || fallbackCities[0];
  const fallbackService = fallbackServices.find((s) => s.slug === service) || fallbackServices[0];

  if (!dbData && (!fallbackCity || !fallbackService)) {
    const { notFound } = await import("next/navigation");
    notFound();
  }

  const isAr = locale === "ar";
  const cityName = String(dbData?.cityName || (isAr ? fallbackCity?.city_name_ar : fallbackCity?.city_name_en) || city);
  const serviceName = String(dbData?.serviceName || (isAr ? fallbackService?.name_ar : fallbackService?.name_en) || service);
  const regionName = String(dbData?.regionName || (isAr ? fallbackCity?.region_ar : fallbackCity?.region_en) || "");

  return (
    <CityServicePageContent
      locale={locale as Locale}
      city={city}
      service={service}
      cityName={cityName}
      serviceName={serviceName}
      regionName={regionName}
    />
  );
}

