"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const { data, error } = await supabase
    .from("services")
    .select(`
      id, slug, icon, sort_order, is_featured, is_active,
      name_ar, name_en, short_description_ar, short_description_en,
      full_description_ar, full_description_en, price_from, price_to, cover_image_url
    `)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) console.error("getServices DB query error:", error);

  return ((data ?? []) as Record<string, unknown>[]).map((s) => ({
    ...s,
    name: isAr ? s.name_ar : s.name_en || s.name_ar,
    short_description: isAr ? s.short_description_ar : s.short_description_en || s.short_description_ar,
    description: isAr ? s.full_description_ar : s.full_description_en || s.full_description_ar,
  }));
}

export async function getServiceBySlug(slug: string, locale = "ar") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const isAr = locale === "ar";

  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!service) return null;

  // Fetch associated projects
  const { data: projects } = await supabase
    .from("projects")
    .select("id, slug, title_ar, title_en")
    .eq("service_id", service.id)
    .eq("is_active", true)
    .limit(6);

  return {
    ...service,
    name: isAr ? service.name_ar : service.name_en || service.name_ar,
    short_description: isAr ? service.short_description_ar : service.short_description_en || service.short_description_ar,
    description: isAr ? service.full_description_ar : service.full_description_en || service.full_description_ar,
    projects: (projects ?? []).map((p: Record<string, unknown>) => ({
      id: p.id,
      slug: p.slug,
      name: isAr ? p.title_ar : p.title_en || p.title_ar,
    })),
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

  const normalized = ((data ?? []) as Record<string, unknown>[]).map((p) => ({
    ...p,
    name: isAr ? p.title_ar : p.title_en || p.title_ar,
    short_description: isAr ? p.description_ar : p.description_en || p.description_ar,
  }));

  return { data: normalized, count: count ?? 0 };
}

// ─── Articles Actions ──────────────────────────────────────────────────

export async function getArticles(options?: { locale?: string; limit?: number; page?: number }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const locale = options?.locale ?? "ar";
  const isAr = locale === "ar";
  const limit = options?.limit ?? 9;
  const offset = ((options?.page ?? 1) - 1) * limit;

  const { data, count } = await supabase
    .from("articles")
    .select(`
      id, slug, cover_image_url, read_time_minutes, published_at, status, is_featured, view_count,
      title_ar, title_en, excerpt_ar, excerpt_en, content_ar, content_en
    `, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const normalized = ((data ?? []) as Record<string, unknown>[]).map((a) => ({
    ...a,
    title: isAr ? a.title_ar : a.title_en || a.title_ar,
    excerpt: isAr ? a.excerpt_ar : a.excerpt_en || a.excerpt_ar,
    featured_image_url: a.cover_image_url,
  }));

  return { data: normalized, count: count ?? 0 };
}

export async function getArticleBySlug(slug: string, locale = "ar") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const isAr = locale === "ar";

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!article) return null;

  // Increment view count asynchronously
  supabase.from("articles").update({ view_count: (article.view_count || 0) + 1 }).eq("id", article.id).then();

  return {
    ...article,
    title: isAr ? article.title_ar : article.title_en || article.title_ar,
    excerpt: isAr ? article.excerpt_ar : article.excerpt_en || article.excerpt_ar,
    content: isAr ? article.content_ar : article.content_en || article.content_ar,
    featured_image_url: article.cover_image_url,
  };
}

// ─── Gallery Actions ──────────────────────────────────────────────────

export async function getGalleryItems(options?: { serviceId?: string; limit?: number; page?: number }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const limit = options?.limit ?? 24;
  const offset = ((options?.page ?? 1) - 1) * limit;

  const { data, count } = await supabase
    .from("gallery_items")
    .select("id, album_id, type, sort_order, media_library(file_url, cdn_url)", { count: "exact" })
    .order("sort_order", { ascending: true })
    .range(offset, offset + limit - 1);

  const items = ((data ?? []) as Record<string, unknown>[]).map((g) => {
    const media = g.media_library as { file_url?: string; cdn_url?: string } | null;
    return {
      id: g.id,
      image_url: media?.cdn_url || media?.file_url || "/images/placeholder.jpg",
      thumbnail_url: media?.cdn_url || media?.file_url || "/images/placeholder.jpg",
    };
  });

  return { data: items, count: count ?? 0 };
}

// ─── Customer Reviews Actions ─────────────────────────────────────────

export async function getApprovedReviews(limit = 10) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const { data } = await supabase
    .from("customer_reviews")
    .select(`
      id, rating, content_ar, content_en, reviewer_name,
      is_verified, created_at, services(slug)
    `)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as Record<string, unknown>[];
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

  const { data } = await supabase
    .from("faqs")
    .select("id, question_ar, question_en, answer_ar, answer_en, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return ((data ?? []) as Record<string, unknown>[]).map((f) => ({
    id: f.id,
    question: isAr ? f.question_ar : f.question_en || f.question_ar,
    answer: isAr ? f.answer_ar : f.answer_en || f.answer_ar,
  }));
}

// ─── Site & Company Settings Actions ──────────────────────────────────

export async function getSiteSettings() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  let company: Record<string, unknown> | null = null;
  try {
    const { data } = await supabase.from("companies").select("*").limit(1).single();
    company = data;
  } catch {
    company = null;
  }

  return {
    site_name_ar: company?.name_ar || "مؤسسة ويب تكي للمقاولات والزجاج",
    site_name_en: company?.name_en || "WebTaky Enterprise",
    phone: company?.phone_primary || "+966500000000",
    whatsapp: company?.whatsapp_number || "+966500000000",
    email: company?.email || "info@webtaky.com",
    tax_number: company?.tax_number || "",
    commercial_register: company?.commercial_register || "",
  };
}

// ─── City Pages Actions ────────────────────────────────────────────────

export async function getCityPagesList(locale = "ar") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const isAr = locale === "ar";

  const { data } = await supabase
    .from("city_pages")
    .select("id, slug, city_name_ar, city_name_en, region_ar, region_en, hero_image_url, is_active")
    .eq("is_active", true);

  return ((data ?? []) as Record<string, unknown>[]).map((c) => ({
    ...c,
    cityName: isAr ? c.city_name_ar : c.city_name_en || c.city_name_ar,
    regionName: isAr ? c.region_ar : c.region_en || c.region_ar,
  }));
}

export async function getCityPageBySlug(slug: string, locale = "ar") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const isAr = locale === "ar";

  const { data: cityPage } = await supabase
    .from("city_pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!cityPage) return null;

  // Fetch available city services
  const { data: cityServices } = await supabase
    .from("city_services")
    .select("service_id, unique_content_ar, unique_content_en, local_keywords_ar, services(slug, name_ar, name_en, cover_image_url)")
    .eq("city_page_id", cityPage.id);

  return {
    ...cityPage,
    cityName: isAr ? cityPage.city_name_ar : cityPage.city_name_en || cityPage.city_name_ar,
    regionName: isAr ? cityPage.region_ar : cityPage.region_en || cityPage.region_ar,
    description: isAr ? cityPage.description_ar : cityPage.description_en || cityPage.description_ar,
    services: ((cityServices ?? []) as Record<string, unknown>[]).map((cs) => {
      const s = cs.services as Record<string, unknown> | null;
      return {
        slug: s?.slug,
        name: isAr ? s?.name_ar : s?.name_en || s?.name_ar,
        image_url: s?.cover_image_url,
      };
    }),
  };
}

export async function getCityServicePageBySlug(citySlug: string, serviceSlug: string, locale = "ar") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const isAr = locale === "ar";

  const { data: cityPage } = await supabase
    .from("city_pages")
    .select("*")
    .eq("slug", citySlug)
    .eq("is_active", true)
    .single();

  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("slug", serviceSlug)
    .eq("is_active", true)
    .single();

  if (!cityPage || !service) return null;

  // Fetch specific city-service custom content if configured
  const { data: cityService } = await supabase
    .from("city_services")
    .select("unique_content_ar, unique_content_en, local_keywords_ar, local_keywords_en")
    .eq("city_page_id", cityPage.id)
    .eq("service_id", service.id)
    .single();

  const customContent = isAr ? cityService?.unique_content_ar : cityService?.unique_content_en;

  return {
    city: cityPage,
    service,
    cityName: isAr ? cityPage.city_name_ar : cityPage.city_name_en || cityPage.city_name_ar,
    serviceName: isAr ? service.name_ar : service.name_en || service.name_ar,
    regionName: isAr ? cityPage.region_ar : cityPage.region_en || cityPage.region_ar,
    customContent: customContent || service.full_description_ar,
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

