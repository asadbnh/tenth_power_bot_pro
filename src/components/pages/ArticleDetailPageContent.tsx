"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar, Clock, User, Share2, ArrowRight, ChevronLeft, BookOpen, Tag, Images, Eye,
  PhoneCall, MessageCircle
} from "lucide-react";
import { cn, formatWhatsAppUrl, formatTelUrl } from "@/lib/utils/cn";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { recordArticleView } from "@/lib/actions/content";

import { AnimatedCanvasBanner } from "@/components/ui/AnimatedCanvasBanner";
import { MarkdownContent } from "@/components/ui/MarkdownContent";

interface Props {
  slug: string;
  locale: Locale;
  dict: Dictionary;
  initialArticle?: any;
}

export function ArticleDetailPageContent({ slug, locale, dict, initialArticle }: Props) {
  const isRtl = locale === "ar";
  const defaultAuthor = isRtl ? "مؤسسة القوة العاشرة" : "Tenth Power Est.";

  const article = initialArticle || {
    slug,
    title_ar: isRtl ? "دليل معماريك في اختيار أفضل الخامات" : "Architectural Guide to Material Selection",
    title_en: "Architectural Guide to Material Selection",
    category_ar: isRtl ? "نصائح وإرشادات" : "Tips & Guides",
    category_en: "Tips & Guides",
    read_time_minutes: 5,
    published_at: "2026-08-01T10:00:00Z",
    author_ar: defaultAuthor,
    author_en: "Tenth Power Est.",
    view_count: 0,
    content_ar: "نقدم لكم في هذا المقال الشامل أحدث النصائح والتوصيات الهندسية لضمان اختيار الخامات والمواد المناسبة لمشروعك المعماري السكني أو التجاري.",
    content_en: "In this comprehensive article we share essential engineering guidance to ensure selecting the ideal materials for your project."
  };

  const title = isRtl ? (article.title_ar || article.title) : (article.title_en || article.title_ar || article.title);
  const category = isRtl ? (article.category_ar || article.tag_ar || article.category) : (article.category_en || article.tag_en || article.category_ar || article.category || (isRtl ? "مقالات" : "Articles"));
  const author = isRtl ? (article.author_ar || article.author || defaultAuthor) : (article.author_en || article.author_ar || article.author || defaultAuthor);
  const content = isRtl ? (article.content_ar || article.content) : (article.content_en || article.content_ar || article.content);
  const readTime = article.read_time_minutes || article.readTime || 5;
  const coverImage = article.cover_image_url || article.featured_image_url;
  const articleImages: { id: string; url: string; context: string | null }[] =
    (article.article_images as any[]) || [];

  // Parse real date and time from DB
  const rawDate = article.published_at || article.created_at;
  const dateObj = rawDate ? new Date(rawDate) : null;
  const isValidDate = dateObj && !isNaN(dateObj.getTime());

  // Date format matching user reference (e.g. ٢٠٢٦/٨/١ in Arabic or 2026/8/1)
  const dateStr = isValidDate
    ? (isRtl
        ? (() => {
            const nf = new Intl.NumberFormat("ar-SA-u-ca-gregory", { useGrouping: false });
            return `${nf.format(dateObj.getFullYear())}/${nf.format(dateObj.getMonth() + 1)}/${nf.format(dateObj.getDate())}`;
          })()
        : dateObj.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }))
    : (isRtl ? "٢٠٢٦/٨/١" : "2026-08-01");

  // Real time format e.g. 10:00 ص / 10:00 AM
  const timeStr = isValidDate
    ? dateObj.toLocaleTimeString(isRtl ? "ar-SA-u-ca-gregory" : "en-US", { hour: "2-digit", minute: "2-digit" })
    : "";

  // Dynamic live views count
  const [views, setViews] = useState<number>(Number(article.view_count || 0));

  useEffect(() => {
    if (article.id) {
      recordArticleView(article.id).then((updatedViews) => {
        if (typeof updatedViews === "number" && updatedViews > 0) {
          setViews(updatedViews);
        }
      }).catch(() => {});
    }
  }, [article.id]);

  const companyPhone = "+966532438253";
  const whatsappUrl = formatWhatsAppUrl(
    companyPhone,
    isRtl
      ? `السلام عليكم، قرأت مقال "${title}" وأرغب في استشارة هندسية / طلب عرض سعر.`
      : `Hello, I read the article "${title}" and would like an engineering consultation / quote.`
  );
  const telUrl = formatTelUrl(companyPhone);

  return (
    <div className="pt-[var(--header-height)] min-h-dvh bg-gradient-to-b from-background to-surface">
      {/* Architectural Article Header */}
      <section className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 bg-slate-50 dark:bg-[#070d1e] overflow-hidden text-slate-900 dark:text-white border-b border-slate-200/80 dark:border-amber-500/10 transition-colors duration-300">
        {/* Ambient Subtle Gold & Sapphire Backlight */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[16rem] bg-gradient-to-r from-amber-500/10 via-blue-600/10 to-amber-400/5 rounded-full blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(212,175,55,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.2) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/85 via-transparent to-slate-50 dark:from-[#070d1e]/85 dark:via-transparent dark:to-[#070d1e] transition-colors duration-300" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-5">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Link href={`/${locale}`} className="hover:text-slate-900 dark:hover:text-white transition-colors">{isRtl ? "الرئيسية" : "Home"}</Link>
            <ChevronLeft className={cn("w-3 h-3 text-slate-400 dark:text-slate-500", !isRtl && "rotate-180")} />
            <Link href={`/${locale}/blog`} className="hover:text-slate-900 dark:hover:text-white transition-colors">{dict.blog.title}</Link>
            <ChevronLeft className={cn("w-3 h-3 text-slate-400 dark:text-slate-500", !isRtl && "rotate-180")} />
            <span className="text-amber-700 dark:text-amber-400/90 font-semibold">{category}</span>
          </div>

          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-white/5 border border-amber-500/30 text-xs font-semibold text-amber-800 dark:text-amber-200 shadow-xs">
            <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            {category}
          </span>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {title}
          </h1>

          {/* Real Post Metadata: Author, Date, Time, Reading Time, Views Count */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-200/80 dark:border-white/10 font-medium">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <User className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{author}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{dateStr}</span>
            </div>
            {timeStr && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{timeStr}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{readTime} {isRtl ? "دقائق قراءة" : "min read"}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{views.toLocaleString(isRtl ? "ar-SA" : "en-US")} {isRtl ? "مشاهدة" : "views"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Architectural Article Canvas Banner with Interactive CTA Overlay */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border-light group">
          {coverImage ? (
            <img src={coverImage} alt={title} className="w-full h-80 sm:h-[420px] object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <AnimatedCanvasBanner 
              aspectRatio="wide"
              title={title}
              badge={category}
              icon={<BookOpen className="w-5 h-5" />}
            />
          )}

          {/* Floating Instagram-Style "Call now" Interactive Sticker */}
          <div className="absolute top-4 end-4 z-20">
            <a
              href={telUrl}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl border border-slate-200 dark:border-white/10 text-xs sm:text-sm font-bold text-slate-800 dark:text-white hover:scale-105 active:scale-95 transition-all group/btn"
              title={isRtl ? "اتصال مباشر الآن" : "Call Now"}
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sky-600 dark:text-sky-400 font-extrabold flex items-center gap-1">
                🔗 Call now
              </span>
              <span className="text-slate-400">|</span>
              <span>{isRtl ? "اتصل الآن" : "Call"}</span>
            </a>
          </div>

          {/* Subtle Gradient Shadow for bottom readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

          {/* Embedded Floating Flyer CTA Bar on the Banner */}
          <div className="absolute bottom-3 inset-x-3 sm:bottom-5 sm:inset-x-5 z-20 flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/15 text-white shadow-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <PhoneCall className="w-4 h-4 animate-bounce" />
              </div>
              <div className="text-xs sm:text-sm">
                <p className="font-bold text-white leading-tight">{isRtl ? "ترغب في تنفيذ هذا العمل لمشروعك؟" : "Want this done for your project?"}</p>
                <p className="text-slate-300 text-[11px] sm:text-xs">{isRtl ? "استشر مهندسينا فوراً واحصل على معاينة" : "Contact our engineers for instant consultation"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={telUrl}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs shadow-md transition-all active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                <span>{isRtl ? "اتصل الآن" : "Call Now"}</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{isRtl ? "واتساب مباشر" : "WhatsApp"}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Article Body with Global Markdown Formatting (Headings, Bold, Lists, Blockquotes, Dark/Light modes) */}
        <div className="py-2">
          <MarkdownContent content={content} isRtl={isRtl} />
        </div>

        {/* Article Tags from DB */}
        {article.tags && article.tags.length > 0 && (
          <div className="pt-6 border-t border-border-light space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
              <Tag className="w-3.5 h-3.5 text-accent-500" />
              <span>{isRtl ? "الوسوم والمواضيع ذات الصلة:" : "Related Tags & Topics:"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((t: any, idx: number) => {
                const tagLabel = isRtl ? (t.tag_ar || t.name) : (t.tag_en || t.tag_ar || t.name);
                return (
                  <Link
                    key={idx}
                    href={`/${locale}/search?q=${encodeURIComponent(tagLabel)}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-amber-500/10 border border-border-light hover:border-amber-500/30 text-xs font-semibold text-text-secondary hover:text-amber-600 dark:hover:text-amber-400 transition-all shadow-sm"
                  >
                    <span>#{tagLabel}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Article Images Gallery from article_images DB */}
        {articleImages.length > 0 && (
          <div className="pt-6 border-t border-border-light space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
              <Images className="w-3.5 h-3.5 text-accent-500" />
              <span>{isRtl ? `صور المقال (${articleImages.length}):` : `Article Photos (${articleImages.length}):`}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {articleImages.map((img) => (
                <div key={img.id} className="rounded-2xl overflow-hidden border border-border-light shadow-sm group">
                  <img
                    src={img.url}
                    alt={img.context || title}
                    className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {img.context && (
                    <p className="px-3 py-2 text-xs text-text-tertiary truncate">{img.context}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
