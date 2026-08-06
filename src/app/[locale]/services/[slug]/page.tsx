import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ServiceDetailPageContent } from "@/components/pages/ServiceDetailPageContent";

const VALID_SLUGS = [
  "tempered-glass", "glass-facades", "aluminum", "kitchens",
  "decorations", "doors-windows", "contracting", "maintenance",
];

export async function generateStaticParams() {
  return VALID_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const isAr = locale === "ar";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const title = isAr
    ? `تفاصيل خدمة ${slug.replace("-", " ")} | WebTaky`
    : `${slug.replace("-", " ")} Service Details | WebTaky`;

  return {
    title,
    description: isAr
      ? `تعرف على تفاصيل ومواصفات وتكلفة تنفيذ ${slug.replace("-", " ")} من WebTaky`
      : `Explore specifications, features and installation details for ${slug.replace("-", " ")} by WebTaky`,
    alternates: {
      canonical: `${appUrl}/${locale}/services/${slug}`,
      languages: { ar: `${appUrl}/ar/services/${slug}`, en: `${appUrl}/en/services/${slug}` },
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const dict = await getDictionary(locale as Locale);

  return <ServiceDetailPageContent slug={slug} locale={locale as Locale} dict={dict} />;
}
