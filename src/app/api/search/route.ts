import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const locale = (searchParams.get("locale") ?? "ar") as "ar" | "en";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50);

  if (query.length < 2) {
    return NextResponse.json({ results: [], query });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const [services, articles, projects] = await Promise.all([
    supabase
      .from("service_translations")
      .select("locale, name, short_description, services!inner(slug, icon)")
      .eq("locale", locale)
      .textSearch("name", query, { type: "websearch" })
      .limit(5),
    supabase
      .from("article_translations")
      .select("locale, title, excerpt, articles!inner(slug, published_at)")
      .eq("locale", locale)
      .eq("articles.is_published", true)
      .textSearch("title", query, { type: "websearch" })
      .limit(5),
    supabase
      .from("project_translations")
      .select("locale, name, short_description, projects!inner(slug, city)")
      .eq("locale", locale)
      .eq("projects.is_published", true)
      .textSearch("name", query, { type: "websearch" })
      .limit(5),
  ]);

  type ServiceRow = { name: string; short_description: string; services: { slug: string; icon: string } };
  type ArticleRow = { title: string; excerpt: string; articles: { slug: string } };
  type ProjectRow = { name: string; short_description: string; projects: { slug: string } };

  const results = [
    ...((services.data as ServiceRow[]) ?? []).map((s) => ({
      type: "service", title: s.name, excerpt: s.short_description,
      url: `/${locale}/services/${s.services.slug}`, icon: s.services.icon,
    })),
    ...((articles.data as ArticleRow[]) ?? []).map((a) => ({
      type: "article", title: a.title, excerpt: a.excerpt,
      url: `/${locale}/blog/${a.articles.slug}`, icon: null,
    })),
    ...((projects.data as ProjectRow[]) ?? []).map((p) => ({
      type: "project", title: p.name, excerpt: p.short_description,
      url: `/${locale}/projects/${p.projects.slug}`, icon: null,
    })),
  ].slice(0, limit);

  return NextResponse.json(
    { results, query, total: results.length },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" } }
  );
}
