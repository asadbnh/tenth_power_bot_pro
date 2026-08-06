export const i18nConfig = {
  defaultLocale: "ar" as const,
  locales: ["ar", "en"] as const,
} as const;

export type Locale = (typeof i18nConfig.locales)[number];

export function isValidLocale(locale: string): locale is Locale {
  return i18nConfig.locales.includes(locale as Locale);
}

/**
 * Returns the text direction for a locale.
 */
export function getLocaleDirection(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/**
 * Returns the HTML lang attribute value.
 */
export function getLocaleHtmlLang(locale: Locale): string {
  const map: Record<Locale, string> = {
    ar: "ar-SA",
    en: "en-US",
  };
  return map[locale];
}

/**
 * Returns the alternate locale.
 */
export function getAlternateLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}

/**
 * Builds a localized path.
 */
export function getLocalizedPath(path: string, locale: Locale): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${cleanPath === "/" ? "" : cleanPath}`;
}
