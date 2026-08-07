"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Tag, ArrowRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface Props {
  locale: Locale;
  dict: Dictionary;
  initialArticles?: any[];
}

const DEFAULT_ARTICLES = [
  {
    id: 1, slug: "types-of-tempered-glass",
    title_ar: "دليل شامل: أنواع الزجاج السكريت وكيفية اختيار الأفضل لمشروعك",
    title_en: "Complete Guide: Types of Tempered Glass and How to Choose the Best for Your Project",
    excerpt_ar: "تعرف على الفروق الدقيقة بين أنواع الزجاج المقوى وكيف تؤثر على السلامة والجمالية والتكلفة في مشاريع البناء الحديثة.",
    excerpt_en: "Learn the subtle differences between types of tempered glass and how they affect safety, aesthetics, and cost in modern construction projects.",
    tag_ar: "زجاج", tag_en: "Glass", readTime: 5, cover_image_url: "/images/defaults/projects/project-1.jpg",
  },
  {
    id: 2, slug: "aluminum-vs-upvc",
    title_ar: "الألمنيوم مقابل UPVC: أيهما أفضل لنوافذ منزلك؟",
    title_en: "Aluminum vs UPVC: Which is Better for Your Home Windows?",
    excerpt_ar: "مقارنة تفصيلية بين نظامي الألمنيوم والـ UPVC في العزل والمتانة والسعر لمساعدتك على اتخاذ القرار الصحيح.",
    excerpt_en: "A detailed comparison between aluminum and UPVC systems in insulation, durability, and price to help you make the right decision.",
    tag_ar: "ألمنيوم", tag_en: "Aluminum", readTime: 7, cover_image_url: "/images/defaults/projects/project-1.jpg",
  },
  {
    id: 3, slug: "kitchen-design-trends-2024",
    title_ar: "أبرز ترندات تصميم المطابخ لعام 2024",
    title_en: "Top Kitchen Design Trends of 2024",
    excerpt_ar: "اكتشف أحدث صيحات تصميم المطابخ التي تجمع بين الأناقة والوظيفة العملية لإنشاء مطبخ أحلامك.",
    excerpt_en: "Discover the latest kitchen design trends that combine elegance and practicality to create your dream kitchen.",
    tag_ar: "مطابخ", tag_en: "Kitchens", readTime: 6, cover_image_url: "/images/defaults/projects/project-1.jpg",
  },
];

export function BlogPageContent({ locale, dict, initialArticles }: Props) {
  const isRtl = locale === "ar";
  const articles = (initialArticles && initialArticles.length > 0) ? initialArticles : DEFAULT_ARTICLES;
  const [featured, ...rest] = articles;

  return (
    <div className="pt-[var(--header-height)]">
      {/* Hero */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-br from-primary-950 via-[#0c1445] to-primary-900 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-sm font-semibold text-primary-300 uppercase tracking-widest mb-3">{dict.blog.title}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            {isRtl ? "مقالات ونصائح متخصصة" : "Expert Articles & Tips"}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-lg text-white/60">{dict.blog.subtitle}</motion.p>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured Article */}
          {featured && (
            <motion.article initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="group relative rounded-3xl overflow-hidden border border-border-light hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-2xl transition-all duration-300 mb-10 bg-surface-elevated">
              <div className="grid md:grid-cols-5">
                <div className="md:col-span-2 h-56 md:h-auto relative overflow-hidden bg-surface">
                  <img src={featured.cover_image_url || featured.featured_image_url || "/images/defaults/projects/project-1.jpg"} alt={featured.title || featured.title_ar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="md:col-span-3 p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-semibold">
                      {isRtl ? "مقال مميز" : "Featured"}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-tertiary">
                      <Clock className="w-3.5 h-3.5" />
                      {featured.read_time_minutes || featured.readTime || 5} {dict.blog.readTime}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
                    {featured.title || (isRtl ? featured.title_ar : featured.title_en) || featured.title_ar}
                  </h2>
                  <p className="text-text-secondary text-sm leading-relaxed mb-5">
                    {featured.excerpt || (isRtl ? featured.excerpt_ar : featured.excerpt_en) || featured.excerpt_ar}
                  </p>
                  <Link href={`/${locale}/blog/${featured.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {dict.blog.readMore}
                    <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
                  </Link>
                </div>
              </div>
            </motion.article>
          )}

          {/* Rest of Articles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((article, i) => {
              const title = article.title || (isRtl ? article.title_ar : article.title_en) || article.title_ar;
              const excerpt = article.excerpt || (isRtl ? article.excerpt_ar : article.excerpt_en) || article.excerpt_ar;
              const coverImg = article.cover_image_url || article.featured_image_url || "/images/defaults/projects/project-1.jpg";

              return (
                <motion.article key={article.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                  className="group rounded-2xl overflow-hidden border border-border-light hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-xl transition-all duration-300 bg-surface-elevated">
                  <div className="h-44 relative overflow-hidden bg-surface">
                    <img src={coverImg} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center gap-1 text-xs text-text-tertiary">
                        <Tag className="w-3.5 h-3.5" />
                        {isRtl ? (article.tag_ar || "مقالات") : (article.tag_en || "Articles")}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-text-tertiary">
                        <Clock className="w-3.5 h-3.5" />
                        {article.read_time_minutes || article.readTime || 5} {dict.blog.readTime}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base leading-snug mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                      {title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mb-4">
                      {excerpt}
                    </p>
                    <Link href={`/${locale}/blog/${article.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400">
                      <BookOpen className="w-3.5 h-3.5" />
                      {dict.blog.readMore}
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
