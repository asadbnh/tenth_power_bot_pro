"use client";

import Link from "next/link";
import {
  MapPin, Calendar, CheckCircle2, ArrowRight,
  Building2, ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface ProjectDetail {
  slug: string;
  name_ar: string;
  name_en: string;
  category_ar: string;
  category_en: string;
  location_ar: string;
  location_en: string;
  year: string;
  client_ar: string;
  client_en: string;
  description_ar: string;
  description_en: string;
  challenges_ar: string[];
  challenges_en: string[];
  results_ar: string[];
  results_en: string[];
}

const PROJECTS_DATA: Record<string, ProjectDetail> = {
  "king-abdullah-tower": {
    slug: "king-abdullah-tower",
    name_ar: "برج الملك عبد الله التجاري",
    name_en: "King Abdullah Commercial Tower",
    category_ar: "واجهات زجاجية",
    category_en: "Glass Facades",
    location_ar: "الرياض - طريق الملك فهد",
    location_en: "Riyadh - King Fahd Road",
    year: "2024",
    client_ar: "شركة تطوير العقار القابضة",
    client_en: "Real Estate Development Co.",
    description_ar: "تم تنفيذ واجهة زجاجية هيكلية بمساحة 4,500 متر مربع باستخدام زجاج سكريت دبل معزول بطلاء منخفض الانبعاثات (Low-E)، مما قلل استهلاك الطاقة للتبريد بنسبة 35% وخلق مظهراً معمارياً أيقونياً.",
    description_en: "Execution of a 4,500 sqm structural glazing facade using double tempered Low-E glass, reducing cooling energy consumption by 35% and creating an iconic architectural statement.",
    challenges_ar: ["مقاومة أحمال الرياح العالية بارتفاع 30 طابقاً", "تركيب الزجاج بدون تعطيل الحركة المرورية في طريق الملك فهد", "عزل حراري صارم يتوافق مع كود البناء السعودي"],
    challenges_en: ["High wind load resistance at 30-story height", "Installation without interrupting traffic on King Fahd Road", "Strict thermal insulation compliance with Saudi Building Code"],
    results_ar: ["تسليم المشروع قبل الموعد المحدد بـ 15 يوماً", "تحقيق خفض بـ 35% في استهلاك تكييف الهواء", "شهادة جودة واعتماد من الاستشاري الهندسي للمشروع"],
    results_en: ["Delivered 15 days ahead of schedule", "Achieved 35% HVAC energy reduction", "Quality certification from lead engineering consultant"]
  }
};

interface Props {
  slug: string;
  locale: Locale;
  dict: Dictionary;
}

export function ProjectDetailPageContent({ slug, locale, dict }: Props) {
  const isRtl = locale === "ar";
  const project = PROJECTS_DATA[slug] || {
    slug,
    name_ar: isRtl ? "مشروع تجاري متميز" : "Premium Commercial Project",
    name_en: "Premium Commercial Project",
    category_ar: isRtl ? "مقاولات وزجاج" : "Contracting & Glass",
    category_en: "Contracting & Glass",
    location_ar: isRtl ? "الرياض - المملكة العربية السعودية" : "Riyadh - Saudi Arabia",
    location_en: "Riyadh - Saudi Arabia",
    year: "2024",
    client_ar: isRtl ? "عميل مرموق" : "Prestigious Client",
    client_en: "Prestigious Client",
    description_ar: "تنفيذ وتصميم الأعمال بأعلى المعايير الهندسية والجمالية مع الالتزام بالدقة والمواعيد المحددة.",
    description_en: "Execution and design of architectural works using top engineering standards with strict deadline commitment.",
    challenges_ar: ["الالتزام بالجدول الزمني الضيق", "مطابقة أعلى المواصفات القياسية والمعمارية"],
    challenges_en: ["Adhering to tight timeline constraints", "Meeting high architectural standards"],
    results_ar: ["تنفيذ تسليم كلي بدون ملاحظات", "رضا تام من العميل والجهة المشرفة"],
    results_en: ["Zero-defect project handover", "100% client satisfaction"]
  };

  return (
    <div className="pt-[var(--header-height)] min-h-dvh bg-gradient-to-b from-background to-surface">
      {/* Hero */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-br from-primary-950 via-[#0c1445] to-primary-900 overflow-hidden text-white">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-white/60 mb-6">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">{isRtl ? "الرئيسية" : "Home"}</Link>
            <ChevronLeft className={cn("w-3 h-3", !isRtl && "rotate-180")} />
            <Link href={`/${locale}/projects`} className="hover:text-white transition-colors">{dict.projects.title}</Link>
            <ChevronLeft className={cn("w-3 h-3", !isRtl && "rotate-180")} />
            <span className="text-white font-medium">{isRtl ? project.name_ar : project.name_en}</span>
          </div>

          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-primary-200 backdrop-blur-md">
              <Building2 className="w-3.5 h-3.5" />
              {isRtl ? project.category_ar : project.category_en}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
              {isRtl ? project.name_ar : project.name_en}
            </h1>
            
            <div className="flex flex-wrap gap-6 text-xs sm:text-sm text-white/80 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent-400" />
                <span>{isRtl ? project.location_ar : project.location_en}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent-400" />
                <span>{project.year}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main details */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-extrabold">{isRtl ? "تفاصيل المشروع" : "Project Details"}</h2>
            <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
              {isRtl ? project.description_ar : project.description_en}
            </p>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold">{isRtl ? "التحديات ومتطلبات التنفيذ" : "Challenges & Requirements"}</h3>
              <div className="space-y-2">
                {(isRtl ? project.challenges_ar : project.challenges_en).map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{isRtl ? "النتائج والإنجازات" : "Results & Accomplishments"}</h3>
              <div className="space-y-2">
                {(isRtl ? project.results_ar : project.results_en).map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-surface-elevated rounded-3xl border border-border-light p-6 space-y-6 self-start">
            <h3 className="text-lg font-bold border-b border-border-light pb-3">{isRtl ? "بطاقة المشروع" : "Project Summary"}</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-text-tertiary">{isRtl ? "العميل" : "Client"}</p>
                <p className="font-semibold text-text-primary">{isRtl ? project.client_ar : project.client_en}</p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">{isRtl ? "الموقع" : "Location"}</p>
                <p className="font-semibold text-text-primary">{isRtl ? project.location_ar : project.location_en}</p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">{isRtl ? "سنة الإنجاز" : "Completion Year"}</p>
                <p className="font-semibold text-text-primary">{project.year}</p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">{isRtl ? "نوع الخدمة" : "Category"}</p>
                <p className="font-semibold text-text-primary">{isRtl ? project.category_ar : project.category_en}</p>
              </div>
            </div>
            
            <Link href={`/${locale}/quote`}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 active:scale-95 transition-all">
              {isRtl ? "اطلب مشروعاً مشابهاً" : "Request Similar Project"}
              <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
