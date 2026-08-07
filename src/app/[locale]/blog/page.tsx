import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { BlogPageContent } from "@/components/pages/BlogPageContent";
import { getArticles } from "@/lib/actions/content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    title: dict.blog.title,
    description: dict.blog.subtitle,
    alternates: { canonical: `${appUrl}/${locale}/blog`, languages: { ar: `${appUrl}/ar/blog`, en: `${appUrl}/en/blog` } },
  };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = locale as Locale;
  const dict = await getDictionary(validLocale);
  const { data: articles } = await getArticles({ locale: validLocale }).catch(() => ({ data: [] }));

  return <BlogPageContent locale={validLocale} dict={dict} initialArticles={articles} />;
}
