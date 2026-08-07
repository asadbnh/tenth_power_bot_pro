import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { FaqPageContent } from "@/components/pages/FaqPageContent";
import { getFaqs } from "@/lib/actions/content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    title: dict.faq.title,
    description: dict.faq.subtitle,
    alternates: { canonical: `${appUrl}/${locale}/faq`, languages: { ar: `${appUrl}/ar/faq`, en: `${appUrl}/en/faq` } },
  };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = locale as Locale;
  const dict = await getDictionary(validLocale);
  const faqs = await getFaqs(validLocale).catch(() => []);

  return <FaqPageContent locale={validLocale} dict={dict} initialFaqs={faqs as any[]} />;
}
