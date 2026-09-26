import type { MetadataRoute } from "next";
import { getSql } from "@/lib/db";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://powerof10.netlify.app";
const LOCALES = ["ar", "en"] as const;

const STATIC_PAGES = [
  { path: "", priority: 1.0, changeFrequency: "daily" as const },
  { path: "/services", priority: 0.95, changeFrequency: "daily" as const },
  { path: "/projects", priority: 0.95, changeFrequency: "daily" as const },
  { path: "/gallery", priority: 0.85, changeFrequency: "weekly" as const },
  { path: "/blog", priority: 0.85, changeFrequency: "daily" as const },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.85, changeFrequency: "monthly" as const },
  { path: "/quote", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/testimonials", priority: 0.75, changeFrequency: "weekly" as const },
  { path: "/faq", priority: 0.75, changeFrequency: "monthly" as const },
];

const DEFAULT_CITIES = [
  "riyadh", "jeddah", "dammam", "khobar", "mecca",
  "madinah", "abha", "tabuk", "jizan", "najran",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  // 1. Static pages for all locales
  for (const locale of LOCALES) {
    for (const page of STATIC_PAGES) {
      entries.push({
        url: `${appUrl}/${locale}${page.path}`,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }
  }

  // 2. Query dynamic content from Neon DB
  let serviceSlugs: string[] = [];
  let projectSlugs: string[] = [];
  let articleSlugs: string[] = [];

  try {
    const sql = getSql();
    const [services, projects, articles] = await Promise.all([
      sql`SELECT slug, updated_at FROM services WHERE is_active = true;`,
      sql`SELECT slug, created_at AS updated_at FROM projects WHERE is_active = true;`,
      sql`SELECT slug, updated_at FROM articles WHERE is_published = true;`,
    ]);

    serviceSlugs = services.map((s: any) => s.slug);
    projectSlugs = projects.map((p: any) => p.slug);
    articleSlugs = articles.map((a: any) => a.slug);
  } catch (err) {
    console.warn("[Sitemap] Failed to query dynamic slugs from DB, using defaults:", err);
    serviceSlugs = [
      "tempered-glass", "glass-facades", "aluminum", "kitchens",
      "decorations", "doors-windows", "contracting", "maintenance",
    ];
    projectSlugs = [
      "twenty-five-commercial-center-facade",
      "curved-glass-refrigerated-showcases",
      "panoramic-curved-glass-elevator",
      "commercial-bakery-display-counters",
      "luxury-decor-mirrors-tables",
      "turnkey-fitout-contracting",
      "commercial-glass-facade",
    ];
    articleSlugs = [
      "types-of-tempered-glass", "aluminum-vs-upvc",
      "kitchen-design-trends-2024", "glass-facade-maintenance",
    ];
  }

  // 3. Service detail pages
  for (const locale of LOCALES) {
    for (const slug of serviceSlugs) {
      entries.push({
        url: `${appUrl}/${locale}/services/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
  }

  // 4. Project detail pages (Critical for SEO portfolio ranking)
  for (const locale of LOCALES) {
    for (const slug of projectSlugs) {
      entries.push({
        url: `${appUrl}/${locale}/projects/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
  }

  // 5. Blog articles
  for (const locale of LOCALES) {
    for (const slug of articleSlugs) {
      entries.push({
        url: `${appUrl}/${locale}/blog/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  // 6. City landing pages and City + Service combinations
  for (const locale of LOCALES) {
    for (const city of DEFAULT_CITIES) {
      entries.push({
        url: `${appUrl}/${locale}/cities/${city}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.75,
      });

      for (const service of serviceSlugs) {
        entries.push({
          url: `${appUrl}/${locale}/cities/${city}/${service}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  }

  return entries;
}
