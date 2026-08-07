import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { AboutPageContent } from "@/components/pages/AboutPageContent";
import { getFallbackCompany } from "@/lib/fallback-provider";
import { getSiteSettings } from "@/lib/actions/content";

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
  const validLocale = locale as Locale;
  const dict = await getDictionary(validLocale);
  const company = getFallbackCompany();
  const settings = await getSiteSettings().catch(() => null);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://webtaky.com";
  const isAr = validLocale === "ar";

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: isAr ? company.name_ar : company.name_en,
    url: appUrl,
    logo: `${appUrl}${company.logo_url}`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: settings?.phone || company.phone_primary,
      contactType: "customer service",
      areaServed: "SA",
      availableLanguage: ["Arabic", "English"],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <AboutPageContent locale={validLocale} dict={dict} initialCompany={company as any} />
    </>
  );
}
