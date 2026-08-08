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
      title_ar: "الدراسة الفنية وتحديد النطاق",
      title_en: "Technical Study & Scope",
      desc_ar: "استلام مواصفات المشروع وتحديد المتطلبات المعمارية بدقة متناهية وإعداد التقدير الفني المعتمد.",
      desc_en: "Receiving specifications, setting architectural requirements, and issuing technical estimate.",
    },
    {
      step: "02",
      icon: Ruler,
      title_ar: "الرفع المساحي والتصميم 3D",
      title_en: "Site Survey & 3D Engineering",
      desc_ar: "زيارة هندسية ميدانية للموقع لرفع المقاسات بالليزر واقتراح النماذج ثلاثية الأبعاد.",
      desc_en: "On-site laser measurements and engineering 3D architectural modeling.",
    },
    {
      step: "03",
      icon: Hammer,
      title_ar: "التصنيع وتجهيز المواد",
      title_en: "Fabrication & Assembly",
      desc_ar: "تصنيع وتجهيز الأنظمة الزجاجية والألمنيوم في خطوط إنتاجنا المعتمدة وفق مواصفات SBC.",
      desc_en: "Precision manufacturing of glass & aluminum systems according to SBC codes.",
    },
    {
      step: "04",
      icon: ShieldCheck,
      title_ar: "التركيب الميداني والتسليم الفني",
      title_en: "Field Installation & Handover",
      desc_ar: "التركيب الفني الميداني وإجراء اختبارات العزل وتسليم شهادات الاعتماد والضمان المعتمد.",
      desc_en: "Professional field mounting, insulation verification, and final quality sign-off.",
    },
  ];

  return (
    <section className="py-6 sm:py-16 bg-surface border-b border-border-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-10 space-y-1.5">
          <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950 text-xs font-semibold text-primary-600 dark:text-primary-300">
            {isRtl ? "آلية العمل الهندسية" : "Engineering Workflow"}
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold">
            {isRtl ? "مراحل تنفيذ المشروع من الدراسة حتى التسليم" : "Engineering Execution Methodology"}
          </h2>
          <p className="text-text-secondary text-xs sm:text-sm">
            {isRtl
              ? "منهجية عمل دقيقة تضمن أعلى معايير الجودة والالتزام التام بالمخططات والجداول الزمنية"
              : "Methodical workflow guaranteeing strict deadlines and peak engineering execution"}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative rounded-xl border border-border-light bg-surface-elevated p-3 sm:p-5 space-y-1.5 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-xs sm:text-base font-bold group-hover:text-primary-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                      {isRtl ? step.title_ar : step.title_en}
                    </h3>
                  </div>
                  <span className="text-xs sm:text-lg font-black text-text-tertiary opacity-40 shrink-0">{step.step}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-text-secondary leading-relaxed line-clamp-2">
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
