"use client";

import { motion } from "framer-motion";
import { MessageSquare, Ruler, Hammer, ShieldCheck } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

interface Props {
  locale: Locale;
}

export function BusinessProcess({ locale }: Props) {
  const isRtl = locale === "ar";

  const STEPS = [
    {
      step: "01",
      icon: MessageSquare,
      title_ar: "الاستشارة وطلب السعر",
      title_en: "Consultation & Quote",
      desc_ar: "نستقبل طلبك ونحدد المتطلبات المعمارية بدقة مع تقديم عرض سعر تقديري مجاني خلال 24 ساعة.",
      desc_en: "We receive your request and define specifications with a free estimate within 24 hours.",
    },
    {
      step: "02",
      icon: Ruler,
      title_ar: "رفع المقاسات والتصميم 3D",
      title_en: "Site Survey & 3D Design",
      desc_ar: "يقوم فريقنا الهندسي بزيارة الموقع لرفع المقاسات بالليزر واقتراح نماذج ثلاثية الأبعاد.",
      desc_en: "Our engineers visit the site for laser measurements and present realistic 3D models.",
    },
    {
      step: "03",
      icon: Hammer,
      title_ar: "التصنيع والتنفيذ الفني",
      title_en: "Fabrication & Execution",
      desc_ar: "تجهيز الزجاج والألمنيوم في مصانعنا المجهزة بأحدث أفران السكريت وآلات التقطيع بالليزر.",
      desc_en: "Fabricating glass & aluminum in our factories equipped with tempering ovens and laser cutters.",
    },
    {
      step: "04",
      icon: ShieldCheck,
      title_ar: "التركيب والتسليم بالضمان",
      title_en: "Installation & Warranty",
      desc_ar: "تركيب احترافي في الموقع واختبار العزل الحراري والمائي وتسليم شهادة الضمان الـ 10 سنوات.",
      desc_en: "Professional installation, insulation testing, and issuance of the 10-year written warranty.",
    },
  ];

  return (
    <section className="py-20 bg-surface border-b border-border-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100 dark:bg-primary-950 text-xs font-semibold text-primary-600 dark:text-primary-300">
            {isRtl ? "آلية العمل" : "How We Work"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            {isRtl ? "رحلة إنجاز مشروعك من الفكرة حتى التسليم" : "Four Steps to Architectural Excellence"}
          </h2>
          <p className="text-text-secondary text-sm sm:text-base">
            {isRtl
              ? "خطوات منهجية مدروسة تضمن أعلى معايير الجودة والالتزام التام بالجدول الزمني"
              : "Methodical workflow guaranteeing strict deadlines and peak engineering execution"}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-3xl border border-border-light bg-surface-elevated p-6 space-y-4 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-text-tertiary opacity-40">{step.step}</span>
                </div>
                <h3 className="text-lg font-bold group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {isRtl ? step.title_ar : step.title_en}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {isRtl ? step.desc_ar : step.desc_en}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
