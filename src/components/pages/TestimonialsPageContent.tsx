"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { Star, Quote, ThumbsUp, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface Props { locale: Locale; dict: Dictionary; }

const REVIEWS = [
  {
    id: 1, rating: 5, name: "عبدالعزيز الشمري", company_ar: "مجموعة الشمري للاستثمار", company_en: "Al-Shamri Investment Group",
    text_ar: "تجربة احترافية من الدرجة الأولى. تم تنفيذ واجهات المبنى بجودة استثنائية وفي الوقت المحدد. أنصح بشدة بالتعامل مع هذه الشركة لكل من يبحث عن الجودة والاحترافية.",
    text_en: "A first-class professional experience. The building facades were executed with exceptional quality and on time. I strongly recommend this company to anyone looking for quality and professionalism.",
    service_ar: "واجهات زجاجية", service_en: "Glass Facades", emoji: "👨‍💼", verified: true,
  },
  {
    id: 2, rating: 5, name: "نورة المطيري", company_ar: "مطاعم نورا", company_en: "Noura Restaurants",
    text_ar: "الديكور الذي نفذوه لمطعمنا تجاوز توقعاتنا بمراحل. الإبداع في التصميم والدقة في التنفيذ جعلا من مطعمنا وجهة لا يُنسى. شكراً من القلب.",
    text_en: "The decor they executed for our restaurant exceeded our expectations by far. The creativity in design and precision in execution made our restaurant an unforgettable destination.",
    service_ar: "ديكورات", service_en: "Decorations", emoji: "👩‍🍳", verified: true,
  },
  {
    id: 3, rating: 5, name: "خالد الزهراني", company_ar: "مقاولات الزهراني", company_en: "Al-Zahrani Contracting",
    text_ar: "تعاملت معهم في تنفيذ مشروع مجمع سكني كامل. الالتزام بالمواعيد والجودة العالية وسعر عادل جعلتهم شريكي المفضل للمشاريع القادمة.",
    text_en: "I worked with them on a full residential complex project. Commitment to deadlines, high quality, and fair pricing made them my preferred partner for upcoming projects.",
    service_ar: "مقاولات", service_en: "Contracting", emoji: "👷", verified: true,
  },
  {
    id: 4, rating: 5, name: "سارة الغامدي", company_ar: "ديكور هوم", company_en: "Decor Home",
    text_ar: "المطبخ الذي صمموه وركبوه لمنزلنا جميل جداً وعملي بنفس الوقت. فريق محترف، نظيف، منظم. لا أتردد في التوصية بهم لأي شخص.",
    text_en: "The kitchen they designed and installed for our home is beautiful and practical at the same time. Professional, clean, organized team. I have no hesitation recommending them to anyone.",
    service_ar: "مطابخ", service_en: "Kitchens", emoji: "👩‍🏠", verified: true,
  },
  {
    id: 5, rating: 5, name: "محمد العتيبي", company_ar: "العتيبي للتطوير", company_en: "Al-Otaibi Development",
    text_ar: "الزجاج السكريت الذي ركبوه للواجهات ممتاز جداً. أسعار معقولة مع ضمان طويل الأمد. هذا ما يميز هذه الشركة عن غيرها.",
    text_en: "The tempered glass they installed for the facades is excellent. Reasonable prices with long-term warranty. This is what distinguishes this company from others.",
    service_ar: "زجاج سكريت", service_en: "Tempered Glass", emoji: "🏗️", verified: true,
  },
  {
    id: 6, rating: 4, name: "فاطمة الدوسري", company_ar: "مجمع الدوسري", company_en: "Al-Dosari Complex",
    text_ar: "عمل ممتاز في تركيب الأبواب والنوافذ. الفريق محترف ويعمل بدقة عالية. سأتعامل معهم في مشاريعي القادمة بكل تأكيد.",
    text_en: "Excellent work installing doors and windows. The team is professional and works with high precision. I will definitely work with them on my upcoming projects.",
    service_ar: "أبواب ونوافذ", service_en: "Doors & Windows", emoji: "👩‍💼", verified: false,
  },
];

const STATS = [
  { value: "4.9", label_ar: "متوسط التقييم", label_en: "Average Rating" },
  { value: "1,200+", label_ar: "تقييم موثق", label_en: "Verified Reviews" },
  { value: "98%", label_ar: "نسبة الرضا", label_en: "Satisfaction Rate" },
];

export function TestimonialsPageContent({ locale, dict }: Props) {
  const isRtl = locale === "ar";
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="pt-[var(--header-height)]">
      {/* Hero */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-br from-primary-950 via-[#0c1445] to-primary-900 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-white mb-4">{dict.testimonials.title}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-lg text-white/60">{dict.testimonials.subtitle}</motion.p>

          {/* Star Rating Display */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-1.5 mt-6">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-7 h-7 text-amber-400 fill-amber-400" />)}
            <span className="text-3xl font-extrabold text-white ms-2">4.9</span>
            <span className="text-white/50 text-sm ms-1">{isRtl ? "/ 5" : "/ 5"}</span>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="bg-surface border-b border-border-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-3 gap-4 text-center">
          {STATS.map((s, i) => (
            <div key={i}>
              <p className="text-2xl sm:text-3xl font-extrabold text-primary-600 dark:text-primary-400">{s.value}</p>
              <p className="text-xs sm:text-sm text-text-secondary mt-0.5">{isRtl ? s.label_ar : s.label_en}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews Grid */}
      <section ref={sectionRef} className="py-12 sm:py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REVIEWS.map((review, i) => (
              <motion.article key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl border border-border-light bg-surface-elevated p-6 flex flex-col hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-lg transition-all duration-300">

                {/* Quote icon */}
                <Quote className="w-8 h-8 text-primary-200 dark:text-primary-800 mb-3 shrink-0" />

                {/* Review Text */}
                <div className="flex-1">
                  <p className={cn("text-sm text-text-secondary leading-relaxed", !expanded || expanded !== review.id ? "line-clamp-4" : "")}>
                    {isRtl ? review.text_ar : review.text_en}
                  </p>
                  {(isRtl ? review.text_ar : review.text_en).length > 180 && (
                    <button onClick={() => setExpanded(expanded === review.id ? null : review.id)}
                      className="text-xs text-primary-600 dark:text-primary-400 mt-1 font-medium">
                      {expanded === review.id ? (isRtl ? "عرض أقل" : "Show less") : (isRtl ? "قراءة المزيد" : "Read more")}
                    </button>
                  )}
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 my-4">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className={cn("w-4 h-4", si < review.rating ? "text-amber-400 fill-amber-400" : "text-border")} />
                  ))}
                </div>

                {/* Reviewer */}
                <div className="flex items-center gap-3 pt-4 border-t border-border-light">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-lg shrink-0">
                    {review.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{review.name}</p>
                    <p className="text-xs text-text-tertiary truncate">{isRtl ? review.company_ar : review.company_en}</p>
                  </div>
                  <div className="shrink-0 text-end">
                    {review.verified && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {dict.testimonials.verifiedReview}
                      </span>
                    )}
                    <p className="text-xs text-text-tertiary mt-0.5">{isRtl ? review.service_ar : review.service_en}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Write Review CTA */}
          <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.6 }}
            className="mt-12 text-center p-8 rounded-2xl bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900">
            <ThumbsUp className="w-10 h-10 mx-auto mb-3 text-primary-600 dark:text-primary-400" />
            <h3 className="text-xl font-bold mb-2">{isRtl ? "شاركنا تجربتك" : "Share Your Experience"}</h3>
            <p className="text-text-secondary text-sm mb-5">
              {isRtl ? "رأيك يهمنا ويساعد الآخرين على اتخاذ قراراتهم" : "Your feedback matters to us and helps others make their decisions"}
            </p>
            <Link href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">
              {dict.testimonials.writeReview}
              <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
