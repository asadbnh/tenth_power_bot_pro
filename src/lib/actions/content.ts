"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── Services ─────────────────────────────────────────────────────────

export async function getServices(locale = "ar") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data, error } = await supabase
    .from("services")
    .select(`id, slug, icon, sort_order, is_featured, is_active,
      service_translations!inner(locale, name, short_description, description)`)
    .eq("is_active", true)
    .eq("service_translations.locale", locale)
    .order("sort_order");
  if (error) console.error("getServices error:", error);
  return (data ?? []) as Record<string, unknown>[];
}

export async function getServiceBySlug(slug: string, locale = "ar") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data } = await supabase
    .from("services")
    .select(`id, slug, icon, is_featured,
      service_translations!inner(locale, name, short_description, description, meta_title, meta_description),
      projects(id, slug, project_translations(name, locale))`)
    .eq("slug", slug)
    .eq("service_translations.locale", locale)
    .single();
  return data ?? null;
}

// ─── Projects ─────────────────────────────────────────────────────────

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
  const limit = options?.limit ?? 12;
  const offset = ((options?.page ?? 1) - 1) * limit;

  let query = supabase
    .from("projects")
    .select(`id, slug, city, year_completed, is_featured, is_published,
      project_translations!inner(locale, name, short_description),
      services(slug)`, { count: "exact" })
    .eq("is_published", true)
    .eq("project_translations.locale", locale)
    .order("year_completed", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options?.city) query = query.eq("city", options.city);
  if (options?.serviceSlug) query = query.eq("services.slug", options.serviceSlug);

  const { data, count } = await query;
  return { data: (data ?? []) as Record<string, unknown>[], count: count ?? 0 };
}

// ─── Articles ─────────────────────────────────────────────────────────

export async function getArticles(options?: { locale?: string; limit?: number; page?: number }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const locale = options?.locale ?? "ar";
  const limit = options?.limit ?? 9;
  const offset = ((options?.page ?? 1) - 1) * limit;

  const { data, count } = await supabase
    .from("articles")
    .select(`id, slug, featured_image_url, reading_time_minutes, published_at, is_published,
      article_translations!inner(locale, title, excerpt, meta_title, meta_description)`,
      { count: "exact" })
    .eq("is_published", true)
    .eq("article_translations.locale", locale)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return { data: (data ?? []) as Record<string, unknown>[], count: count ?? 0 };
}

export async function getArticleBySlug(slug: string, locale = "ar") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data } = await supabase
    .from("articles")
    .select(`id, slug, featured_image_url, reading_time_minutes, published_at,
      article_translations!inner(locale, title, excerpt, content, meta_title, meta_description)`)
    .eq("slug", slug)
    .eq("article_translations.locale", locale)
    .single();

  if (data?.id) {
    supabase
      .rpc("increment_article_views", { article_id: data.id })
      .then(() => {})
      .catch(() => {});
  }
  return data ?? null;
}

// ─── Gallery ──────────────────────────────────────────────────────────

export async function getGalleryItems(options?: { serviceId?: string; limit?: number; page?: number }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const limit = options?.limit ?? 24;
  const offset = ((options?.page ?? 1) - 1) * limit;

  let query = supabase
    .from("gallery")
    .select("id, image_url, thumbnail_url, alt_ar, alt_en, sort_order, services(slug)", { count: "exact" })
    .eq("is_active", true)
    .order("sort_order")
    .range(offset, offset + limit - 1);

  if (options?.serviceId) query = query.eq("service_id", options.serviceId);

  const { data, count } = await query;
  return { data: (data ?? []) as Record<string, unknown>[], count: count ?? 0 };
}

// ─── Reviews ──────────────────────────────────────────────────────────

export async function getApprovedReviews(limit = 10) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data } = await supabase
    .from("customer_reviews")
    .select(`id, rating, content_ar, content_en, reviewer_name,
      reviewer_company_ar, reviewer_company_en, is_verified, created_at,
      services(slug, service_translations(name, locale))`)
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
  const isAr = data.locale === "ar";

  const { data: review, error } = await supabase
    .from("customer_reviews")
    .insert({
      rating: data.rating,
      ...(isAr ? { content_ar: data.content } : { content_en: data.content }),
      reviewer_name: data.reviewerName,
      ...(isAr ? { reviewer_company_ar: data.reviewerCompany } : { reviewer_company_en: data.reviewerCompany }),
      service_id: data.serviceId ?? null,
      is_approved: false,
      is_verified: false,
    })
    .select("id")
    .single();

  if (error) return { success: false };

  revalidatePath("/[locale]/testimonials", "page");
  return { success: true, id: (review as Record<string, unknown>)?.id };
}

// ─── FAQs ─────────────────────────────────────────────────────────────

export async function getFaqs(locale = "ar") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data } = await supabase
    .from("faqs")
    .select(`id, sort_order, is_active,
      faq_translations!inner(locale, question, answer)`)
    .eq("is_active", true)
    .eq("faq_translations.locale", locale)
    .order("sort_order");
  return (data ?? []) as Record<string, unknown>[];
}

// ─── Site Settings ────────────────────────────────────────────────────

export async function getSiteSettings() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", [
      "site_name_ar", "site_name_en", "phone", "whatsapp",
      "email", "address_ar", "address_en", "facebook", "instagram",
      "twitter", "youtube", "working_hours_ar", "working_hours_en",
    ]);
  return Object.fromEntries(
    (data as { key: string; value: string }[])?.map(({ key, value }) => [key, value]) ?? []
  );
}
