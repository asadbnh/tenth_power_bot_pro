import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getProjects } from "@/lib/actions/content";
import { ProjectsPageContent } from "@/components/pages/ProjectsPageContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://powerof10.netlify.app";
  return {
    title: dict.projects.title,
    description: dict.projects.subtitle,
    alternates: { canonical: `${appUrl}/${locale}/projects`, languages: { ar: `${appUrl}/ar/projects`, en: `${appUrl}/en/projects` } },
  };
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = locale as Locale;
  const dict = await getDictionary(validLocale);
  const { data: dbProjects } = await getProjects({ locale: validLocale }).catch(() => ({ data: [] }));

  return <ProjectsPageContent locale={validLocale} dict={dict} initialProjects={dbProjects as any[]} />;
}
