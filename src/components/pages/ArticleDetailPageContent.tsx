"use client";

import Link from "next/link";
import {
  Calendar, Clock, User, Share2, ArrowRight, ChevronLeft, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface ArticleDetail {
  slug: string;
  title_ar: string;
  title_en: string;
  category_ar: string;
  category_en: string;
  readTime: string;
  date: string;
  author_ar: string;
  author_en: string;
  content_ar: string;
  content_en: string;
}

const ARTICLES_DATA: Record<string, ArticleDetail> = {
  "types-of-tempered-glass": {
    slug: "types-of-tempered-glass",
    title_ar: "أنواع الزجاج السكريت واستخداماته في البناء الحديث",
    title_en: "Types of Tempered Glass & Modern Construction Applications",
    category_ar: "زجاج ومقاولات",
    category_en: "Glass & Contracting",
    readTime: "5 دقائق",
    date: "15 مايو 2024",
    author_ar: "م. أحمد الغامدي",
    author_en: "Eng. Ahmed Al-Ghamdi",
    content_ar: `يُعد الزجاج السكريت (Tempered Glass) أحد أكثر المواد المعمارية استخداماً في العصر الحديث نظراً لقوته العالية وخصائص الأمان الفريدة التي يتمتع بها مقارنة بالزجاج العادي.

### 1. كيف يتم تصنيع الزجاج السكريت؟
يتم تسخين الزجاج العادي إلى درجات حرارة تتجاوز 600 درجة مئوية في أفران خاصة، ثم يتم تبريده بشكل سريع جداً بواسطة نفاثات هواء بارد. هذه العملية تخلق إجهادات ضغط عالية على السطح الخارجي بينما يبقى المركز في حالة شد، مما يمنحه قوة مضاعفة بـ 4 إلى 5 مرات.

### 2. أهم أنواع الزجاج السكريت:
- **الزجاج الشفاف (Clear Tempered):** الأكثر شيوعاً في الواجهات والأبواب.
- **الزجاج فائق النقاء (Ultra-Clear / Low-Iron):** يتيمز بنقاء كريستالي وعدم وجود أي إخضرار في الحواف.
- **الزجاج المثلج (Frosted / Sandblasted):** يمنح الخصوصية التامة مع السماح بمرور الضوء.
- **الزجاج المعزول (Double Glazed Tempered):** مكون من طبقتين بينهما فراغ غاز الأرجون لزيادة العزل الحراري والصوتي.

### 3. التطبيقات الشائعة في السعودية:
تتنوع الاستخدامات في المملكة بين كبائن الشاور، واجهات المحلات، الدربزينات الزجاجية، والأبواب الاتوماتيكية.`,
    content_en: `Tempered glass is one of the most widely used architectural materials today due to its structural strength and unique safety features compared to standard annealed glass.

### 1. How is Tempered Glass Manufactured?
Regular float glass is heated to over 600°C in specialized ovens and rapidly cooled with high-pressure air streams. This process creates intense surface compression while maintaining core tension, multiplying overall strength 4x to 5x.

### 2. Main Types of Tempered Glass:
- **Clear Tempered:** The standard choice for doors and storefronts.
- **Ultra-Clear (Low-Iron):** Offers crystal clarity without greenish edge tinting.
- **Frosted / Sandblasted:** Provides complete visual privacy while transmitting light.
- **Double Glazed Tempered:** Dual panels with argon gas gap for high insulation.

### 3. Common Applications in KSA:
Widely used across Saudi Arabia for shower enclosures, retail facades, glass handrails, and automatic sliding doors.`
  }
};

interface Props {
  slug: string;
  locale: Locale;
  dict: Dictionary;
}

export function ArticleDetailPageContent({ slug, locale, dict }: Props) {
  const isRtl = locale === "ar";
  const article = ARTICLES_DATA[slug] || {
    slug,
    title_ar: isRtl ? "دليل معماريك في اختيار أفضل الخامات" : "Architectural Guide to Material Selection",
    title_en: "Architectural Guide to Material Selection",
    category_ar: isRtl ? "نصائح وإرشادات" : "Tips & Guides",
    category_en: "Tips & Guides",
    readTime: "4 min",
    date: "2024",
    author_ar: isRtl ? "فريق التحرير الهندي" : "Editorial Team",
    author_en: "Editorial Team",
    content_ar: "نقدم لكم في هذا المقال الشامل أحدث النصائح والتوصيات الهندسية لضمان اختيار الخامات والمواد المناسبة لمشروعك المعماري السكني أو التجاري.",
    content_en: "In this comprehensive article we share essential engineering guidance to ensure selecting the ideal materials for your project."
  };

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
            <span className="text-white font-medium">{isRtl ? article.category_ar : article.category_en}</span>
          </div>

          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-primary-200">
            <BookOpen className="w-3.5 h-3.5" />
            {isRtl ? article.category_ar : article.category_en}
          </span>

          <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight">
            {isRtl ? article.title_ar : article.title_en}
          </h1>

          <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm text-white/70 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-accent-400" />
              <span>{isRtl ? article.author_ar : article.author_en}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-400" />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-400" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg dark:prose-invert max-w-none text-text-secondary leading-relaxed whitespace-pre-line">
          {isRtl ? article.content_ar : article.content_en}
        </div>

        {/* Share & CTA */}
        <div className="mt-16 pt-8 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href={`/${locale}/quote`}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 active:scale-95 transition-all">
            {isRtl ? "هل لديك استفسار؟ اطلب استشارة" : "Have Questions? Request Consultation"}
            <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
          </Link>

          <button onClick={() => { if (navigator.share) navigator.share({ title: isRtl ? article.title_ar : article.title_en, url: window.location.href }); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-light hover:bg-surface text-sm font-medium transition-colors text-text-secondary">
            <Share2 className="w-4 h-4" />
            {isRtl ? "مشاركة المقال" : "Share Article"}
          </button>
        </div>
      </article>
    </div>
  );
}
