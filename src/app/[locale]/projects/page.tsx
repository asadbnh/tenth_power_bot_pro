import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getProjects } from "@/lib/actions/content";
import { ProjectsPageContent } from "@/components/pages/ProjectsPageContent";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://powerof10.netlify.app";
  const ogImage = `${appUrl}/images/restored/projects/project-1.webp`;
  const title = dict.projects.title;
  const description = dict.projects.subtitle;

  return {
    title,
    description,
    alternates: { canonical: `${appUrl}/${locale}/projects`, languages: { ar: `${appUrl}/ar/projects`, en: `${appUrl}/en/projects` } },
    openGraph: {
      title: `${title} | ${dict.meta.siteName}`,
      description,
      url: `${appUrl}/${locale}/projects`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/webp",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${dict.meta.siteName}`,
      description,
      images: [ogImage],
    },
  };
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = locale as Locale;
  const dict = await getDictionary(validLocale);
  const { data: dbProjects } = await getProjects({ locale: validLocale }).catch(() => ({ data: [] }));

  return <ProjectsPageContent locale={validLocale} dict={dict} initialProjects={dbProjects as any[]} />;
}
