import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ProjectDetailPageContent } from "@/components/pages/ProjectDetailPageContent";

const VALID_SLUGS = [
  "king-abdullah-tower", "luxury-villa-facade", "modern-kitchen-suite",
  "commercial-center", "tempered-glass-office", "aluminum-windows-villa",
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
    ? `مشروع ${slug.replace("-", " ")} | WebTaky`
    : `Project ${slug.replace("-", " ")} | WebTaky`;

  return {
    title,
    description: isAr
      ? `استعرض تفاصيل ومراحل تنفيذ مشروع ${slug.replace("-", " ")} من تنفيذ WebTaky`
      : `Explore execution stages and specs of project ${slug.replace("-", " ")} by WebTaky`,
    alternates: {
      canonical: `${appUrl}/${locale}/projects/${slug}`,
      languages: { ar: `${appUrl}/ar/projects/${slug}`, en: `${appUrl}/en/projects/${slug}` },
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const dict = await getDictionary(locale as Locale);

  return <ProjectDetailPageContent slug={slug} locale={locale as Locale} dict={dict} />;
}
