"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { SmartFallbackImage } from "@/components/ui/SmartFallbackImage";
import { PageHeroBackground } from "@/components/ui/PageHeroBackground";

interface Props {
  locale: Locale;
  dict: Dictionary;
  initialArticles?: any[];
}

export function BlogPageContent({ locale, dict, initialArticles }: Props) {
  const isRtl = locale === "ar";
  const articles = (initialArticles && initialArticles.length > 0) ? initialArticles : [];
  const [featured, ...rest] = articles;

  return (
    <div className="pt-[var(--header-height)]">
      {/* Cinematic Blog Hero */}
      <section className="relative py-20 sm:py-28 bg-[#090e1a] overflow-hidden">
        {/* Ambient Editorial Illumination */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageHeroBackground pageKey="blog" />
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[22rem] bg-gradient-to-r from-amber-500/15 via-indigo-600/15 to-amber-400/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#090e1a]/80 via-transparent to-[#090e1a]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full royal-badge shadow-xl backdrop-blur-xl border border-amber-500/30">
            <span className="text-xs sm:text-sm font-bold text-amber-300">
              {isRtl ? "📚 المركز المعرفي والهندسي" : "📚 Engineering & Architectural Knowledge Hub"}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
            className="text-4xl sm:text-6xl font-extrabold text-white leading-tight">
            {isRtl ? (
              <>
                مقالات ودراسات{" "}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                  هندسية متخصصة
                </span>
              </>
            ) : (
              <>
                Specialized Engineering{" "}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                  Articles & Insights
                </span>
              </>
            )}
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.7 }}
            className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {dict.blog.subtitle || (isRtl
              ? "اكتشف أحدث المقالات والدراسات الفنية المتعلقة بأنواع الزجاج المقوى (Securit)، قطاعات الألمنيوم المعزولة حرارياً، وأفضل ممارسات البناء الحديث."
              : "Discover technical insights, tempered glass standards, thermal-break aluminum comparisons, and modern architectural trends.")}
          </motion.p>
        </div>
      </section>

      {/* Articles */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Featured Article */}
          {featured && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl overflow-hidden border border-border-light bg-surface-elevated hover:shadow-2xl transition-all duration-300 grid md:grid-cols-2">
              <div className="h-64 md:h-auto bg-surface relative overflow-hidden">
                <SmartFallbackImage 
                  src={featured.cover_image_url || featured.featured_image_url} 
                  alt={isRtl ? featured.title_ar || featured.title : featured.title_en || featured.title}
                  aspectRatio="auto"
                  title={isRtl ? featured.title_ar || featured.title : featured.title_en || featured.title}
                  badge={isRtl ? (featured.category_ar || "مقال مميز") : (featured.category_en || "Featured")}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-bold">
                      {isRtl ? (featured.category_ar || featured.tag_ar || "مقال مميز") : (featured.category_en || featured.tag_en || "Featured")}
                    </span>
                    <span className="flex items-center gap-1 text-text-tertiary">
                      <Clock className="w-3.5 h-3.5" />
                      {featured.read_time_minutes || featured.readTime || 5} {isRtl ? "دقائق قراءة" : "min read"}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary leading-snug">
                    {isRtl ? (featured.title_ar || featured.title) : (featured.title_en || featured.title)}
                  </h2>

                  <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
                    {isRtl ? (featured.excerpt_ar || featured.excerpt) : (featured.excerpt_en || featured.excerpt)}
                  </p>
                </div>

                <Link href={`/${locale}/blog/${featured.slug}`}
                  className="inline-flex items-center gap-2 font-bold text-primary-600 dark:text-primary-400 hover:gap-3 transition-all text-sm">
                  <span>{dict.blog.readMore}</span>
                  <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Rest Grid */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rest.map((article, i) => {
                const title = isRtl ? (article.title_ar || article.title) : (article.title_en || article.title);
                const excerpt = isRtl ? (article.excerpt_ar || article.excerpt) : (article.excerpt_en || article.excerpt);
                const tag = isRtl ? (article.category_ar || article.tag_ar || "مقال") : (article.category_en || article.tag_en || "Article");
                const readTime = article.read_time_minutes || article.readTime || 5;
                const cover = article.cover_image_url || article.featured_image_url;

                return (
                  <motion.article key={article.id || article.slug || i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="rounded-3xl overflow-hidden border border-border-light bg-surface-elevated hover:shadow-xl transition-all duration-300 flex flex-col justify-between">

                    <Link href={`/${locale}/blog/${article.slug}`} className="block">
                      <div className="h-48 bg-surface relative overflow-hidden">
                        <SmartFallbackImage 
                          src={cover}
                          alt={title}
                          aspectRatio="auto"
                          title={title}
                          badge={tag}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>

                      <div className="p-6 space-y-3">
                        <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{readTime} {isRtl ? "دقائق" : "min"}</span>
                        </div>

                        <h3 className="font-extrabold text-base text-text-primary line-clamp-2 leading-snug">
                          {title}
                        </h3>

                        <p className="text-text-secondary text-xs leading-relaxed line-clamp-3">
                          {excerpt}
                        </p>
                      </div>
                    </Link>

                    <div className="px-6 pb-6 pt-2">
                      <Link href={`/${locale}/blog/${article.slug}`}
                        className="inline-flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 hover:gap-3 transition-all">
                        <span>{dict.blog.readMore}</span>
                        <ArrowRight className={cn("w-3.5 h-3.5", isRtl && "rotate-180")} />
                      </Link>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
