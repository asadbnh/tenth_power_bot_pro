"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Tag, ArrowRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface Props { locale: Locale; dict: Dictionary; }

const ARTICLES = [
  {
    id: 1, slug: "types-of-tempered-glass",
    title_ar: "دليل شامل: أنواع الزجاج السكريت وكيفية اختيار الأفضل لمشروعك",
    title_en: "Complete Guide: Types of Tempered Glass and How to Choose the Best for Your Project",
    excerpt_ar: "تعرف على الفروق الدقيقة بين أنواع الزجاج المقوى وكيف تؤثر على السلامة والجمالية والتكلفة في مشاريع البناء الحديثة.",
    excerpt_en: "Learn the subtle differences between types of tempered glass and how they affect safety, aesthetics, and cost in modern construction projects.",
    tag_ar: "زجاج", tag_en: "Glass", readTime: 5, gradient: "from-blue-500 to-cyan-400", emoji: "🪟",
  },
  {
    id: 2, slug: "aluminum-vs-upvc",
    title_ar: "الألمنيوم مقابل UPVC: أيهما أفضل لنوافذ منزلك؟",
    title_en: "Aluminum vs UPVC: Which is Better for Your Home Windows?",
    excerpt_ar: "مقارنة تفصيلية بين نظامي الألمنيوم والـ UPVC في العزل والمتانة والسعر لمساعدتك على اتخاذ القرار الصحيح.",
    excerpt_en: "A detailed comparison between aluminum and UPVC systems in insulation, durability, and price to help you make the right decision.",
    tag_ar: "ألمنيوم", tag_en: "Aluminum", readTime: 7, gradient: "from-slate-500 to-gray-400", emoji: "🔩",
  },
  {
    id: 3, slug: "kitchen-design-trends-2024",
    title_ar: "أبرز ترندات تصميم المطابخ لعام 2024",
    title_en: "Top Kitchen Design Trends of 2024",
    excerpt_ar: "اكتشف أحدث صيحات تصميم المطابخ التي تجمع بين الأناقة والوظيفة العملية لإنشاء مطبخ أحلامك.",
    excerpt_en: "Discover the latest kitchen design trends that combine elegance and practicality to create your dream kitchen.",
    tag_ar: "مطابخ", tag_en: "Kitchens", readTime: 6, gradient: "from-amber-500 to-orange-400", emoji: "🍽️",
  },
  {
    id: 4, slug: "glass-facade-maintenance",
    title_ar: "كيف تحافظ على واجهتك الزجاجية لأكثر من 20 عاماً",
    title_en: "How to Maintain Your Glass Facade for Over 20 Years",
    excerpt_ar: "نصائح الخبراء لصيانة واجهتك الزجاجية وحمايتها من العوامل البيئية لإطالة عمرها وإبقاء مظهرها مشرقاً.",
    excerpt_en: "Expert tips for maintaining your glass facade and protecting it from environmental factors to extend its life and keep it shining.",
    tag_ar: "صيانة", tag_en: "Maintenance", readTime: 4, gradient: "from-emerald-500 to-teal-400", emoji: "🔧",
  },
  {
    id: 5, slug: "home-decoration-ideas",
    title_ar: "10 أفكار ديكور تحوّل منزلك إلى قصر",
    title_en: "10 Decoration Ideas to Transform Your Home into a Palace",
    excerpt_ar: "أبرز أفكار الديكور الداخلي لعام 2024 التي يمكنك تطبيقها بميزانية معقولة للحصول على نتائج استثنائية.",
    excerpt_en: "Top interior decoration ideas for 2024 that you can implement on a reasonable budget for exceptional results.",
    tag_ar: "ديكورات", tag_en: "Decorations", readTime: 8, gradient: "from-rose-500 to-pink-400", emoji: "🎨",
  },
  {
    id: 6, slug: "contracting-guide-saudi",
    title_ar: "دليل المقاولات في المملكة العربية السعودية: ما تحتاج معرفته قبل بدء مشروعك",
    title_en: "Contracting Guide in Saudi Arabia: What You Need to Know Before Starting Your Project",
    excerpt_ar: "شرح مبسط لجميع متطلبات المقاولات في المملكة من التراخيص والمعايير الهندسية حتى اختيار المقاول المناسب.",
    excerpt_en: "A simplified explanation of all contracting requirements in Saudi Arabia from licenses and engineering standards to choosing the right contractor.",
    tag_ar: "مقاولات", tag_en: "Contracting", readTime: 10, gradient: "from-yellow-500 to-amber-400", emoji: "🏗️",
  },
];

export function BlogPageContent({ locale, dict }: Props) {
  const isRtl = locale === "ar";
  const [featured, ...rest] = ARTICLES;

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
          <motion.article initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="group relative rounded-3xl overflow-hidden border border-border-light hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-2xl transition-all duration-300 mb-10 bg-surface-elevated">
            <div className="grid md:grid-cols-5">
              <div className={cn("md:col-span-2 h-56 md:h-auto bg-gradient-to-br flex items-center justify-center text-7xl", featured.gradient)}>
                <span>{featured.emoji}</span>
              </div>
              <div className="md:col-span-3 p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-semibold">
                    {isRtl ? "مقال مميز" : "Featured"}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-text-tertiary">
                    <Clock className="w-3.5 h-3.5" />
                    {featured.readTime} {dict.blog.readTime}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
                  {isRtl ? featured.title_ar : featured.title_en}
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed mb-5">
                  {isRtl ? featured.excerpt_ar : featured.excerpt_en}
                </p>
                <Link href={`/${locale}/blog/${featured.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400">
                  {dict.blog.readMore}
                  <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
                </Link>
              </div>
            </div>
          </motion.article>

          {/* Rest of Articles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((article, i) => (
              <motion.article key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                className="group rounded-2xl overflow-hidden border border-border-light hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-xl transition-all duration-300 bg-surface-elevated">
                <div className={cn("h-44 bg-gradient-to-br flex items-center justify-center text-5xl", article.gradient)}>
                  <span>{article.emoji}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center gap-1 text-xs text-text-tertiary">
                      <Tag className="w-3.5 h-3.5" />
                      {isRtl ? article.tag_ar : article.tag_en}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-tertiary">
                      <Clock className="w-3.5 h-3.5" />
                      {article.readTime} {dict.blog.readTime}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base leading-snug mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                    {isRtl ? article.title_ar : article.title_en}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mb-4">
                    {isRtl ? article.excerpt_ar : article.excerpt_en}
                  </p>
                  <Link href={`/${locale}/blog/${article.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400">
                    <BookOpen className="w-3.5 h-3.5" />
                    {dict.blog.readMore}
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
