"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSql } from "@/lib/db";
import {
  getFallbackCompany,
  getFallbackCities,
  getFallbackServices,
  getFallbackProjects,
  getFallbackArticles,
  getFallbackFaqs,
  getFallbackTestimonials,
  getFallbackGallery,
} from "@/lib/fallback-provider";

const FALLBACK_COMPANY_ID = "00000000-0000-0000-0000-000000000001";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getDefaultCompanyId(supabase: any): Promise<string> {
  try {
    const { data } = await supabase.from("companies").select("id").limit(1).single();
    if (data?.id) return data.id;
  } catch {
    // fallback
  }
  return FALLBACK_COMPANY_ID;
}

// ─── Services Actions ──────────────────────────────────────────────────

export async function getServices(locale = "ar") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const isAr = locale === "ar";

  let list: Record<string, unknown>[] = [];
  try {
    const { data } = await supabase
      .from("services")
      .select(`
        id, slug, icon, sort_order, is_featured, is_active,
        name_ar, name_en, short_description_ar, short_description_en,
        full_description_ar, full_description_en, price_from, price_to, cover_image_url
      `)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (data && data.length > 0) {
      list = data;
    }
  } catch {
    // ignore
  }

  if (list.length === 0) {
    list = getFallbackServices() as Record<string, unknown>[];
  }

  return list.map((s) => ({
    ...s,
    slug: s.slug,
    name: isAr ? s.name_ar : s.name_en || s.name_ar,
    short_description: isAr ? s.short_description_ar : s.short_description_en || s.short_description_ar,
    description: isAr ? s.full_description_ar : s.full_description_en || s.full_description_ar,
  }));
}

export async function getServiceBySlug(slug: string, locale = "ar") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const isAr = locale === "ar";

  let service: Record<string, unknown> | null = null;
  try {
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    service = data;
  } catch {
    // fallback
  }

  if (!service) {
    const fallbacks = getFallbackServices() as Record<string, unknown>[];
    service = fallbacks.find((s) => s.slug === slug) || fallbacks[0] || null;
  }

  if (!service) return null;

  return {
    ...service,
    slug: service.slug,
    name_ar: service.name_ar,
    name_en: service.name_en,
    cover_image_url: service.cover_image_url,
    name: isAr ? service.name_ar : service.name_en || service.name_ar,
    short_description: isAr ? service.short_description_ar : service.short_description_en || service.short_description_ar,
    description: isAr ? service.full_description_ar : service.full_description_en || service.full_description_ar,
    features: isAr ? service.features_ar : service.features_en || service.features_ar || [],
    specs: service.specs || [],
    faqs: service.faqs || [],
  };
}

// ─── Projects Actions ──────────────────────────────────────────────────

export async function getProjects(options?: {
  locale?: string;
  serviceSlug?: string;
  city?: string;
  limit?: number;
  page?: number;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const locale = options?.locale ?? "ar";
  const isAr = locale === "ar";
  const limit = options?.limit ?? 12;
  const offset = ((options?.page ?? 1) - 1) * limit;

  let list: Record<string, unknown>[] = [];
  let totalCount = 0;

  try {
    let query = supabase
      .from("projects")
      .select(`
        id, slug, city, status, is_featured, is_active, project_value,
        title_ar, title_en, description_ar, description_en, client_name,
        services(slug)
      `, { count: "exact" })
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (options?.city) query = query.eq("city", options.city);
    if (options?.serviceSlug) query = query.eq("services.slug", options.serviceSlug);

    const { data, count } = await query;
    if (data && data.length > 0) {
      list = data;
      totalCount = count ?? data.length;
    }
  } catch {
    // fallback
  }

  if (list.length === 0) {
    const fallbacks = getFallbackProjects() as Record<string, unknown>[];
    list = fallbacks.slice(offset, offset + limit);
    totalCount = fallbacks.length;
  } else {
    // Attach real Cloudflare R2 / media_library cover images for database projects
    try {
      const sql = getSql();
      const covers = await sql`
        SELECT pi.project_id, COALESCE(m.cdn_url, m.file_url) as cover_url
        FROM project_images pi
        JOIN media_library m ON pi.media_id = m.id
        WHERE pi.is_cover = true;
      `;
      const coverMap = new Map<string, string>();
      for (const c of covers) {
        coverMap.set(c.project_id, c.cover_url);
      }
      for (const p of list) {
        if (!p.cover_image_url && coverMap.has(p.id as string)) {
          p.cover_image_url = coverMap.get(p.id as string);
        }
      }
    } catch {
      // ignore
    }
  }

  const normalized = list.map((p) => ({
    ...p,
    slug: p.slug,
    title_ar: p.title_ar,
    title_en: p.title_en,
    cover_image_url: p.cover_image_url || "/images/defaults/projects/project-1.webp",
    name: isAr ? p.title_ar : p.title_en || p.title_ar,
    short_description: isAr ? p.description_ar : p.description_en || p.description_ar,
  }));

  return { data: normalized, count: totalCount };
}

export async function getProjectBySlug(slug: string, _locale = "ar") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  let project: Record<string, unknown> | null = null;
  try {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    project = data;
  } catch {
    // fallback
  }

  if (project) {
    try {
      const sql = getSql();
      const covers = await sql`
        SELECT COALESCE(m.cdn_url, m.file_url) as cover_url
        FROM project_images pi
        JOIN media_library m ON pi.media_id = m.id
        WHERE pi.project_id = ${project.id} AND pi.is_cover = true
        LIMIT 1;
      `;
      if (covers.length > 0) {
        project.cover_image_url = covers[0].cover_url;
      }
    } catch {
      // ignore
    }
  } else {
    const fallbacks = getFallbackProjects() as Record<string, unknown>[];
    project = fallbacks.find((p) => p.slug === slug) || fallbacks[0] || null;
  }

  if (!project) return null;

  return {
    ...project,
    slug: project.slug,
    name_ar: project.title_ar || project.name_ar,
    name_en: project.title_en || project.name_en,
    category_ar: project.category_ar || "زجاج وألمنيوم",
    category_en: project.category_en || "Glass & Aluminum",
    location_ar: project.location_ar || "الرياض - المملكة العربية السعودية",
    location_en: project.location_en || "Riyadh - KSA",
    year: project.year || "2025",
    client_ar: project.client_ar || project.client_name || "عميل مميز",
    client_en: project.client_en || project.client_name || "VIP Client",
    cover_image_url: project.cover_image_url || "/images/defaults/projects/project-1.webp",
    description_ar: project.description_ar || "",
    description_en: project.description_en || project.description_ar || "",
    challenges_ar: (project.challenges_ar as string[]) || [],
    challenges_en: (project.challenges_en as string[]) || [],
    results_ar: (project.results_ar as string[]) || [],
    results_en: (project.results_en as string[]) || [],
  };
}

// ─── Articles Actions ──────────────────────────────────────────────────

export async function getArticles(options?: { locale?: string; limit?: number; page?: number }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const locale = options?.locale ?? "ar";
  const isAr = locale === "ar";
  const limit = options?.limit ?? 9;
  const offset = ((options?.page ?? 1) - 1) * limit;

  let list: Record<string, unknown>[] = [];
  let totalCount = 0;

  try {
    const { data, count } = await supabase
      .from("articles")
      .select(`
        id, slug, cover_image_url, read_time_minutes, published_at, status, is_featured, view_count,
        title_ar, title_en, excerpt_ar, excerpt_en, content_ar, content_en
      `, { count: "exact" })
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (data && data.length > 0) {
      list = data;
      totalCount = count ?? data.length;
    }
  } catch {
    // fallback
  }

  if (list.length === 0) {
    const fallbacks = getFallbackArticles() as Record<string, unknown>[];
    list = fallbacks.slice(offset, offset + limit);
    totalCount = fallbacks.length;
  }

  const normalized = list.map((a) => ({
    ...a,
    slug: a.slug,
    title: isAr ? a.title_ar : a.title_en || a.title_ar,
    excerpt: isAr ? a.excerpt_ar : a.excerpt_en || a.excerpt_ar,
    featured_image_url: a.cover_image_url || a.featured_image_url,
    cover_image_url: a.cover_image_url || a.featured_image_url,
  }));

  return { data: normalized, count: totalCount };
}

export async function getArticleBySlug(slug: string, locale = "ar") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const isAr = locale === "ar";

  let article: Record<string, unknown> | null = null;
  try {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();
    article = data;
  } catch {
    // fallback
  }

  if (!article) {
    const fallbacks = getFallbackArticles() as Record<string, unknown>[];
    article = fallbacks.find((a) => a.slug === slug) || fallbacks[0] || null;
  }

  if (!article) return null;

  return {
    ...article,
    slug: article.slug,
    title_ar: article.title_ar || article.title,
    title_en: article.title_en || article.title,
    excerpt_ar: article.excerpt_ar || article.excerpt,
    excerpt_en: article.excerpt_en || article.excerpt,
    content_ar: article.content_ar || article.content,
    content_en: article.content_en || article.content,
    author_ar: article.author_ar || "فريق التحرير",
    author_en: article.author_en || "Editorial Team",
    published_at: article.published_at || new Date().toISOString(),
    title: isAr ? (article.title_ar || article.title) : (article.title_en || article.title_ar || article.title),
    excerpt: isAr ? (article.excerpt_ar || article.excerpt) : (article.excerpt_en || article.excerpt_ar || article.excerpt),
    content: isAr ? (article.content_ar || article.content) : (article.content_en || article.content_ar || article.content),
    featured_image_url: article.cover_image_url || article.featured_image_url,
    cover_image_url: article.cover_image_url || article.featured_image_url,
  };
}

// ─── Gallery Actions ──────────────────────────────────────────────────

export async function getGalleryAlbums(locale = "ar") {
  const isAr = locale === "ar";
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT 
        ga.id, ga.slug, ga.title_ar, ga.title_en, ga.description_ar, ga.description_en,
        COALESCE(ga.cover_image_url, m.cdn_url, m.file_url, '/images/defaults/services/tempered-glass.webp') as image_url,
        COUNT(gi.id)::int as count
      FROM gallery_albums ga
      LEFT JOIN gallery_items gi ON gi.album_id = ga.id
      LEFT JOIN media_library m ON gi.media_id = m.id
      WHERE ga.is_active = true
      GROUP BY ga.id, ga.slug, ga.title_ar, ga.title_en, ga.description_ar, ga.description_en, ga.cover_image_url, ga.sort_order, m.cdn_url, m.file_url
      ORDER BY ga.sort_order ASC;
    `;
    if (rows && rows.length > 0) {
      return rows.map((a: any) => ({
        id: a.id,
        slug: a.slug,
        title_ar: a.title_ar,
        title_en: a.title_en || a.title_ar,
        title: isAr ? a.title_ar : a.title_en || a.title_ar,
        description: isAr ? a.description_ar : a.description_en || a.description_ar,
        count: Math.max(a.count || 0, 1),
        image_url: a.image_url || "/images/defaults/services/tempered-glass.webp",
      }));
    }
  } catch (err) {
    console.warn("Error fetching gallery albums from DB:", err);
  }

  return [
    { id: 1, slug: "glass", title_ar: "مشاريع الزجاج", title_en: "Glass Projects", count: 24, image_url: "/images/defaults/services/tempered-glass.webp" },
    { id: 2, slug: "aluminum", title_ar: "أعمال الألمنيوم", title_en: "Aluminum Works", count: 18, image_url: "/images/defaults/services/aluminum-works.webp" },
    { id: 3, slug: "kitchens", title_ar: "تصاميم المطابخ", title_en: "Kitchen Designs", count: 32, image_url: "/images/defaults/services/kitchens.webp" },
    { id: 4, slug: "decor", title_ar: "مشاريع الديكور", title_en: "Decoration Projects", count: 41, image_url: "/images/defaults/services/decorations.webp" },
    { id: 5, slug: "facades", title_ar: "الواجهات الزجاجية", title_en: "Glass Facades", count: 15, image_url: "/images/defaults/services/glass-facades.webp" },
    { id: 6, slug: "doors", title_ar: "أبواب ونوافذ", title_en: "Doors & Windows", count: 28, image_url: "/images/defaults/services/doors-windows.webp" },
  ];
}

export async function getGalleryItems(options?: { serviceId?: string; albumId?: string; limit?: number; page?: number }) {
  const limit = options?.limit ?? 24;
  const offset = ((options?.page ?? 1) - 1) * limit;

  try {
    const sql = getSql();
    let rows: any[] = [];
    if (options?.albumId) {
      rows = await sql`
        SELECT 
          gi.id, gi.album_id, gi.type, gi.sort_order,
          COALESCE(m.cdn_url, m.file_url, '/images/defaults/projects/project-1.webp') as image_url,
          COALESCE(m.cdn_url, m.file_url, '/images/defaults/projects/project-1.webp') as thumbnail_url,
          COALESCE(mm.title_ar, 'صورة معمارية') as title_ar,
          COALESCE(mm.title_en, 'Architectural Photo') as title_en
        FROM gallery_items gi
        JOIN media_library m ON gi.media_id = m.id
        LEFT JOIN media_metadata mm ON mm.media_id = m.id
        WHERE gi.album_id = ${options.albumId}
        ORDER BY gi.sort_order ASC
        LIMIT ${limit} OFFSET ${offset};
      `;
    } else {
      rows = await sql`
        SELECT 
          gi.id, gi.album_id, gi.type, gi.sort_order,
          COALESCE(m.cdn_url, m.file_url, '/images/defaults/projects/project-1.webp') as image_url,
          COALESCE(m.cdn_url, m.file_url, '/images/defaults/projects/project-1.webp') as thumbnail_url,
          COALESCE(mm.title_ar, 'صورة معمارية') as title_ar,
          COALESCE(mm.title_en, 'Architectural Photo') as title_en
        FROM gallery_items gi
        JOIN media_library m ON gi.media_id = m.id
        LEFT JOIN media_metadata mm ON mm.media_id = m.id
        ORDER BY gi.sort_order ASC
        LIMIT ${limit} OFFSET ${offset};
      `;
    }

    if (rows && rows.length > 0) {
      const items = rows.map((r: any) => ({
        id: r.id,
        album_id: r.album_id,
        image_url: r.image_url || "/images/defaults/projects/project-1.webp",
        thumbnail_url: r.thumbnail_url || r.image_url || "/images/defaults/projects/project-1.webp",
        title_ar: r.title_ar,
        title_en: r.title_en,
      }));
      return { data: items, count: items.length };
    }
  } catch (err) {
    console.warn("Error fetching gallery items from DB:", err);
  }

  const fallbacks = getFallbackGallery() as unknown as Record<string, unknown>[];
  return { data: fallbacks, count: fallbacks.length };
}

// ─── Customer Reviews Actions ─────────────────────────────────────────

export async function getApprovedReviews(limit = 12) {
  let list: Record<string, unknown>[] = [];
  
  try {
    const sql = getSql();
    // 1. Try customer_reviews first
    const reviews = await sql`
      SELECT 
        id, rating, content_ar, content_en, reviewer_name,
        is_verified, created_at
      FROM customer_reviews
      WHERE is_approved = true
      ORDER BY created_at DESC
      LIMIT ${limit};
    `;
    if (reviews && reviews.length > 0) {
      list.push(...reviews);
    }

    // 2. Also fetch testimonials table
    const testimonials = await sql`
      SELECT 
        id, rating, content_ar, content_en, client_name as reviewer_name,
        client_company, client_avatar_url as reviewer_avatar_url,
        true as is_verified, created_at
      FROM testimonials
      WHERE is_approved = true
      ORDER BY is_featured DESC, created_at DESC
      LIMIT ${limit};
    `;
    if (testimonials && testimonials.length > 0) {
      list.push(...testimonials);
    }
  } catch (err) {
    console.warn("Error fetching approved reviews:", err);
  }

  if (list.length === 0) {
    list = getFallbackTestimonials() as Record<string, unknown>[];
  }

  return list.slice(0, limit);
}

export async function submitReview(data: {
  rating: number;
  content: string;
  reviewerName: string;
  reviewerCompany?: string;
  serviceId?: string;
  locale: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const companyId = await getDefaultCompanyId(supabase);
  const isAr = data.locale === "ar";

  const { data: review, error } = await supabase
    .from("customer_reviews")
    .insert({
      company_id: companyId,
      rating: data.rating,
      ...(isAr ? { content_ar: data.content } : { content_en: data.content }),
      reviewer_name: data.reviewerName,
      service_id: data.serviceId ?? null,
      is_approved: false,
      is_verified: false,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Submit review error:", error);
    return { success: false };
  }

  revalidatePath("/[locale]/testimonials", "page");
  return { success: true, id: (review as Record<string, unknown>)?.id };
}

// ─── FAQs Actions ─────────────────────────────────────────────────────

export async function getFaqs(locale = "ar") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const isAr = locale === "ar";

  let list: Record<string, unknown>[] = [];
  try {
    const { data } = await supabase
      .from("faqs")
      .select("id, question_ar, question_en, answer_ar, answer_en, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (data && data.length > 0) {
      list = data;
    }
  } catch {
    // fallback
  }

  if (list.length === 0) {
    list = getFallbackFaqs() as Record<string, unknown>[];
  }

  return list.map((f, idx) => ({
    id: f.id || `faq-${idx}`,
    question: isAr ? f.question_ar : f.question_en || f.question_ar,
    answer: isAr ? f.answer_ar : f.answer_en || f.answer_ar,
  }));
}

// ─── Site & Company Settings Actions ──────────────────────────────────

export async function getSiteSettings() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const fallback = getFallbackCompany();

  let company: Record<string, unknown> | null = null;
  try {
    const { data } = await supabase.from("companies").select("*").limit(1).single();
    company = data;
  } catch {
    company = null;
  }

  return {
    site_name_ar: company?.name_ar || fallback.name_ar,
    site_name_en: company?.name_en || fallback.name_en,
    phone: company?.phone_primary || fallback.phone_primary,
    whatsapp: company?.whatsapp_number || fallback.whatsapp_number,
    email: company?.email || fallback.email,
    tax_number: company?.tax_number || fallback.tax_number,
    commercial_register: company?.commercial_register || fallback.commercial_register,
    logo_url: company?.logo_url || fallback.logo_url,
  };
}

// ─── City Pages Actions ────────────────────────────────────────────────

export async function getCityPagesList(locale = "ar") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const isAr = locale === "ar";

  let list: Record<string, unknown>[] = [];
  try {
    const { data } = await supabase
      .from("city_pages")
      .select("id, slug, city_name_ar, city_name_en, region_ar, region_en, hero_image_url, is_active")
      .eq("is_active", true);

    if (data && data.length > 0) {
      list = data;
    }
  } catch {
    // fallback
  }

  if (list.length === 0) {
    list = getFallbackCities() as Record<string, unknown>[];
  }

  return list.map((c) => ({
    ...c,
    cityName: isAr ? c.city_name_ar : c.city_name_en || c.city_name_ar,
    regionName: isAr ? c.region_ar : c.region_en || c.region_ar,
  }));
}

export async function getCityPageBySlug(slug: string, locale = "ar") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const isAr = locale === "ar";

  let cityPage: Record<string, unknown> | null = null;
  let cityServices: Record<string, unknown>[] = [];

  try {
    const { data } = await supabase
      .from("city_pages")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    cityPage = data;

    if (cityPage) {
      const { data: servicesData } = await supabase
        .from("city_services")
        .select("service_id, unique_content_ar, unique_content_en, local_keywords_ar, services(slug, name_ar, name_en, cover_image_url)")
        .eq("city_page_id", cityPage.id);
      cityServices = servicesData || [];
    }
  } catch {
    // fallback
  }

  if (!cityPage) {
    const fallbackCities = getFallbackCities();
    const found = fallbackCities.find((c) => c.slug === slug) || fallbackCities[0];
    if (found) {
      cityPage = found as Record<string, unknown>;
    }
  }

  if (!cityPage) return null;

  return {
    ...cityPage,
    cityName: isAr ? cityPage.city_name_ar : cityPage.city_name_en || cityPage.city_name_ar,
    regionName: isAr ? cityPage.region_ar : cityPage.region_en || cityPage.region_ar,
    description: isAr ? cityPage.description_ar : cityPage.description_en || cityPage.description_ar,
    services: (cityServices.length > 0 ? cityServices : getFallbackServices() as Record<string, unknown>[]).map((cs) => {
      const s = (cs.services || cs) as Record<string, unknown>;
      return {
        slug: s?.slug,
        name: isAr ? s?.name_ar || s?.name : s?.name_en || s?.name_ar || s?.name,
        image_url: s?.cover_image_url,
      };
    }),
  };
}

export async function getCityServicePageBySlug(citySlug: string, serviceSlug: string, locale = "ar") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const isAr = locale === "ar";

  let cityPage: Record<string, unknown> | null = null;
  let service: Record<string, unknown> | null = null;

  try {
    const { data: cData } = await supabase
      .from("city_pages")
      .select("*")
      .eq("slug", citySlug)
      .eq("is_active", true)
      .single();
    cityPage = cData;

    const { data: sData } = await supabase
      .from("services")
      .select("*")
      .eq("slug", serviceSlug)
      .eq("is_active", true)
      .single();
    service = sData;
  } catch {
    // fallback
  }

  if (!cityPage) {
    const fallbackCities = getFallbackCities();
    cityPage = (fallbackCities.find((c) => c.slug === citySlug) || fallbackCities[0]) as Record<string, unknown>;
  }

  if (!service) {
    const fallbackServices = getFallbackServices();
    service = (fallbackServices.find((s) => s.slug === serviceSlug) || fallbackServices[0]) as Record<string, unknown>;
  }

  if (!cityPage || !service) return null;

  return {
    city: cityPage,
    service,
    cityName: isAr ? cityPage.city_name_ar : cityPage.city_name_en || cityPage.city_name_ar,
    serviceName: isAr ? service.name_ar : service.name_en || service.name_ar,
    regionName: isAr ? cityPage.region_ar : cityPage.region_en || cityPage.region_ar,
    customContent: (isAr ? service.full_description_ar : service.full_description_en) || service.short_description_ar,
  };
}

// ─── Analytics Dashboard Actions ───────────────────────────────────────

export async function getAnalyticsSummary() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  try {
    // 1. Top Viewed Services
    const { data: topServices } = await supabase
      .from("services")
      .select("id, name_ar, name_en, slug, view_count, price_from")
      .eq("is_active", true)
      .order("view_count", { ascending: false })
      .limit(5);

    // 2. Top Keywords & Search Terms from Analytics Events
    const { data: searchEvents } = await supabase
      .from("analytics_events")
      .select("metadata, page_path, utm_source, utm_campaign")
      .eq("event_type", "search")
      .order("created_at", { ascending: false })
      .limit(50);

    const keywordCounts: Record<string, number> = {};
    (searchEvents || []).forEach((evt: { metadata?: { query?: string } }) => {
      const q = evt.metadata?.query;
      if (q) {
        keywordCounts[q] = (keywordCounts[q] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword, count]) => ({ keyword, count }));

    return {
      topServices: topServices || [],
      topKeywords: topKeywords.length ? topKeywords : [
        { keyword: "زجاج سكريت الرياض", count: 48 },
        { keyword: "واجهات زجاج جدة", count: 35 },
        { keyword: "أسعار المطابخ", count: 29 },
        { keyword: "تركيب ألمنيوم", count: 22 },
      ],
    };
  } catch (err) {
    console.error("Failed to fetch analytics summary:", err);
    return { topServices: [], topKeywords: [] };
  }
}

// ─── Company & Brand Actions ──────────────────────────────────────────

export async function getCompany() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  try {
    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .limit(1)
      .single();

    if (company) {
      const { data: contacts } = await supabase
        .from("company_contacts")
        .select("*")
        .eq("company_id", company.id)
        .order("sort_order", { ascending: true });

      const { data: address } = await supabase
        .from("company_addresses")
        .select("*")
        .eq("company_id", company.id)
        .limit(1)
        .single();

      const { data: hours } = await supabase
        .from("business_hours")
        .select("*")
        .eq("company_id", company.id)
        .order("day_of_week", { ascending: true });

      return {
        ...company,
        contacts: contacts || [],
        address: address || null,
        business_hours: hours || [],
      };
    }
  } catch (err) {
    console.warn("Could not fetch company from DB, using fallback:", err);
  }

  return getFallbackCompany();
}

export async function getCompanyContacts() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  try {
    const { data } = await supabase
      .from("company_contacts")
      .select("*")
      .order("sort_order", { ascending: true });

    if (data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("Error fetching company contacts:", err);
  }
  return [];
}

// ─── Before / After Transformations ───────────────────────────────────

export async function getBeforeAfterItems(locale = "ar") {
  const isAr = locale === "ar";
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT 
        pba.id, pba.project_id, pba.caption_ar, pba.caption_en,
        bm.file_url as before_url, bm.cdn_url as before_cdn,
        am.file_url as after_url, am.cdn_url as after_cdn,
        p.title_ar, p.title_en, p.slug as project_slug
      FROM project_before_after pba
      JOIN media_library bm ON pba.before_image_id = bm.id
      JOIN media_library am ON pba.after_image_id = am.id
      LEFT JOIN projects p ON pba.project_id = p.id
      ORDER BY pba.sort_order ASC;
    `;
    if (rows && rows.length > 0) {
      return rows.map((r: any) => ({
        id: r.id,
        beforeImage: r.before_cdn || r.before_url,
        afterImage: r.after_cdn || r.after_url,
        caption: isAr ? r.caption_ar : r.caption_en || r.caption_ar,
        projectTitle: isAr ? r.title_ar : r.title_en || r.title_ar,
        projectSlug: r.project_slug,
      }));
    }
  } catch (err) {
    console.warn("Error fetching before/after items:", err);
  }

  return [
    {
      id: "demo-1",
      beforeImage: "/images/defaults/projects/cafe-before.webp",
      afterImage: "/images/defaults/projects/cafe-after.webp",
      caption: isAr ? "مقارنة قبل وبعد تركيب واجهات الزجاج والديكور" : "Before and after glass facade execution",
      projectTitle: isAr ? "كافيه فاخر بالرياض" : "Luxury Cafe in Riyadh",
      projectSlug: "riyadh-business-tower",
    },
  ];
}

// ─── Advertisements & Hero Banners ────────────────────────────────────

export async function getAdvertisements() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  try {
    const { data } = await supabase
      .from("advertisements")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: false });

    if (data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("Error fetching advertisements:", err);
  }
  return [];
}

// ─── Live Database Search Action ──────────────────────────────────────

export async function searchDatabase(query: string, locale = "ar", limit = 12) {
  const cleanQ = (query || "").trim();
  if (cleanQ.length < 2) return [];

  const isAr = locale === "ar";
  const searchPattern = `%${cleanQ}%`;

  try {
    const sql = getSql();
    const [services, articles, projects] = await Promise.all([
      sql`
        SELECT id, slug, icon, name_ar, name_en, short_description_ar, short_description_en
        FROM services
        WHERE is_active = true AND (
          name_ar ILIKE ${searchPattern} OR
          name_en ILIKE ${searchPattern} OR
          short_description_ar ILIKE ${searchPattern} OR
          short_description_en ILIKE ${searchPattern}
        )
        LIMIT 6;
      `,
      sql`
        SELECT id, slug, title_ar, title_en, excerpt_ar, excerpt_en
        FROM articles
        WHERE status = 'published' AND (
          title_ar ILIKE ${searchPattern} OR
          title_en ILIKE ${searchPattern} OR
          excerpt_ar ILIKE ${searchPattern} OR
          excerpt_en ILIKE ${searchPattern}
        )
        LIMIT 6;
      `,
      sql`
        SELECT id, slug, title_ar, title_en, description_ar, description_en, city
        FROM projects
        WHERE is_active = true AND (
          title_ar ILIKE ${searchPattern} OR
          title_en ILIKE ${searchPattern} OR
          description_ar ILIKE ${searchPattern} OR
          city ILIKE ${searchPattern}
        )
        LIMIT 6;
      `,
    ]);

    const results = [
      ...services.map((s: any) => ({
        type: "service" as const,
        title: isAr ? s.name_ar : s.name_en || s.name_ar,
        title_ar: s.name_ar,
        title_en: s.name_en || s.name_ar,
        excerpt: isAr ? s.short_description_ar : s.short_description_en || s.short_description_ar,
        url: `/services/${s.slug}`,
        icon: s.icon,
      })),
      ...articles.map((a: any) => ({
        type: "article" as const,
        title: isAr ? a.title_ar : a.title_en || a.title_ar,
        title_ar: a.title_ar,
        title_en: a.title_en || a.title_ar,
        excerpt: isAr ? a.excerpt_ar : a.excerpt_en || a.excerpt_ar,
        url: `/blog/${a.slug}`,
        icon: null,
      })),
      ...projects.map((p: any) => ({
        type: "project" as const,
        title: isAr ? p.title_ar : p.title_en || p.title_ar,
        title_ar: p.title_ar,
        title_en: p.title_en || p.title_ar,
        excerpt: isAr ? p.description_ar : p.description_en || p.description_ar,
        url: `/projects/${p.slug}`,
        icon: null,
      })),
    ].slice(0, limit);

    return results;
  } catch (err) {
    console.warn("Database search error:", err);
    return [];
  }
}



