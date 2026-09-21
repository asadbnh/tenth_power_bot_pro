"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, ArrowRight, BookOpen, ChevronLeft, ShieldCheck, CheckCircle2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { SmartFallbackImage } from "@/components/ui/SmartFallbackImage";
import { PageHeroBackground } from "@/components/ui/PageHeroBackground";
import { SkeletonArticleCard } from "@/components/ui/Skeleton";

interface Props {
  locale: Locale;
  dict: Dictionary;
  initialArticles?: any[];
}

export function BlogPageContent({ locale, dict, initialArticles }: Props) {
  const isRtl = locale === "ar";
  const articles = (initialArticles && initialArticles.length > 0) ? initialArticles : [];
  const [featured, ...rest] = articles;
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setIsLoading(false), 350); return () => clearTimeout(t); }, []);

  return (
    <div className="pt-[var(--header-height)]">
      {/* Architectural Knowledge Hub Hero */}
      <section className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 bg-slate-50 dark:bg-[#070d1e] overflow-hidden border-b border-slate-200/80 dark:border-amber-500/10 transition-colors duration-300">
        {/* Layered Architectural Atmosphere */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageHeroBackground pageKey="blog" overlayOpacity={0.4} />
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[18rem] bg-gradient-to-r from-amber-500/15 via-blue-600/10 to-amber-400/10 rounded-full blur-[90px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/85 via-slate-50/75 to-slate-50 dark:from-[#070d1e]/85 dark:via-[#070d1e]/75 dark:to-[#070d1e] transition-colors duration-300" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-5">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Link href={`/${locale}`} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              {isRtl ? "الرئيسية" : "Home"}
            </Link>
            <ChevronLeft className={cn("w-3 h-3 text-slate-400 dark:text-slate-500", !isRtl && "rotate-180")} />
            <span className="text-amber-600 dark:text-amber-400/90 font-medium">
              {isRtl ? "المركز المعرفي والدراسات الفنية" : "Knowledge & Technical Hub"}
            </span>
          </div>

          {/* Architectural Badge (Clean Lucide Icon, No Emojis) */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-white/5 backdrop-blur-md border border-amber-500/30 shadow-sm">
            <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-200/90 tracking-wide">
              {isRtl ? "دليل المواصفات الفنية وكود البناء السعودي (SBC)" : "Technical Guides & SBC Compliance Standards"}
            </span>
          </motion.div>

          {/* Headline with Champagne Gold Tone */}
          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
            className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            {isRtl ? (
              <>
                المكتبة المعرفية و{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-[#F3E7C4] dark:via-[#E5C378] dark:to-[#C99E32]">
                  الدراسات الهندسية
                </span>
              </>
            ) : (
              <>
                Engineering & Architectural{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-[#F3E7C4] dark:via-[#E5C378] dark:to-[#C99E32]">
                  Knowledge Hub
                </span>
              </>
            )}
          </motion.h1>

          {/* Meaningful Contextual Subtitle */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isRtl
              ? "أدلة استرشادية، مقارنات فنية، ودراسات معتمدة للمهندسين والملاك حول مواصفات الزجاج السكريت، الواجهات الاستركشر، وقطاعات الألمنيوم المعزولة حرارياً."
              : "Expert engineering guides, technical comparisons, and SBC-compliant architectural specifications for glass facades, securit glazing, and thermal aluminum systems."}
          </motion.p>

          {/* Technical Trust Chips Matrix */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-none text-xs text-slate-700 dark:text-slate-300 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              {isRtl ? "مواصفات كود البناء السعودي (SBC)" : "SBC Code Compliant"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-none text-xs text-slate-700 dark:text-slate-300 transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              {isRtl ? "مقارنات دقيقة للمواد والخامات" : "Material Comparisons"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-none text-xs text-slate-700 dark:text-slate-300 transition-colors">
              <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              {isRtl ? "استشارات مجانية لكافة المشاريع" : "Free Project Consultations"}
            </span>
          </div>
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

              <div className="p-4 sm:p-8 flex flex-col justify-between space-y-4 sm:space-y-6">
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
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonArticleCard key={i} />)}
            </div>
          ) : rest.length > 0 && (
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

                      <div className="p-4 sm:p-6 space-y-2.5 sm:space-y-3">
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

                    <div className="px-4 pb-4 sm:px-6 sm:pb-6 pt-1 sm:pt-2">
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
