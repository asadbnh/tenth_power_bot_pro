"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

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
      {/* Hero */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-br from-primary-950 via-[#0c1445] to-primary-900 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-white mb-4">{dict.faq.title}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-lg text-white/60 mb-8">{dict.faq.subtitle}</motion.p>

          {/* Search box */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="relative max-w-xl mx-auto">
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
