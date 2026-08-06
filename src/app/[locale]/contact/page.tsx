import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ContactPageContent } from "@/components/pages/ContactPageContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    title: dict.contact.title,
    description: dict.contact.subtitle,
    alternates: { canonical: `${appUrl}/${locale}/contact`, languages: { ar: `${appUrl}/ar/contact`, en: `${appUrl}/en/contact` } },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return <ContactPageContent locale={locale as Locale} dict={dict} />;
}
