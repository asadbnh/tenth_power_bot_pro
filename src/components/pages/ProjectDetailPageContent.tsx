"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin, Calendar, CheckCircle2, ArrowRight,
  Building2, ChevronLeft, Images, ShieldCheck, Maximize2, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

import { AnimatedCanvasBanner } from "@/components/ui/AnimatedCanvasBanner";

interface Props {
  slug: string;
  locale: Locale;
  dict: Dictionary;
  initialProject?: any;
}

export function ProjectDetailPageContent({ slug, locale, dict, initialProject }: Props) {
  const isRtl = locale === "ar";
  const project = initialProject || {
    slug,
    name_ar: isRtl ? "مشروع متميز" : "Featured Project",
    name_en: "Featured Project",
    category_ar: isRtl ? "مقاولات وزجاج" : "Contracting & Glass",
    category_en: "Contracting & Glass",
    location_ar: isRtl ? "الرياض - المملكة العربية السعودية" : "Riyadh - Saudi Arabia",
    location_en: "Riyadh - Saudi Arabia",
    year: "2024",
    client_ar: isRtl ? "عميل مميز" : "VIP Client",
    client_en: "VIP Client",
    description_ar: "تنفيذ وتصميم الأعمال بأعلى المعايير الهندسية والجمالية مع الالتزام بالدقة والمواعيد المحددة.",
    description_en: "Execution and design of architectural works using top engineering standards with strict deadline commitment.",
    challenges_ar: ["الالتزام بالجدول الزمني الضيق", "مطابقة أعلى المواصفات القياسية والمعمارية"],
    challenges_en: ["Adhering to tight timeline constraints", "Meeting high architectural standards"],
    results_ar: ["تنفيذ تسليم كلي بدون ملاحظات", "رضا تام من العميل والجهة المشرفة"],
    results_en: ["Zero-defect project handover", "100% client satisfaction"]
  };

  const name = isRtl ? (project.name_ar || project.title_ar || project.name) : (project.name_en || project.title_en || project.name_ar || project.name);
  const category = isRtl ? (project.category_ar || project.category) : (project.category_en || project.category_ar || project.category);
  const location = isRtl ? (project.location_ar || project.location) : (project.location_en || project.location_ar || project.location);
  const client = isRtl ? (project.client_ar || project.client_name) : (project.client_en || project.client_ar || project.client_name);
  const description = isRtl ? (project.description_ar || project.description) : (project.description_en || project.description_ar || project.description);
  const challenges: string[] = isRtl ? (project.challenges_ar || []) : (project.challenges_en || project.challenges_ar || []);
  const results: string[] = isRtl ? (project.results_ar || []) : (project.results_en || project.results_ar || []);
  const initialCover = project.cover_image_url || project.image_url;

  const galleryImages: { id: string; url: string; title_ar: string; title_en: string; is_cover?: boolean }[] =
    project.gallery_images && project.gallery_images.length > 0
      ? project.gallery_images
      : initialCover
      ? [{ id: "cover", url: initialCover, title_ar: name, title_en: name, is_cover: true }]
      : [];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const currentImage = galleryImages[activeImageIndex]?.url || initialCover;

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
            <span className="text-white font-medium">{name}</span>
          </div>

          <div className="space-y-4">
            {category && (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-primary-200 backdrop-blur-md">
                <Building2 className="w-3.5 h-3.5" />
                {category}
              </span>
            )}
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
              {name}
            </h1>
            
            <div className="flex flex-wrap gap-6 text-xs sm:text-sm text-white/80 pt-2">
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent-400" />
                  <span>{location}</span>
                </div>
              )}
              {project.year && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent-400" />
                  <span>{project.year}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main details */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Project Showcase Main Viewer */}
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border-light group bg-black/20">
            {currentImage ? (
              <div className="relative w-full h-[22rem] sm:h-[30rem] overflow-hidden">
                <img
                  src={currentImage}
                  alt={galleryImages[activeImageIndex]?.title_ar || name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-4 end-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold transition-all shadow-lg"
                  aria-label={isRtl ? "تكبير الصورة" : "Enlarge photo"}
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>{isRtl ? "عرض بحجم كامل" : "Full View"}</span>
                </button>
              </div>
            ) : (
              <AnimatedCanvasBanner 
                aspectRatio="wide"
                title={name}
                subtitle={location}
                badge={category || (isRtl ? "مشروع منفذ" : "Executed Project")}
                icon={<Building2 className="w-5 h-5" />}
              />
            )}
          </div>

          {/* Thumbnails Gallery Strip */}
          {galleryImages.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                <Images className="w-4 h-4 text-accent-500" />
                <span>{isRtl ? `معرض صور المشروع (${galleryImages.length} صور):` : `Project Gallery (${galleryImages.length} photos):`}</span>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {galleryImages.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={cn(
                      "relative shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden border-2 transition-all",
                      activeImageIndex === idx
                        ? "border-accent-500 scale-105 shadow-md shadow-accent-500/20"
                        : "border-border-light hover:border-text-tertiary opacity-70 hover:opacity-100"
                    )}
                  >
                    <img src={img.url} alt={img.title_ar || `صورة ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-extrabold">{isRtl ? "تفاصيل المشروع" : "Project Details"}</h2>
            <p className="text-text-secondary leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {description}
            </p>

            {/* Technical Specifications if provided in DB */}
            {project.specifications && typeof project.specifications === "object" && (
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-accent-500" />
                  <span>{isRtl ? "المواصفات الفنية المعتمدة" : "Technical Specifications"}</span>
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries(project.specifications).map(([key, val], idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-surface-elevated border border-border-light flex flex-col gap-1">
                      <span className="text-xs text-text-tertiary font-medium">{key}</span>
                      <span className="text-sm font-bold text-text-primary">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {challenges && challenges.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-bold">{isRtl ? "التحديات ومتطلبات التنفيذ" : "Challenges & Requirements"}</h3>
                <div className="space-y-2">
                  {challenges.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                      <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results && results.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{isRtl ? "النتائج والإنجازات" : "Results & Accomplishments"}</h3>
                <div className="space-y-2">
                  {results.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-surface-elevated rounded-3xl border border-border-light p-6 space-y-6 self-start">
            <h3 className="text-lg font-bold border-b border-border-light pb-3">{isRtl ? "بطاقة المشروع" : "Project Summary"}</h3>
            <div className="space-y-4 text-sm">
              {client && (
                <div>
                  <p className="text-xs text-text-tertiary">{isRtl ? "الجهة المشرفة / العميل" : "Client"}</p>
                  <p className="font-semibold text-text-primary">{client}</p>
                </div>
              )}
              {location && (
                <div>
                  <p className="text-xs text-text-tertiary">{isRtl ? "الموقع" : "Location"}</p>
                  <p className="font-semibold text-text-primary">{location}</p>
                </div>
              )}
              {project.year && (
                <div>
                  <p className="text-xs text-text-tertiary">{isRtl ? "سنة الإنجاز" : "Completion Year"}</p>
                  <p className="font-semibold text-text-primary">{project.year}</p>
                </div>
              )}
              {category && (
                <div>
                  <p className="text-xs text-text-tertiary">{isRtl ? "نوع الخدمة والتصنيف" : "Category"}</p>
                  <p className="font-semibold text-text-primary">{category}</p>
                </div>
              )}
              {project.project_value && (
                <div>
                  <p className="text-xs text-text-tertiary">{isRtl ? "قيمة المشروع التقديرية" : "Project Value"}</p>
                  <p className="font-semibold text-accent-600 dark:text-accent-400">
                    {Number(project.project_value).toLocaleString(isRtl ? "ar-SA" : "en-US")} {isRtl ? "ريال سعودي" : "SAR"}
                  </p>
                </div>
              )}
              {project.status && (
                <div>
                  <p className="text-xs text-text-tertiary">{isRtl ? "حالة التنفيذ" : "Status"}</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {project.status === "completed" ? (isRtl ? "مكتمل ومسلّم" : "Completed") : (isRtl ? "قيد التنفيذ" : "In Progress")}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-2.5 pt-2">
              <Link href={`/${locale}/quote`}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 active:scale-95 transition-all shadow-md">
                {isRtl ? "طلب دراسة مشروع مماثل" : "Request Similar Project"}
                <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
              </Link>

              <Link href={`/${locale}/appointments`}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface hover:bg-surface-elevated text-text-primary border border-border-light font-semibold text-xs transition-all">
                <Calendar className="w-4 h-4 text-accent-500" />
                <span>{isRtl ? "حجز معاينة هندسية مجانية" : "Book Free Site Survey"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && currentImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 end-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label={isRtl ? "إغلاق" : "Close"}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={currentImage} alt={name} className="w-full h-auto max-h-[85vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
