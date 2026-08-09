"use client";

import Link from "next/link";
import {
  Calendar, Clock, User, Share2, ArrowRight, ChevronLeft, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

import { AnimatedCanvasBanner } from "@/components/ui/AnimatedCanvasBanner";

interface Props {
  slug: string;
  locale: Locale;
  dict: Dictionary;
  initialArticle?: any;
}

export function ArticleDetailPageContent({ slug, locale, dict, initialArticle }: Props) {
  const isRtl = locale === "ar";
  const article = initialArticle || {
    slug,
    title_ar: isRtl ? "دليل معماريك في اختيار أفضل الخامات" : "Architectural Guide to Material Selection",
    title_en: "Architectural Guide to Material Selection",
    category_ar: isRtl ? "نصائح وإرشادات" : "Tips & Guides",
    category_en: "Tips & Guides",
    read_time_minutes: 5,
    published_at: "2026-08-01",
    author_ar: isRtl ? "فريق القوة العاشرة" : "Tenth Power Team",
    author_en: "Tenth Power Team",
    content_ar: "نقدم لكم في هذا المقال الشامل أحدث النصائح والتوصيات الهندسية لضمان اختيار الخامات والمواد المناسبة لمشروعك المعماري السكني أو التجاري.",
    content_en: "In this comprehensive article we share essential engineering guidance to ensure selecting the ideal materials for your project."
  };

  const title = isRtl ? (article.title_ar || article.title) : (article.title_en || article.title_ar || article.title);
  const category = isRtl ? (article.category_ar || article.tag_ar || article.category) : (article.category_en || article.tag_en || article.category_ar || article.category || "مقالات");
  const author = isRtl ? (article.author_ar || article.author || "م. فريق الهندسة") : (article.author_en || article.author_ar || article.author || "Engineering Team");
  const content = isRtl ? (article.content_ar || article.content) : (article.content_en || article.content_ar || article.content);
  const readTime = article.read_time_minutes || article.readTime || 5;
  const date = article.published_at ? new Date(article.published_at).toLocaleDateString(isRtl ? "ar-SA" : "en-US") : "2026";
  const coverImage = article.cover_image_url || article.featured_image_url;

  return (
    <div className="pt-[var(--header-height)] min-h-dvh bg-gradient-to-b from-background to-surface">
      {/* Header */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-br from-primary-950 via-[#0c1445] to-primary-900 overflow-hidden text-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">{isRtl ? "الرئيسية" : "Home"}</Link>
            <ChevronLeft className={cn("w-3 h-3", !isRtl && "rotate-180")} />
            <Link href={`/${locale}/blog`} className="hover:text-white transition-colors">{dict.blog.title}</Link>
            <ChevronLeft className={cn("w-3 h-3", !isRtl && "rotate-180")} />
            <span className="text-white font-medium">{category}</span>
          </div>

          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-primary-200">
            <BookOpen className="w-3.5 h-3.5" />
            {category}
          </span>

          <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight">
            {title}
          </h1>

          <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm text-white/70 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-accent-400" />
              <span>{author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-400" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-400" />
              <span>{readTime} {isRtl ? "دقائق" : "min"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Architectural Article Canvas Banner */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-border-light">
          {coverImage ? (
            <img src={coverImage} alt={title} className="w-full h-80 object-cover" />
          ) : (
            <AnimatedCanvasBanner 
              aspectRatio="wide"
              title={title}
              badge={category}
              icon={<BookOpen className="w-5 h-5" />}
            />
          )}
        </div>
        <div className="prose prose-lg dark:prose-invert max-w-none text-text-secondary leading-relaxed whitespace-pre-line">
          {content}
        </div>

        {/* Share & CTA */}
        <div className="mt-16 pt-8 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href={`/${locale}/quote`}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 active:scale-95 transition-all">
            {isRtl ? "هل لديك استفسار؟ اطلب استشارة" : "Have Questions? Request Consultation"}
            <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
          </Link>

          <button onClick={() => { if (typeof window !== "undefined" && navigator.share) navigator.share({ title, url: window.location.href }); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-light hover:bg-surface text-sm font-medium transition-colors text-text-secondary">
            <Share2 className="w-4 h-4" />
            {isRtl ? "مشاركة المقال" : "Share Article"}
          </button>
        </div>
      </article>
    </div>
  );
}
