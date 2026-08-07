import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { CityServicePageContent } from "@/components/pages/CityServicePageContent";
import { getCityServicePageBySlug, getCityPagesList, getServices } from "@/lib/actions/content";

const FALLBACK_CITIES: Record<string, { ar: string; en: string; region_ar: string; region_en: string }> = {
  riyadh: { ar: "الرياض", en: "Riyadh", region_ar: "منطقة الرياض", region_en: "Riyadh Region" },
  jeddah: { ar: "جدة", en: "Jeddah", region_ar: "منطقة مكة المكرمة", region_en: "Mecca Region" },
  dammam: { ar: "الدمام", en: "Dammam", region_ar: "المنطقة الشرقية", region_en: "Eastern Province" },
  khobar: { ar: "الخبر", en: "Al Khobar", region_ar: "المنطقة الشرقية", region_en: "Eastern Province" },
};

const FALLBACK_SERVICES: Record<string, { ar: string; en: string }> = {
  "tempered-glass": { ar: "زجاج سكريت", en: "Tempered Glass" },
  "glass-facades": { ar: "واجهات زجاجية", en: "Glass Facades" },
  "aluminum": { ar: "ألمنيوم", en: "Aluminum" },
  "kitchens": { ar: "مطابخ", en: "Kitchens" },
};

export async function generateStaticParams() {
  const params: { city: string; service: string }[] = [];
  const dbCities = await getCityPagesList("ar").catch(() => []);
  const dbServices = await getServices("ar").catch(() => []);

  const cities = dbCities.length ? dbCities.map((c) => (c as unknown as { slug: string }).slug) : Object.keys(FALLBACK_CITIES);
  const services = dbServices.length ? dbServices.map((s) => (s as unknown as { slug: string }).slug) : Object.keys(FALLBACK_SERVICES);

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

  const fallbackCity = FALLBACK_CITIES[city];
  const fallbackService = FALLBACK_SERVICES[service];

  const isAr = locale === "ar";
  const cityName = dbData?.cityName || (isAr ? fallbackCity?.ar : fallbackCity?.en) || city;
  const serviceName = dbData?.serviceName || (isAr ? fallbackService?.ar : fallbackService?.en) || service;
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

  const fallbackCity = FALLBACK_CITIES[city];
  const fallbackService = FALLBACK_SERVICES[service];

  if (!dbData && (!fallbackCity || !fallbackService)) {
    const { notFound } = await import("next/navigation");
    notFound();
  }

  const isAr = locale === "ar";
  const cityName = dbData?.cityName || (isAr ? fallbackCity?.ar : fallbackCity?.en) || city;
  const serviceName = dbData?.serviceName || (isAr ? fallbackService?.ar : fallbackService?.en) || service;
  const regionName = dbData?.regionName || (isAr ? fallbackCity?.region_ar : fallbackCity?.region_en) || "";

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

