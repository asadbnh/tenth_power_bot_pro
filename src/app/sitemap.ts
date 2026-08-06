import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://webtaky.com";

const LOCALES = ["ar", "en"] as const;

const STATIC_PAGES = [
  { path: "", priority: 1.0, changeFrequency: "weekly" as const },
  { path: "/services", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/projects", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/gallery", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/blog", priority: 0.8, changeFrequency: "daily" as const },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/quote", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/testimonials", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" as const },
];

const SERVICE_SLUGS = [
  "tempered-glass", "glass-facades", "aluminum", "kitchens",
  "decorations", "doors-windows", "contracting", "maintenance",
];

const CITIES = [
  "riyadh", "jeddah", "dammam", "khobar", "mecca",
  "madinah", "abha", "tabuk", "jizan", "najran",
];

const ARTICLE_SLUGS = [
  "types-of-tempered-glass", "aluminum-vs-upvc",
  "kitchen-design-trends-2024", "glass-facade-maintenance",
  "home-decoration-ideas", "contracting-guide-saudi",
];

/**
 * Dynamic sitemap generation.
 * In production, this will also query Supabase for dynamic content.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  for (const locale of LOCALES) {
    for (const page of STATIC_PAGES) {
      entries.push({
        url: `${appUrl}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }
  }

  // Service detail pages
  for (const locale of LOCALES) {
    for (const slug of SERVICE_SLUGS) {
      entries.push({
        url: `${appUrl}/${locale}/services/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.85,
      });
    }
  }

  // Blog articles
  for (const locale of LOCALES) {
    for (const slug of ARTICLE_SLUGS) {
      entries.push({
        url: `${appUrl}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.75,
      });
    }
  }

  // City landing pages
  for (const locale of LOCALES) {
    for (const city of CITIES) {
      entries.push({
        url: `${appUrl}/${locale}/cities/${city}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
      // City + Service combos
      for (const service of SERVICE_SLUGS) {
        entries.push({
          url: `${appUrl}/${locale}/cities/${city}/${service}`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  }

  return entries;
}
