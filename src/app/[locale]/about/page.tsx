import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { AboutPageContent } from "@/components/pages/AboutPageContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    title: dict.about.title,
    description: dict.about.subtitle,
    alternates: { canonical: `${appUrl}/${locale}/about`, languages: { ar: `${appUrl}/ar/about`, en: `${appUrl}/en/about` } },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return <AboutPageContent locale={locale as Locale} dict={dict} />;
}
