import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { TestimonialsPageContent } from "@/components/pages/TestimonialsPageContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    title: dict.testimonials.title,
    description: dict.testimonials.subtitle,
    alternates: { canonical: `${appUrl}/${locale}/testimonials`, languages: { ar: `${appUrl}/ar/testimonials`, en: `${appUrl}/en/testimonials` } },
  };
}

export default async function TestimonialsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return <TestimonialsPageContent locale={locale as Locale} dict={dict} />;
}
