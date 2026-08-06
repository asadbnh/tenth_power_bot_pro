import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { GalleryPageContent } from "@/components/pages/GalleryPageContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    title: dict.gallery.title,
    description: dict.gallery.subtitle,
    alternates: { canonical: `${appUrl}/${locale}/gallery`, languages: { ar: `${appUrl}/ar/gallery`, en: `${appUrl}/en/gallery` } },
  };
}

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return <GalleryPageContent locale={locale as Locale} dict={dict} />;
}
