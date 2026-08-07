"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star, Quote, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { PageHeroBackground } from "@/components/ui/PageHeroBackground";

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
      {/* Cinematic Testimonials Hero */}
      <section className="relative py-20 sm:py-28 bg-[#090b16] overflow-hidden">
        {/* Ambient Gold & Sapphire Lighting */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageHeroBackground pageKey="testimonials" />
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[22rem] bg-gradient-to-r from-amber-500/20 via-yellow-400/10 to-blue-600/15 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#090b16]/80 via-transparent to-[#090b16]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full royal-badge shadow-xl backdrop-blur-xl border border-amber-500/30">
            <Quote className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-bold">
              {isRtl ? "آراء وتقييمات عملائنا الموثقة" : "Verified Client Reviews & Testimonials"}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
            className="text-4xl sm:text-6xl font-extrabold text-white leading-tight">
            {isRtl ? (
              <>
                ثقة عملائنا هي{" "}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                  وسام فخرنا الحقيقي
                </span>
              </>
            ) : (
              <>
                Our Client Trust is{" "}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                  Our Ultimate Honor
                </span>
              </>
            )}
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.7 }}
            className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {dict.testimonials.subtitle || (isRtl
              ? "استمع لشهادات عملائنا الشركاء والمطورين العقاريين وأصحاب الفيلا والمشاريع التجاري حول تجربة التعامل معنا."
              : "Read real client reviews from homeowners, commercial developers, and project consultants across KSA.")}
          </motion.p>

          {/* Star Rating Display */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-amber-500/30 backdrop-blur-xl">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-md" />
              ))}
            </div>
            <span className="text-white font-extrabold text-base ms-2">4.9 / 5.0</span>
            <span className="text-slate-400 text-xs font-semibold">
              ({isRtl ? "أكثر من 1,200 تقييم ممتاز" : "1,200+ Verified Ratings"})
            </span>
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
