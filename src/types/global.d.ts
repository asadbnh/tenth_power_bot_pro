/**
 * Global type declarations for the WebTaky platform.
 */

/** Supported locale type */
type AppLocale = "ar" | "en";

/** Page params with locale */
interface LocaleParams {
  locale: AppLocale;
}

/** Page params with locale and slug */
interface LocaleSlugParams extends LocaleParams {
  slug: string;
}

/** City-service page params */
interface CityServiceParams extends LocaleParams {
  city: string;
  "service-slug": string;
}

/** Common page props with params */
interface PageProps<T = LocaleParams> {
  params: Promise<T>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

/** Window augmentation for PWA */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export {};
