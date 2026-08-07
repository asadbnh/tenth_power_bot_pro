import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const locale = (searchParams.get("locale") ?? "ar") as "ar" | "en";
  const isAr = locale === "ar";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50);

  if (query.length < 2) {
    return NextResponse.json({ results: [], query });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const [services, articles, projects] = await Promise.all([
    supabase
      .from("services")
      .select("id, slug, icon, name_ar, name_en, short_description_ar, short_description_en")
      .eq("is_active", true)
      .or(`name_ar.ilike.%${query}%,name_en.ilike.%${query}%,short_description_ar.ilike.%${query}%`)
      .limit(5),

    supabase
      .from("articles")
      .select("id, slug, title_ar, title_en, excerpt_ar, excerpt_en")
      .eq("status", "published")
      .or(`title_ar.ilike.%${query}%,title_en.ilike.%${query}%,excerpt_ar.ilike.%${query}%`)
      .limit(5),

    supabase
      .from("projects")
      .select("id, slug, title_ar, title_en, description_ar, description_en, city")
      .eq("is_active", true)
      .or(`title_ar.ilike.%${query}%,title_en.ilike.%${query}%,city.ilike.%${query}%`)
      .limit(5),
  ]);

  type ServiceRow = { slug: string; icon: string; name_ar: string; name_en: string; short_description_ar: string; short_description_en: string };
  type ArticleRow = { slug: string; title_ar: string; title_en: string; excerpt_ar: string; excerpt_en: string };
  type ProjectRow = { slug: string; title_ar: string; title_en: string; description_ar: string; description_en: string };

  const results = [
    ...((services.data as ServiceRow[]) ?? []).map((s) => ({
      type: "service",
      title: isAr ? s.name_ar : s.name_en || s.name_ar,
      excerpt: isAr ? s.short_description_ar : s.short_description_en || s.short_description_ar,
      url: `/${locale}/services/${s.slug}`,
      icon: s.icon,
    })),
    ...((articles.data as ArticleRow[]) ?? []).map((a) => ({
      type: "article",
      title: isAr ? a.title_ar : a.title_en || a.title_ar,
      excerpt: isAr ? a.excerpt_ar : a.excerpt_en || a.excerpt_ar,
      url: `/${locale}/blog/${a.slug}`,
      icon: null,
    })),
    ...((projects.data as ProjectRow[]) ?? []).map((p) => ({
      type: "project",
      title: isAr ? p.title_ar : p.title_en || p.title_ar,
      excerpt: isAr ? p.description_ar : p.description_en || p.description_ar,
      url: `/${locale}/projects/${p.slug}`,
      icon: null,
    })),
  ].slice(0, limit);

  return NextResponse.json(
    { results, query, total: results.length },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" } }
  );
}
