import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { i18nConfig, getLocaleDirection, getLocaleHtmlLang, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/marketing/WhatsAppButton";
import { AIChatWidget } from "@/components/marketing/AIChatWidget";

/**
 * Generate static params for all supported locales.
 * This enables static generation for each locale at build time.
 */
export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

/**
 * Generate metadata for the locale layout.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const alternateLocale = locale === "ar" ? "en" : "ar";

  return {
    title: {
      template: `%s | ${dict.meta.siteName}`,
      default: `${dict.meta.homeTitle} | ${dict.meta.siteName}`,
    },
    description: dict.meta.siteDescription,
    alternates: {
      canonical: `${appUrl}/${locale}`,
      languages: {
        ar: `${appUrl}/ar`,
        en: `${appUrl}/en`,
        "x-default": `${appUrl}/ar`,
      },
    },
    openGraph: {
      title: `${dict.meta.homeTitle} | ${dict.meta.siteName}`,
      description: dict.meta.siteDescription,
      url: `${appUrl}/${locale}`,
      siteName: dict.meta.siteName,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      alternateLocale: alternateLocale === "ar" ? "ar_SA" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.meta.homeTitle} | ${dict.meta.siteName}`,
      description: dict.meta.siteDescription,
    },
  };
}

/**
 * Locale Layout — wraps all pages within a locale.
 * Includes Header, Footer, WhatsApp button.
 * Sets HTML lang and dir attributes for RTL/LTR support.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!i18nConfig.locales.includes(locale as Locale)) {
    notFound();
  }

  const validLocale = locale as Locale;
  const dir = getLocaleDirection(validLocale);
  const htmlLang = getLocaleHtmlLang(validLocale);
  const dict = await getDictionary(validLocale);

  return (
    <div lang={htmlLang} dir={dir} className="min-h-dvh flex flex-col">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white"
        style={{ insetInlineStart: "1rem" }}
      >
        {validLocale === "ar" ? "تخطي إلى المحتوى الرئيسي" : "Skip to main content"}
      </a>

      {/* Header */}
      <Header locale={validLocale} dict={dict} />

      {/* Main Content */}
      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer locale={validLocale} dict={dict} />

      {/* Floating WhatsApp Button */}
      <WhatsAppButton locale={validLocale} />

      {/* AI Chat Widget */}
      <AIChatWidget locale={validLocale} />
    </div>
  );
}
