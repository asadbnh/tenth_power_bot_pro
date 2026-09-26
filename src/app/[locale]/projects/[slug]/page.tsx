import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ProjectDetailPageContent } from "@/components/pages/ProjectDetailPageContent";
import { getProjectBySlug, getProjects, getSeoMetadata } from "@/lib/actions/content";
import { getFallbackProjects } from "@/lib/fallback-provider";

export const revalidate = 60;

export async function generateStaticParams() {
  const { data: dbProjects } = await getProjects().catch(() => ({ data: [] }));
  if (dbProjects && dbProjects.length > 0) {
    return dbProjects.map((p) => ({ slug: String(p.slug) }));
  }
  return getFallbackProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const isAr = locale === "ar";
  const project = await getProjectBySlug(slug, locale).catch(() => null);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://powerof10.netlify.app";

  const projectName = project ? (isAr ? project.name_ar : project.name_en) : slug.replace(/-/g, " ");
  const defaultTitle = isAr
    ? `مشروع ${projectName} | tenth-power-glass`
    : `Project ${projectName} | tenth-power-glass`;
  const defaultDescription = String(project?.description_ar || project?.description_en || (isAr
    ? `استعرض تفاصيل ومراحل تنفيذ مشروع ${projectName} من تنفيذ مؤسسة القوة العاشرة tenth-power-glass`
    : `Explore execution stages and specs of project ${projectName} by tenth-power-glass`));
  const defaultImage = String(project?.cover_image_url || "/images/defaults/projects/project-1.webp");

  // ─── Try to override with seo_metadata from DB ─────────────────────────────
  let seoMeta: Record<string, unknown> | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projectId = (project as any)?.id;
  if (projectId) {
    seoMeta = await getSeoMetadata("project", String(projectId), locale).catch(() => null);
  }

  const title = String(seoMeta?.meta_title || defaultTitle);
  const description = String(seoMeta?.meta_description || defaultDescription);
  const ogImage = String(seoMeta?.og_image_url || defaultImage);

  return {
    title,
    description,
    alternates: {
      canonical: String(seoMeta?.canonical_url || `${appUrl}/${locale}/projects/${slug}`),
      languages: { ar: `${appUrl}/ar/projects/${slug}`, en: `${appUrl}/en/projects/${slug}` },
    },
    openGraph: {
      title: String(seoMeta?.og_title || title),
      description: String(seoMeta?.og_description || description),
      images: [ogImage],
      type: (seoMeta?.og_type as any) || "website",
    },
    twitter: {
      card: (seoMeta?.twitter_card as any) || "summary_large_image",
      title: String(seoMeta?.twitter_title || title),
      description: String(seoMeta?.twitter_description || description),
      images: [String(seoMeta?.twitter_image_url || ogImage)],
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const validLocale = locale as Locale;
  const dict = await getDictionary(validLocale);
  const project = await getProjectBySlug(slug, validLocale).catch(() => null);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://powerof10.netlify.app";
  const isAr = validLocale === "ar";
  const projectName = project ? (isAr ? project.name_ar : project.name_en) : slug.replace(/-/g, " ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: projectName,
    description: project?.description_ar || project?.description_en || "",
    url: `${appUrl}/${validLocale}/projects/${slug}`,
    image: project?.cover_image_url || `${appUrl}/images/defaults/projects/project-1.webp`,
    provider: {
      "@type": "Organization",
      name: "tenth-power-glass - Tenth Power Contracting",
      url: appUrl,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProjectDetailPageContent slug={slug} locale={validLocale} dict={dict} initialProject={project as any} />
    </>
  );
}
