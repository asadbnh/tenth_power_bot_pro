"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { AnimatedCanvasBanner } from "@/components/ui/AnimatedCanvasBanner";

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
            className="text-lg text-white/60 max-w-2xl mx-auto">{dict.blog.subtitle}</motion.p>
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
                {featured.cover_image_url || featured.featured_image_url ? (
                  <img 
                    src={featured.cover_image_url || featured.featured_image_url} 
                    alt={isRtl ? featured.title_ar || featured.title : featured.title_en || featured.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <AnimatedCanvasBanner 
                    aspectRatio="auto"
                    title={isRtl ? featured.title_ar || featured.title : featured.title_en || featured.title}
                    badge={isRtl ? (featured.category_ar || "مقال مميز") : (featured.category_en || "Featured")}
                  />
                )}
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
                        {cover ? (
                          <>
                            <img src={cover} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <span className="absolute top-3 end-3 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-medium backdrop-blur-sm">
                              {tag}
                            </span>
                          </>
                        ) : (
                          <AnimatedCanvasBanner 
                            aspectRatio="auto"
                            title={title}
                            badge={tag}
                          />
                        )}
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
