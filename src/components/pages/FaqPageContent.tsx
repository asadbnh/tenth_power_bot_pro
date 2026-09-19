"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search, ChevronDown, HelpCircle, ChevronLeft, MessageSquare } from "lucide-react";
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
      {/* Architectural FAQ Knowledge Base Hero */}
      <section className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 bg-[#070d1e] overflow-hidden">
        {/* Layered Architectural Atmosphere */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageHeroBackground pageKey="faq" overlayOpacity={0.78} />
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[18rem] bg-gradient-to-r from-amber-500/15 via-blue-600/10 to-amber-400/10 rounded-full blur-[90px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070d1e]/85 via-[#070d1e]/75 to-[#070d1e]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-5">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">
              {isRtl ? "الرئيسية" : "Home"}
            </Link>
            <ChevronLeft className={cn("w-3 h-3 text-slate-500", !isRtl && "rotate-180")} />
            <span className="text-amber-400/90 font-medium">
              {isRtl ? "الأسئلة الشائعة" : "FAQs"}
            </span>
          </div>

          {/* Architectural Badge (No Emojis) */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-[#D4AF37]/30 shadow-sm">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-200/90 tracking-wide">
              {isRtl ? "مركز الاستفسارات والدعم الهندسي المعتمد" : "Engineering Consultation & Technical FAQs"}
            </span>
          </motion.div>

          {/* Headline with Champagne Gold Tone */}
          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
            className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
            {isRtl ? (
              <>
                الأسئلة{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F3E7C4] via-[#E5C378] to-[#C99E32]">
                  الشائعة والمُجابة
                </span>
              </>
            ) : (
              <>
                Frequently Asked{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F3E7C4] via-[#E5C378] to-[#C99E32]">
                  Technical Questions
                </span>
              </>
            )}
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}
            className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {dict.faq.subtitle || (isRtl
              ? "إليك إجابات تفصيلية وشاملة حول معايير التركيب، أنواع الزجاج المقوى، الضمان الشامل، وآلية طلب خدمة معاينة الموقع."
              : "Comprehensive technical answers about installation standards, glass specifications, warranty terms, and site survey booking.")}
          </motion.p>

          {/* Search Box Bar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="relative max-w-xl mx-auto pt-1">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-white/50", isRtl ? "right-4" : "left-4")} />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={isRtl ? "ابحث في الأسئلة الشائعة والمواصفات..." : "Search in FAQs and specifications..."}
              className={cn(
                "w-full py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 backdrop-blur-md transition-all",
                isRtl ? "pr-11 pl-4" : "pl-11 pr-4"
              )} />
          </motion.div>
        </div>
      </section>

      {/* Accordion List */}
      <section className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
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
                        <HelpCircle className="w-5 h-5 text-amber-500 shrink-0" />
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

          {/* Direct Technical Consultation Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface-elevated border border-border-light text-center space-y-4 shadow-sm">
            <h3 className="text-base sm:text-lg font-bold text-text-primary">
              {isRtl ? "هل لديك استفسار هندسي لم تجد إجابته هنا؟" : "Have a technical question not answered here?"}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto">
              {isRtl
                ? "مهندسونا متاحون للإجابة على جميع الاستفسارات الفنية ودراسة المخططات وتقديم التوصيات مجاناً."
                : "Our structural engineers are ready to answer your technical inquiries and review your drawings."}
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/966532438253?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D9%84%D8%AF%D9%8A%20%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D9%87%D9%86%D8%AF%D8%B3%D9%8A%20%D8%AD%D9%88%D9%84%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%D9%83%D9%85"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#20BD5A] transition-all shadow-md active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isRtl ? "تحدث مع مهندس الموقع عبر واتساب" : "Chat with Site Engineer on WhatsApp"}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

