import "server-only";
import type { Locale } from "./config";

// Import dictionaries statically for type safety
import arDict from "./dictionaries/ar.json";
import enDict from "./dictionaries/en.json";

/** Dictionary type derived from the Arabic JSON structure */
export type Dictionary = typeof arDict;

const dictionaries: Record<Locale, Dictionary> = {
  ar: arDict,
  en: enDict,
};

/**
 * Returns the dictionary for a given locale.
 * Server-side only. Returns a plain object (serializable for Client Components).
 */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale] ?? dictionaries.ar;
}
