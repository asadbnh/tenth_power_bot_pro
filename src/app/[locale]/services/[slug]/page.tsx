import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ServiceDetailPageContent } from "@/components/pages/ServiceDetailPageContent";
import { getServiceBySlug, getServices, getSeoMetadata } from "@/lib/actions/content";
import { getFallbackServices } from "@/lib/fallback-provider";

export async function generateStaticParams() {
  const dbServices = await getServices().catch(() => []);
  if (dbServices && dbServices.length > 0) {
    return dbServices.map((s) => ({ slug: String(s.slug) }));
  }
  return getFallbackServices().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const isAr = locale === "ar";
  const service = await getServiceBySlug(slug, locale).catch(() => null);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://powerof10.netlify.app";

  const serviceName = service ? (isAr ? service.name_ar || service.name : service.name_en || service.name) : slug.replace(/-/g, " ");
  const defaultTitle = isAr
    ? `خدمة ${serviceName} | WebTaky`
    : `${serviceName} Service | WebTaky`;
  const defaultDescription = String(service?.short_description || service?.description || (isAr
    ? `تعرف على تفاصيل ومواصفات وتكلفة تنفيذ ${serviceName} من مؤسسة القوة العاشرة WebTaky`
    : `Explore specifications, features and installation details for ${serviceName} by WebTaky`));
  const defaultImage = String(service?.cover_image_url || "/images/defaults/services/tempered-glass.webp");

  // ─── Try to override with seo_metadata from DB ─────────────────────────────
  let seoMeta: Record<string, unknown> | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serviceId = (service as any)?.id;
  if (serviceId) {
    seoMeta = await getSeoMetadata("service", String(serviceId), locale).catch(() => null);
  }

  const title = String(seoMeta?.meta_title || defaultTitle);
  const description = String(seoMeta?.meta_description || defaultDescription);
  const ogImage = String(seoMeta?.og_image_url || defaultImage);

  return {
    title,
    description,
    alternates: {
      canonical: String(seoMeta?.canonical_url || `${appUrl}/${locale}/services/${slug}`),
      languages: { ar: `${appUrl}/ar/services/${slug}`, en: `${appUrl}/en/services/${slug}` },
    },
    openGraph: {
      title: String(seoMeta?.og_title || title),
      description: String(seoMeta?.og_description || description),
      images: [ogImage],
      type: (seoMeta?.og_type as any) || "website",
    },
    twitter: {
      card: (seoMeta?.twitter_card as any) || "summary_large_image",
      title: String(seoMeta?.twitter_title || title),
      description: String(seoMeta?.twitter_description || description),
      images: [String(seoMeta?.twitter_image_url || ogImage)],
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const validLocale = locale as Locale;
  const dict = await getDictionary(validLocale);
  const service = await getServiceBySlug(slug, validLocale).catch(() => null);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://powerof10.netlify.app";
  const isAr = validLocale === "ar";
  const serviceName = service ? (isAr ? service.name_ar || service.name : service.name_en || service.name) : slug.replace(/-/g, " ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: serviceName,
    description: service?.short_description || service?.description || "",
    url: `${appUrl}/${validLocale}/services/${slug}`,
    provider: {
      "@type": "LocalBusiness",
      name: "WebTaky - Tenth Power Glass",
      url: appUrl,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ServiceDetailPageContent slug={slug} locale={validLocale} dict={dict} initialService={service as any} />
    </>
  );
}
