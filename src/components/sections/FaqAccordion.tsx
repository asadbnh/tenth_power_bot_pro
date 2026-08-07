"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export interface FaqItem {
  id?: string;
  question_ar?: string;
  question_en?: string;
  answer_ar?: string;
  answer_en?: string;
  question?: string;
  answer?: string;
}

interface FaqAccordionProps {
  locale: Locale;
  dict: Dictionary;
  initialFaqs?: FaqItem[];
}

const DEMO_FAQS: FaqItem[] = [
  {
    question_ar: "ما هي أنواع الزجاج المتوفرة لديكم؟",
    question_en: "What types of glass do you offer?",
    answer_ar: "نوفر مجموعة واسعة من أنواع الزجاج تشمل: الزجاج السكريت (المقوى)، الزجاج العاكس، الزجاج العازل المزدوج، الزجاج اللامنيت، الزجاج الملون، وزجاج الشاور. جميع منتجاتنا مطابقة للمعايير السعودية والدولية.",
    answer_en: "We offer a wide range of glass types including: tempered (securit) glass, reflective glass, double insulated glass, laminated glass, colored glass, and shower glass. All our products comply with Saudi and international standards.",
  },
  {
    question_ar: "هل تقدمون خدمة القياس والتركيب؟",
    question_en: "Do you provide measurement and installation services?",
    answer_ar: "نعم، نقدم خدمة شاملة تبدأ من زيارة الموقع والقياس الدقيق، مرورًا بالتصنيع حسب المواصفات، وانتهاءً بالتركيب الاحترافي مع ضمان شامل على جميع أعمالنا.",
    answer_en: "Yes, we provide a comprehensive service starting from site visits and precise measurements, through manufacturing to specifications, and ending with professional installation with a comprehensive warranty on all our work.",
  },
  {
    question_ar: "ما هي مدة الضمان على أعمالكم؟",
    question_en: "What is the warranty period on your work?",
    answer_ar: "نقدم ضمانًا شاملاً يتراوح من 5 إلى 10 سنوات حسب نوع المنتج والخدمة. يشمل الضمان عيوب التصنيع والتركيب، مع توفير خدمة صيانة دورية اختيارية.",
    answer_en: "We offer a comprehensive warranty ranging from 5 to 10 years depending on the product type and service. The warranty covers manufacturing and installation defects, with optional periodic maintenance service.",
  },
  {
    question_ar: "هل يمكنكم تنفيذ مشاريع كبيرة للشركات والمجمعات؟",
    question_en: "Can you handle large projects for companies and complexes?",
    answer_ar: "بالتأكيد، لدينا خبرة واسعة في تنفيذ المشاريع الكبرى للقطاعين الحكومي والخاص. نمتلك فريقًا متخصصًا ومعدات حديثة تمكننا من تنفيذ مشاريع بأي حجم وبأعلى معايير الجودة.",
    answer_en: "Absolutely, we have extensive experience in executing major projects for both government and private sectors. We have a specialized team and modern equipment that enable us to execute projects of any size with the highest quality standards.",
  },
  {
    question_ar: "كيف يمكنني الحصول على عرض سعر؟",
    question_en: "How can I get a price quote?",
    answer_ar: "يمكنك الحصول على عرض سعر مجاني من خلال: التواصل معنا عبر واتساب، ملء نموذج طلب عرض السعر على الموقع، الاتصال المباشر بنا، أو التحدث مع المساعد الذكي. سنقوم بالرد خلال 24 ساعة.",
    answer_en: "You can get a free quote through: contacting us via WhatsApp, filling out the quote request form on the website, calling us directly, or chatting with our AI assistant. We will respond within 24 hours.",
  },
];

export function FaqAccordion({ locale, dict, initialFaqs }: FaqAccordionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const isRtl = locale === "ar";

  const faqs = (initialFaqs && initialFaqs.length > 0) ? initialFaqs : DEMO_FAQS;

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="relative py-20 sm:py-28 bg-surface overflow-hidden"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/50 mb-4">
            <HelpCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
              {dict.faq.title}
            </span>
          </div>
          <h2 id="faq-heading" className="text-3xl sm:text-4xl font-bold mb-4">
            {dict.faq.title}
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            {dict.faq.subtitle}
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const qText = faq.question || (isRtl ? faq.question_ar : faq.question_en) || faq.question_ar;
            const aText = faq.answer || (isRtl ? faq.answer_ar : faq.answer_en) || faq.answer_ar;

            return (
              <motion.div
                key={faq.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className={cn(
                  "rounded-xl border transition-all duration-300",
                  isOpen
                    ? "border-primary-200 dark:border-primary-800 bg-surface-elevated shadow-md"
                    : "border-border-light bg-background hover:border-border"
                )}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-start"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                >
                  <span className="font-semibold text-base sm:text-lg">
                    {qText}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-text-tertiary shrink-0 transition-transform duration-300",
                      isOpen && "rotate-180 text-primary-600"
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${index}`}
                      role="region"
                      aria-labelledby={`faq-question-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-text-secondary leading-relaxed">
                        {aText}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
