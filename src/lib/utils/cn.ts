import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with proper conflict resolution.
 * Combines clsx for conditional classes with tailwind-merge for deduplication.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number with locale-specific separators.
 */
export function formatNumber(num: number, locale: string = "ar-SA"): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Formats a date to a locale-specific string.
 */
export function formatDate(
  date: Date | string,
  locale: string = "ar-SA",
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(d);
}

/**
 * Formats a relative time (e.g., "3 days ago").
 */
export function formatRelativeTime(
  date: Date | string,
  locale: string = "ar-SA"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffDay > 30) return formatDate(d, locale);
  if (diffDay > 0) return rtf.format(-diffDay, "day");
  if (diffHour > 0) return rtf.format(-diffHour, "hour");
  if (diffMin > 0) return rtf.format(-diffMin, "minute");
  return rtf.format(-diffSec, "second");
}

/**
 * Generates a URL-safe slug from text.
 * Supports Arabic text by transliterating common characters.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace Arabic characters with latin equivalents for URL safety
    .replace(/[أإآا]/g, "a")
    .replace(/[ب]/g, "b")
    .replace(/[ت]/g, "t")
    .replace(/[ث]/g, "th")
    .replace(/[ج]/g, "j")
    .replace(/[ح]/g, "h")
    .replace(/[خ]/g, "kh")
    .replace(/[د]/g, "d")
    .replace(/[ذ]/g, "dh")
    .replace(/[ر]/g, "r")
    .replace(/[ز]/g, "z")
    .replace(/[س]/g, "s")
    .replace(/[ش]/g, "sh")
    .replace(/[ص]/g, "s")
    .replace(/[ض]/g, "d")
    .replace(/[ط]/g, "t")
    .replace(/[ظ]/g, "z")
    .replace(/[ع]/g, "a")
    .replace(/[غ]/g, "gh")
    .replace(/[ف]/g, "f")
    .replace(/[ق]/g, "q")
    .replace(/[ك]/g, "k")
    .replace(/[ل]/g, "l")
    .replace(/[م]/g, "m")
    .replace(/[ن]/g, "n")
    .replace(/[ه]/g, "h")
    .replace(/[و]/g, "w")
    .replace(/[ي]/g, "y")
    .replace(/[ة]/g, "h")
    .replace(/[ئ]/g, "y")
    .replace(/[ؤ]/g, "w")
    .replace(/[\u0640]/g, "") // tatweel
    .replace(/[\u064B-\u065F]/g, "") // diacritics
    // Replace spaces and special chars with hyphens
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncates text to a specified length with an ellipsis.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Calculates estimated reading time for an article.
 */
export function calculateReadTime(
  text: string,
  wordsPerMinute: number = 200
): number {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Debounce function for search and input handlers.
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Type guard to check if a value is not null or undefined.
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Extracts initials from a name (supports Arabic).
 */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Returns the appropriate direction for a locale.
 */
export function getDirection(locale: string): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/**
 * Formats a phone number for WhatsApp links.
 */
export function formatWhatsAppUrl(
  phone: string,
  message?: string
): string {
  const cleanPhone = phone.replace(/[^\d+]/g, "");
  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${cleanPhone}${encodedMessage}`;
}

/**
 * Formats a phone number for tel: links.
 */
export function formatTelUrl(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
