import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ProjectDetailPageContent } from "@/components/pages/ProjectDetailPageContent";
import { getProjectBySlug, getProjects } from "@/lib/actions/content";
import { getFallbackProjects } from "@/lib/fallback-provider";

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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://webtaky.com";

  const projectName = project ? (isAr ? project.name_ar : project.name_en) : slug.replace(/-/g, " ");
  const title = isAr
    ? `مشروع ${projectName} | WebTaky`
    : `Project ${projectName} | WebTaky`;
  const description = String(project?.description_ar || project?.description_en || (isAr
    ? `استعرض تفاصيل ومراحل تنفيذ مشروع ${projectName} من تنفيذ مؤسسة القوة العاشرة WebTaky`
    : `Explore execution stages and specs of project ${projectName} by WebTaky`));

  return {
    title,
    description,
    alternates: {
      canonical: `${appUrl}/${locale}/projects/${slug}`,
      languages: { ar: `${appUrl}/ar/projects/${slug}`, en: `${appUrl}/en/projects/${slug}` },
    },
    openGraph: { title, description, images: [String(project?.cover_image_url || "/images/defaults/projects/project-1.jpg")] },
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://webtaky.com";
  const isAr = validLocale === "ar";
  const projectName = project ? (isAr ? project.name_ar : project.name_en) : slug.replace(/-/g, " ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: projectName,
    description: project?.description_ar || project?.description_en || "",
    url: `${appUrl}/${validLocale}/projects/${slug}`,
    image: project?.cover_image_url || `${appUrl}/images/defaults/projects/project-1.jpg`,
    provider: {
      "@type": "Organization",
      name: "WebTaky - Tenth Power Contracting",
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
