import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { QuotePageContent } from "@/components/pages/QuotePageContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    title: dict.quote.title,
    description: dict.quote.subtitle,
    alternates: { canonical: `${appUrl}/${locale}/quote`, languages: { ar: `${appUrl}/ar/quote`, en: `${appUrl}/en/quote` } },
  };
}

export default async function QuotePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return <QuotePageContent locale={locale as Locale} dict={dict} />;
}
