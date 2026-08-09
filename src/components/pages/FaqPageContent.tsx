"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { PageHeroBackground } from "@/components/ui/PageHeroBackground";

interface Props {
  locale: Locale;
  dict: Dictionary;
  initialFaqs?: any[];
}

export function FaqPageContent({ locale, dict, initialFaqs }: Props) {
  const isRtl = locale === "ar";
  const [openId, setOpenId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const faqsList = (initialFaqs && initialFaqs.length > 0) ? initialFaqs : [];

  const filtered = faqsList.filter(faq => {
    const question = faq.question || (isRtl ? faq.question_ar : faq.question_en) || faq.question_ar || faq.q_ar || "";
    const answer = faq.answer || (isRtl ? faq.answer_ar : faq.answer_en) || faq.answer_ar || faq.a_ar || "";
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return question.toLowerCase().includes(q) || answer.toLowerCase().includes(q);
  });

  return (
    <div className="pt-[var(--header-height)] min-h-dvh bg-gradient-to-b from-background to-surface">
      {/* Cinematic FAQ Knowledge Base Hero */}
      <section className="relative py-20 sm:py-28 bg-[#070e1c] overflow-hidden">
        {/* Ambient Cyan Spotlight */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageHeroBackground pageKey="faq" />
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[22rem] bg-gradient-to-r from-cyan-500/15 via-blue-600/15 to-amber-500/15 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070e1c]/80 via-transparent to-[#070e1c]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full royal-badge shadow-xl backdrop-blur-xl border border-cyan-500/30">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span className="text-xs sm:text-sm font-bold">
              {isRtl ? "💡 مركز الاستفسارات والدعم الهندسي" : "💡 Knowledge Base & Technical FAQ"}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
            className="text-4xl sm:text-6xl font-extrabold text-white leading-tight">
            {isRtl ? (
              <>
                الأسئلة{" "}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                  الشائعة والمُجابة
                </span>
              </>
            ) : (
              <>
                Frequently Asked{" "}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                  Questions
                </span>
              </>
            )}
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.7 }}
            className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {dict.faq.subtitle || (isRtl
              ? "إليك إجابات تفصيلية وشاملة حول معايير التركيب، أنواع الزجاج المقوى، الضمان الشامل، وآلية طلب خدمة معاينة الموقع."
              : "Comprehensive technical answers about installation standards, glass specifications, warranty terms, and site survey booking.")}
          </motion.p>

          {/* Search Box Bar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="relative max-w-xl mx-auto pt-2">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 w-5 h-5 text-white/40", isRtl ? "right-4" : "left-4")} />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={isRtl ? "ابحث في الأسئلة الشائعة..." : "Search in FAQs..."}
              className={cn(
                "w-full py-4 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 backdrop-blur-md transition-all",
                isRtl ? "pr-12 pl-4" : "pl-12 pr-4"
              )} />
          </motion.div>
        </div>
      </section>

      {/* Accordion List */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-text-tertiary">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{isRtl ? "لم نجد نتائج مطابقة لبحثك" : "No FAQs matching your query"}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((faq, index) => {
                const isOpen = openId === index;
                const question = faq.question || (isRtl ? faq.question_ar : faq.question_en) || faq.question_ar || faq.q_ar || "";
                const answer = faq.answer || (isRtl ? faq.answer_ar : faq.answer_en) || faq.answer_ar || faq.a_ar || "";

                return (
                  <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                    className="rounded-2xl border border-border-light bg-surface-elevated overflow-hidden transition-all shadow-sm">
                    <button onClick={() => setOpenId(isOpen ? null : index)}
                      className="w-full p-5 text-start flex items-center justify-between gap-4 font-bold text-sm sm:text-base hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      <span className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-accent-500 shrink-0" />
                        {question}
                      </span>
                      <ChevronDown className={cn("w-5 h-5 shrink-0 text-text-tertiary transition-transform duration-200", isOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                          className="overflow-hidden">
                          <div className="px-5 pb-5 pt-1 text-sm text-text-secondary leading-relaxed border-t border-border-light/60">
                            {answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
