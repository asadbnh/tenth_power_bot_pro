"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star, Quote, ThumbsUp, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface Props {
  locale: Locale;
  dict: Dictionary;
  initialReviews?: any[];
}

const DEFAULT_REVIEWS = [
  {
    id: 1, rating: 5, client_name: "عبدالعزيز الشمري", company_ar: "مجموعة الشمري للاستثمار", company_en: "Al-Shamri Investment Group",
    comment: "تجربة احترافية من الدرجة الأولى. تم تنفيذ واجهات المبنى بجودة استثنائية وفي الوقت المحدد. أنصح بشدة بالتعامل مع هذه الشركة لكل من يبحث عن الجودة والاحترافية.",
    service_ar: "واجهات زجاجية", service_en: "Glass Facades", avatar_url: "/images/defaults/avatars/avatar-1.jpg", is_verified: true,
  },
  {
    id: 2, rating: 5, client_name: "نورة المطيري", company_ar: "مطاعم نورا", company_en: "Noura Restaurants",
    comment: "الديكور الذي نفذوه لمطعمنا تجاوز توقعاتنا بمراحل. الإبداع في التصميم والدقة في التنفيذ جعلا من مطعمنا وجهة لا يُنسى. شكراً من القلب.",
    service_ar: "ديكورات", service_en: "Decorations", avatar_url: "/images/defaults/avatars/avatar-2.jpg", is_verified: true,
  },
  {
    id: 3, rating: 5, client_name: "خالد الزهراني", company_ar: "مقاولات الزهراني", company_en: "Al-Zahrani Contracting",
    comment: "تعاملت معهم في تنفيذ مشروع مجمع سكني كامل. الالتزام بالمواعيد والجودة العالية وسعر عادل جعلتهم شريكي المفضل للمشاريع القادمة.",
    service_ar: "مقاولات", service_en: "Contracting", avatar_url: "/images/defaults/avatars/avatar-3.jpg", is_verified: true,
  },
];

const STATS = [
  { value: "4.9", label_ar: "متوسط التقييم", label_en: "Average Rating" },
  { value: "1,200+", label_ar: "تقييم موثق", label_en: "Verified Reviews" },
  { value: "98%", label_ar: "نسبة الرضا", label_en: "Satisfaction Rate" },
];

export function TestimonialsPageContent({ locale, dict, initialReviews }: Props) {
  const isRtl = locale === "ar";
  const [expanded, setExpanded] = useState<number | string | null>(null);
  const reviews = (initialReviews && initialReviews.length > 0) ? initialReviews : DEFAULT_REVIEWS;

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
      <section className="py-12 sm:py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, i) => {
              const name = review.client_name || review.name || "عميل مميز";
              const commentText = review.comment || (isRtl ? review.text_ar : review.text_en) || "";
              const company = isRtl ? (review.company_ar || review.company_name || "") : (review.company_en || review.company_name || "");
              const isVerified = review.is_verified ?? review.verified ?? true;
              const avatar = review.avatar_url || review.client_avatar_url;

              return (
                <motion.article key={review.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="rounded-2xl border border-border-light bg-surface-elevated p-6 flex flex-col hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-lg transition-all duration-300">

                  {/* Quote icon */}
                  <Quote className="w-8 h-8 text-primary-200 dark:text-primary-800 mb-3 shrink-0" />

                  {/* Review Text */}
                  <div className="flex-1">
                    <p className={cn("text-sm text-text-secondary leading-relaxed", !expanded || expanded !== review.id ? "line-clamp-4" : "")}>
                      {commentText}
                    </p>
                    {commentText.length > 180 && (
                      <button onClick={() => setExpanded(expanded === review.id ? null : review.id)}
                        className="text-xs text-primary-600 dark:text-primary-400 mt-1 font-medium">
                        {expanded === review.id ? (isRtl ? "عرض أقل" : "Show less") : (isRtl ? "قراءة المزيد" : "Read more")}
                      </button>
                    )}
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 my-4">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} className={cn("w-4 h-4", si < (review.rating || 5) ? "text-amber-400 fill-amber-400" : "text-border")} />
                    ))}
                  </div>

                  {/* Reviewer */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border-light">
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate">{name}</p>
                      {company && <p className="text-xs text-text-tertiary truncate">{company}</p>}
                    </div>
                    <div className="shrink-0 text-end">
                      {isVerified && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {dict.testimonials.verifiedReview}
                        </span>
                      )}
                      <p className="text-xs text-text-tertiary mt-0.5">{isRtl ? (review.service_ar || "خدمة منفذة") : (review.service_en || "Executed Service")}</p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {/* Write Review CTA */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }}
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
