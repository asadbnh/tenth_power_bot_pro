import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ProjectsPageContent } from "@/components/pages/ProjectsPageContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    title: dict.projects.title,
    description: dict.projects.subtitle,
    alternates: { canonical: `${appUrl}/${locale}/projects`, languages: { ar: `${appUrl}/ar/projects`, en: `${appUrl}/en/projects` } },
  };
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return <ProjectsPageContent locale={locale as Locale} dict={dict} />;
}
