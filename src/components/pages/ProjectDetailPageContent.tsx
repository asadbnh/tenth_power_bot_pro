"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin, Calendar, CheckCircle2, ArrowRight,
  Building2, ChevronLeft, Images, ShieldCheck, Maximize2, X, PlayCircle
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

  const projectVideos: { id: string; video_url: string; thumbnail_url: string | null; title_ar: string | null; title_en: string | null }[] =
    (project.project_videos as any[]) || [];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const currentImage = galleryImages[activeImageIndex]?.url || initialCover;

  return (
    <div className="pt-[var(--header-height)] min-h-dvh bg-gradient-to-b from-background to-surface">
      {/* Architectural Hero */}
      <section className="relative py-16 sm:py-24 bg-slate-50 dark:bg-[#070d1e] overflow-hidden text-slate-900 dark:text-white border-b border-slate-200/80 dark:border-amber-500/15 transition-colors duration-300">
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ 
            backgroundImage: "linear-gradient(rgba(212,175,55,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.25) 1px, transparent 1px)", 
            backgroundSize: "44px 44px" 
          }} 
        />
        <div className="absolute top-1/3 end-1/4 w-[32rem] h-[32rem] bg-amber-500/10 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-transparent to-slate-50 dark:from-[#070d1e]/80 dark:via-transparent dark:to-[#070d1e] pointer-events-none transition-colors duration-300" />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/60 mb-6 font-medium">
            <Link href={`/${locale}`} className="hover:text-slate-900 dark:hover:text-white transition-colors">{isRtl ? "الرئيسية" : "Home"}</Link>
            <ChevronLeft className={cn("w-3 h-3", !isRtl && "rotate-180")} />
            <Link href={`/${locale}/projects`} className="hover:text-slate-900 dark:hover:text-white transition-colors">{dict.projects.title}</Link>
            <ChevronLeft className={cn("w-3 h-3", !isRtl && "rotate-180")} />
            <span className="text-amber-700 dark:text-amber-300 font-semibold">{name}</span>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {category && (
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-800 dark:text-amber-300 backdrop-blur-md shadow-xs">
                  <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  {category}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/5 dark:bg-white/10 text-xs font-semibold text-slate-700 dark:text-white/80 border border-slate-200/80 dark:border-white/15 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {isRtl ? "كود البناء السعودي SBC" : "SBC Compliant"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/5 dark:bg-white/10 text-xs font-semibold text-slate-700 dark:text-white/80 border border-slate-200/80 dark:border-white/15 shadow-xs">
                {isRtl ? "ضمان 10 سنوات" : "10-Year Warranty"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight text-slate-900 dark:text-white">
              {name}
            </h1>
            
            <div className="flex flex-wrap gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-2 font-medium">
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>{location}</span>
                </div>
              )}
              {project.year && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
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

        {/* ─── Project Videos Section from project_videos DB ─────────────────── */}
        {projectVideos.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xl font-extrabold text-text-primary">
              <PlayCircle className="w-6 h-6 text-accent-500" />
              <h2>{isRtl ? `فيديوهات المشروع (${projectVideos.length})` : `Project Videos (${projectVideos.length})`}</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {projectVideos.map((vid) => {
                const isYouTube = /youtube\.com|youtu\.be/.test(vid.video_url);
                const isVimeo = /vimeo\.com/.test(vid.video_url);
                const videoTitle = isRtl ? (vid.title_ar || "فيديو مشروع") : (vid.title_en || vid.title_ar || "Project Video");

                // Build embeddable URL
                let embedUrl = vid.video_url;
                if (isYouTube) {
                  const ytId = vid.video_url.match(/(?:v=|youtu\.be\/)([\w-]{11})/)?.[1];
                  if (ytId) embedUrl = `https://www.youtube.com/embed/${ytId}?rel=0`;
                } else if (isVimeo) {
                  const vimeoId = vid.video_url.match(/vimeo\.com\/(\d+)/)?.[1];
                  if (vimeoId) embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
                }

                return (
                  <div key={vid.id} className="rounded-2xl overflow-hidden border border-border-light shadow-sm bg-surface-elevated">
                    {isYouTube || isVimeo ? (
                      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                        <iframe
                          src={embedUrl}
                          title={videoTitle}
                          className="absolute inset-0 w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <video
                        src={vid.video_url}
                        controls
                        poster={vid.thumbnail_url || undefined}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    {videoTitle && (
                      <div className="px-4 py-2.5">
                        <p className="text-sm font-semibold text-text-primary">{videoTitle}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
              <Link 
                href={`/${locale}/quote?project=${slug}`}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-primary-950 font-extrabold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-amber-500/20"
              >
                <span>{isRtl ? "طلب دراسة مشروع مماثل" : "Request Similar Project"}</span>
                <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
              </Link>

              <a 
                href={`https://wa.me/966532438253?text=${encodeURIComponent(isRtl ? `السلام عليكم ورحمة الله، أود الاستفسار عن تفاصيل تنفيذ مشروع (${name}) وإمكانية عمل دراسة ومعاينة لمشروع مماثل.` : `Hello, I'd like to inquire about project (${name}).`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 font-bold text-xs transition-all"
              >
                <span>{isRtl ? "استفسر عبر الواتساب فوراً" : "WhatsApp Inquiry"}</span>
              </a>

              <Link 
                href={`/${locale}/appointments?project=${slug}`}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface hover:bg-surface-elevated text-text-primary border border-border-light font-semibold text-xs transition-all"
              >
                <Calendar className="w-4 h-4 text-amber-500" />
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
