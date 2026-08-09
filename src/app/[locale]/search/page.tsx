import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { SearchPageContent } from "@/components/pages/SearchPageContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    title: dict.search.title,
    description: dict.meta.siteDescription,
    alternates: { canonical: `${appUrl}/${locale}/search`, languages: { ar: `${appUrl}/ar/search`, en: `${appUrl}/en/search` } },
  };
}

export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return <SearchPageContent locale={locale as Locale} dict={dict} />;
}
