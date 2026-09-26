import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { CityServicePageContent } from "@/components/pages/CityServicePageContent";
import { getCityServicePageBySlug, getCityPagesList, getServices } from "@/lib/actions/content";
import { getFallbackServices } from "@/lib/fallback-provider";

export const revalidate = 60;

export async function generateStaticParams() {
  const params: { city: string; service: string }[] = [];
  const dbCities = await getCityPagesList("ar").catch(() => []);
  const dbServices = await getServices("ar").catch(() => []);

  const cities = (dbCities || []).map((c) => (c as unknown as { slug: string }).slug);
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

  const isAr = locale === "ar";
  const cityName = dbData?.cityName || city;
  const serviceName = dbData?.serviceName || service;
  const regionName = dbData?.regionName || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://powerof10.netlify.app";

  const title = isAr
    ? `خدمة ${serviceName} في ${cityName} | tenth-power-glass`
    : `${serviceName} Services in ${cityName} | tenth-power-glass`;

  const description = isAr
    ? `افضل شركة توريد وتركيب ${serviceName} في ${cityName}${regionName ? ` وجميع أحياء ${regionName}` : ""}. ضمان شامل واسعار منافسة.`
    : `Best ${serviceName} supply & installation services in ${cityName}${regionName ? ` - ${regionName}` : ""}. Comprehensive warranty and competitive rates.`;

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

  if (!dbData) {
    notFound();
  }

  const cityName = String(dbData.cityName || city);
  const serviceName = String(dbData.serviceName || service);
  const regionName = String(dbData.regionName || "");

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


