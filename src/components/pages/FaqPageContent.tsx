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

const DEFAULT_FAQS = [
  {
    q_ar: "ما هي أنواع الزجاج المقوى التي تقدمونها؟",
    q_en: "What types of tempered glass do you offer?",
    a_ar: "نقدم مجموعة شاملة من الزجاج المقوى بسماكات مختلفة (6 مم، 8 مم، 10 مم، 12 مم)، ويشمل ذلك الزجاج الشفاف، والملون، والعاكس، والمطفي. كل أنواعنا مطابقة لمعايير السلامة السعودية والدولية.",
    a_en: "We offer a comprehensive range of tempered glass in different thicknesses (6mm, 8mm, 10mm, 12mm), including clear, tinted, reflective, and frosted glass. All our types comply with Saudi and international safety standards.",
    cat: "glass",
  },
  {
    q_ar: "كم تستغرق مدة تنفيذ مشروع الواجهة الزجاجية؟",
    q_en: "How long does a glass facade project take?",
    a_ar: "تعتمد المدة على حجم المشروع. عادةً تستغرق المشاريع الصغيرة 3-7 أيام، والمشاريع المتوسطة 2-4 أسابيع، والمشاريع الكبيرة من 1-3 أشهر. سنقدم لك جدولاً زمنياً تفصيلياً عند دراسة مشروعك.",
    a_en: "Duration depends on project size. Small projects typically take 3-7 days, medium projects 2-4 weeks, and large projects 1-3 months. We will provide you with a detailed timeline when studying your project.",
    cat: "glass",
  },
  {
    q_ar: "هل تقدمون ضمانات على أعمال الألمنيوم؟",
    q_en: "Do you offer warranties on aluminum works?",
    a_ar: "نعم، نقدم ضماناً شاملاً لمدة 5 سنوات على جميع أعمال الألمنيوم تشمل: عدم الكسر، ومقاومة الصدأ، والحفاظ على الألوان. كما نوفر خدمة الصيانة الدورية المجانية خلال فترة الضمان.",
    a_en: "Yes, we offer a comprehensive 5-year warranty on all aluminum works including: no breakage, rust resistance, and color preservation. We also provide free periodic maintenance service during the warranty period.",
    cat: "aluminum",
  },
];

export function FaqPageContent({ locale, dict, initialFaqs }: Props) {
  const isRtl = locale === "ar";
  const [openId, setOpenId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const faqsList = (initialFaqs && initialFaqs.length > 0) ? initialFaqs : DEFAULT_FAQS;

  const filtered = faqsList.filter(faq => {
    const question = faq.question || (isRtl ? faq.q_ar : faq.q_en) || faq.q_ar || "";
    const answer = faq.answer || (isRtl ? faq.a_ar : faq.a_en) || faq.a_ar || "";
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return question.toLowerCase().includes(q) || answer.toLowerCase().includes(q);
  });

  return (
    <div className="pt-[var(--header-height)]">
      {/* Hero */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-br from-primary-950 via-[#0c1445] to-primary-900 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-white mb-4">{dict.faq.title}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-lg text-white/60 mb-8">{dict.faq.subtitle}</motion.p>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-white/40" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={dict.faq.searchPlaceholder}
              className="w-full ps-12 pe-4 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 sm:py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <HelpCircle className="w-12 h-12 mx-auto text-text-tertiary mb-4" />
              <p className="text-text-secondary">{dict.search.noResults}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((faq, i) => {
                const questionText = faq.question || (isRtl ? faq.q_ar : faq.q_en) || faq.q_ar;
                const answerText = faq.answer || (isRtl ? faq.a_ar : faq.a_en) || faq.a_ar;

                return (
                  <motion.div key={faq.id || i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                    className={cn(
                      "rounded-2xl border transition-all duration-200 overflow-hidden",
                      openId === i
                        ? "border-primary-300 dark:border-primary-700 shadow-md"
                        : "border-border-light hover:border-primary-200 dark:hover:border-primary-800"
                    )}>
                    <button
                      onClick={() => setOpenId(openId === i ? null : i)}
                      className="w-full flex items-center justify-between gap-4 p-5 text-start bg-surface-elevated hover:bg-surface transition-colors"
                      aria-expanded={openId === i}>
                      <span className="font-semibold text-sm sm:text-base leading-snug">
                        {questionText}
                      </span>
                      <ChevronDown className={cn("w-5 h-5 text-text-tertiary shrink-0 transition-transform duration-300",
                        openId === i && "rotate-180 text-primary-600 dark:text-primary-400")} />
                    </button>
                    <AnimatePresence initial={false}>
                      {openId === i && (
                        <motion.div
                          key="answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}>
                          <div className="px-5 pb-5 pt-2 text-sm text-text-secondary leading-relaxed border-t border-border-light bg-background">
                            {answerText}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Still have questions? */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
            className="mt-12 rounded-2xl bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900 p-8 text-center">
            <HelpCircle className="w-10 h-10 mx-auto mb-3 text-primary-600 dark:text-primary-400" />
            <h3 className="text-lg font-bold mb-2">
              {isRtl ? "لم تجد إجابة لسؤالك؟" : "Didn't find your answer?"}
            </h3>
            <p className="text-text-secondary text-sm mb-5">
              {isRtl ? "فريقنا جاهز للإجابة على جميع استفساراتك" : "Our team is ready to answer all your inquiries"}
            </p>
            <a href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors text-sm">
              {isRtl ? "تواصل معنا" : "Contact Us"}
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
