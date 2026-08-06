import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ArticleDetailPageContent } from "@/components/pages/ArticleDetailPageContent";

const VALID_SLUGS = [
  "types-of-tempered-glass", "aluminum-vs-upvc",
  "kitchen-design-trends-2024", "glass-facade-maintenance",
  "home-decoration-ideas", "contracting-guide-saudi",
];

export async function generateStaticParams() {
  return VALID_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const isAr = locale === "ar";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const title = isAr
    ? `مقال ${slug.replace("-", " ")} | مدونة WebTaky`
    : `${slug.replace("-", " ")} Article | WebTaky Blog`;

  return {
    title,
    description: isAr
      ? `اقرأ مقال ${slug.replace("-", " ")} واكتشف أفضل النصائح والمعلومات الهندسية والمعمارية`
      : `Read article ${slug.replace("-", " ")} and discover architectural tips and insights`,
    alternates: {
      canonical: `${appUrl}/${locale}/blog/${slug}`,
      languages: { ar: `${appUrl}/ar/blog/${slug}`, en: `${appUrl}/en/blog/${slug}` },
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const dict = await getDictionary(locale as Locale);

  return <ArticleDetailPageContent slug={slug} locale={locale as Locale} dict={dict} />;
}
