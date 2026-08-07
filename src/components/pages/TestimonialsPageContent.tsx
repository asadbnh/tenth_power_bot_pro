"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star, Quote, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface Props {
  locale: Locale;
  dict: Dictionary;
  initialReviews?: any[];
}

const STATS = [
  { value: "4.9", label_ar: "متوسط التقييم", label_en: "Average Rating" },
  { value: "1,200+", label_ar: "تقييم موثق", label_en: "Verified Reviews" },
  { value: "98%", label_ar: "نسبة الرضا", label_en: "Satisfaction Rate" },
];

export function TestimonialsPageContent({ locale, dict, initialReviews }: Props) {
  const isRtl = locale === "ar";
  const [expanded, setExpanded] = useState<number | string | null>(null);
  const reviews = (initialReviews && initialReviews.length > 0) ? initialReviews : [];

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
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-6 h-6 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-white font-extrabold text-lg ms-2">4.9 / 5.0</span>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-10 bg-surface border-b border-border-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            {STATS.map((stat, i) => (
              <div key={i}>
                <p className="text-2xl sm:text-4xl font-black text-primary-600 dark:text-primary-400 mb-1">{stat.value}</p>
                <p className="text-xs sm:text-sm text-text-tertiary">{isRtl ? stat.label_ar : stat.label_en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, i) => {
              const name = review.reviewer_name || review.client_name || review.name || (isRtl ? "عميل مميز" : "VIP Client");
              const commentText = review.content_ar || review.content_en || review.comment || (isRtl ? review.text_ar : review.text_en) || "";
              const company = isRtl ? (review.client_company || review.company_ar || review.company_name || "") : (review.client_company || review.company_en || review.company_name || "");
              const isVerified = review.is_verified ?? review.verified ?? true;
              const avatar = review.reviewer_avatar_url || review.avatar_url || review.client_avatar_url || "/images/defaults/avatars/avatar-1.jpg";
              const isLong = commentText.length > 180;
              const isExp = expanded === (review.id || i);

              return (
                <motion.div key={review.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="rounded-3xl p-6 border border-border-light bg-surface-elevated hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative">
                  
                  <Quote className="w-8 h-8 text-primary-500/10 absolute top-5 end-5" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={cn(
                          "w-4 h-4",
                          star <= (review.rating || 5) ? "fill-amber-400 text-amber-400" : "text-border-light"
                        )} />
                      ))}
                    </div>

                    <p className="text-text-secondary text-sm leading-relaxed">
                      {isLong && !isExp ? `${commentText.slice(0, 180)}...` : commentText}
                    </p>

                    {isLong && (
                      <button onClick={() => setExpanded(isExp ? null : (review.id || i))}
                        className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">
                        {isExp ? (isRtl ? "عرض أقل" : "Show less") : (isRtl ? "قراءة المزيد" : "Read more")}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-6 mt-6 border-t border-border-light">
                    <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover border border-border-light shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-sm text-text-primary truncate">{name}</p>
                        {isVerified && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                      </div>
                      {company && <p className="text-xs text-text-tertiary truncate">{company}</p>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <Link href={`/${locale}/quote`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary-600 text-white font-extrabold text-sm hover:bg-primary-700 active:scale-95 transition-all shadow-lg shadow-primary-600/20">
              {isRtl ? "شاركنا تجريتك واطلب مشروعك" : "Share Your Experience & Request Project"}
              <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
