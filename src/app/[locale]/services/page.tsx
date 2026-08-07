import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getServices } from "@/lib/actions/content";
import { ServicesPageContent } from "@/components/pages/ServicesPageContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://webtaky.com";
  return {
    title: dict.services.title,
    description: dict.services.subtitle,
    alternates: {
      canonical: `${appUrl}/${locale}/services`,
      languages: { ar: `${appUrl}/ar/services`, en: `${appUrl}/en/services` },
    },
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale as Locale;
  const dict = await getDictionary(validLocale);
  const dbServices = await getServices(validLocale).catch(() => []);

  return <ServicesPageContent locale={validLocale} dict={dict} initialServices={dbServices as any[]} />;
}
