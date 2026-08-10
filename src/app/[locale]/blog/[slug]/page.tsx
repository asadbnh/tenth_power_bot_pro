import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ArticleDetailPageContent } from "@/components/pages/ArticleDetailPageContent";
import { getArticleBySlug, getArticles } from "@/lib/actions/content";
import { getFallbackArticles } from "@/lib/fallback-provider";

export async function generateStaticParams() {
  const { data: dbArticles } = await getArticles().catch(() => ({ data: [] }));
  if (dbArticles && dbArticles.length > 0) {
    return dbArticles.map((a) => ({ slug: String(a.slug) }));
  }
  return getFallbackArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const isAr = locale === "ar";
  const article = await getArticleBySlug(slug, locale).catch(() => null);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://powerof10.netlify.app";

  const titleText = article ? (isAr ? article.title_ar || article.title : article.title_en || article.title) : slug.replace(/-/g, " ");
  const title = isAr
    ? `${titleText} | مدونة WebTaky`
    : `${titleText} | WebTaky Blog`;
  const description = String(article?.excerpt_ar || article?.excerpt_en || article?.excerpt || (isAr
    ? `اقرأ مقال ${titleText} واكتشف أفضل النصائح والمعلومات الهندسية والمعمارية`
    : `Read article ${titleText} and discover architectural tips and insights`));

  return {
    title,
    description,
    alternates: {
      canonical: `${appUrl}/${locale}/blog/${slug}`,
      languages: { ar: `${appUrl}/ar/blog/${slug}`, en: `${appUrl}/en/blog/${slug}` },
    },
    openGraph: { title, description, images: [String(article?.cover_image_url || "/images/defaults/projects/project-1.webp")] },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const validLocale = locale as Locale;
  const dict = await getDictionary(validLocale);
  const article = await getArticleBySlug(slug, validLocale).catch(() => null);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://powerof10.netlify.app";
  const isAr = validLocale === "ar";
  const titleText = article ? (isAr ? article.title_ar || article.title : article.title_en || article.title) : slug.replace(/-/g, " ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: titleText,
    description: article?.excerpt_ar || article?.excerpt_en || "",
    url: `${appUrl}/${validLocale}/blog/${slug}`,
    image: article?.cover_image_url || `${appUrl}/images/defaults/projects/project-1.webp`,
    datePublished: article?.published_at || new Date().toISOString(),
    author: {
      "@type": "Person",
      name: isAr ? (article?.author_ar || "فريق القوة العاشرة") : (article?.author_en || "Tenth Power Team"),
    },
    publisher: {
      "@type": "Organization",
      name: "WebTaky",
      url: appUrl,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ArticleDetailPageContent slug={slug} locale={validLocale} dict={dict} initialArticle={article as any} />
    </>
  );
}
