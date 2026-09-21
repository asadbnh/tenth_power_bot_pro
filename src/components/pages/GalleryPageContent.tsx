"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, ZoomIn, ChevronRight, ChevronLeft, Sparkles, Camera, ShieldCheck, CheckCircle2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

import { SmartFallbackImage } from "@/components/ui/SmartFallbackImage";
import { PageHeroBackground } from "@/components/ui/PageHeroBackground";
import { SkeletonGalleryAlbums, SkeletonGalleryCard } from "@/components/ui/Skeleton";

interface Props {
  locale: Locale;
  dict: Dictionary;
  initialAlbums?: any[];
  initialItems?: any[];
}

const DEFAULT_ALBUMS = [
  { id: 1, slug: "facades", title_ar: "الواجهات والاستركشر", title_en: "Curtain Walls & Facades", count: 24, image_url: "/images/defaults/services/glass-facades.webp" },
  { id: 2, slug: "glass", title_ar: "زجاج السيكوريت والقواطع", title_en: "Tempered Glass & Partitions", count: 32, image_url: "/images/defaults/services/tempered-glass.webp" },
  { id: 3, slug: "aluminum", title_ar: "قطاعات الألمنيوم المعزولة", title_en: "Thermal-Break Aluminum", count: 18, image_url: "/images/defaults/services/aluminum-works.webp" },
  { id: 4, slug: "showers", title_ar: "كبائن الشاور الزجاجية", title_en: "Frameless Shower Cabins", count: 28, image_url: "/images/defaults/projects/project-2.webp" },
  { id: 5, slug: "mirrors", title_ar: "المرايا والزجاج الديكوري", title_en: "LED Mirrors & Decor Glass", count: 41, image_url: "/images/defaults/services/decorations.webp" },
  { id: 6, slug: "doors", title_ar: "الأبواب السحاب والأوتوماتيك", title_en: "Automatic & Sliding Doors", count: 15, image_url: "/images/defaults/services/doors-windows.webp" },
];

const DEFAULT_ITEMS = [
  { id: "1", title_ar: "برج تجاري - واجهة استركشر دبل جلاس 24مم معزولة حرارياً", title_en: "Commercial Tower - 24mm Double Glazed Structural Facade", image_url: "/images/defaults/projects/project-1.webp", album_id: "1" },
  { id: "2", title_ar: "فواصل مكاتب إدارية زجاج سيكوريت 12مم عازل للصوت", title_en: "12mm Tempered Glass Acoustic Office Partitions", image_url: "/images/defaults/services/tempered-glass.webp", album_id: "2" },
  { id: "3", title_ar: "واجهة فيلا سكنية فاخرة قطاع ألمنيوم كسر حراري وزجاج سيكوريت", title_en: "Luxury Villa Facade - Thermal Break Aluminum & Securit Glass", image_url: "/images/defaults/projects/project-2.webp", album_id: "3" },
  { id: "4", title_ar: "نوافذ ألمنيوم معزولة حرارياً نظام سرايا الجامبو", title_en: "Thermal Break Aluminum Windows - Saraya Jumbo System", image_url: "/images/defaults/services/aluminum-works.webp", album_id: "3" },
  { id: "5", title_ar: "كابينة شاور زجاجية فخمة بدون إطار Frameless مع اكسسوارات استيل 316", title_en: "Frameless Luxury Glass Shower Cabin with SS316 Hardware", image_url: "/images/defaults/projects/project-2.webp", album_id: "4" },
  { id: "6", title_ar: "مرايا جدارية ليد فاخرة مع إنارة دافئة مخفية", title_en: "Bespoke Backlit Wall LED Mirror with Warm Concealed Light", image_url: "/images/defaults/services/decorations.webp", album_id: "5" },
  { id: "7", title_ar: "أبواب زجاجية أوتوماتيكية سحب ذكية للمحلات والمعارض", title_en: "Automatic Sliding Glass Doors for Retail Storefronts", image_url: "/images/defaults/services/doors-windows.webp", album_id: "6" },
  { id: "8", title_ar: "واجهة معرض تجاري زجاج سيكوريت 12مم بماكينات إيطالية معتمدة", title_en: "Commercial Showroom Glass Facade with Italian Floor Springs", image_url: "/images/defaults/services/glass-facades.webp", album_id: "1" },
  { id: "9", title_ar: "قواطع زجاجية ذكية Smart Glass قابلة للتحكم في الشفافية", title_en: "Smart Privacy Switchable Glass Partitions", image_url: "/images/defaults/services/tempered-glass.webp", album_id: "2" },
];

export function GalleryPageContent({ locale, dict: _dict, initialAlbums, initialItems }: Props) {
  const isRtl = locale === "ar";
  const [selectedView, setSelectedView] = useState<"albums" | "grid">("grid");
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(t);
  }, []);

  const rawAlbums = (initialAlbums && initialAlbums.length > 0) ? initialAlbums : DEFAULT_ALBUMS;
  const rawItems = (initialItems && initialItems.length > 0) ? initialItems : DEFAULT_ITEMS;
  const albums = Array.from(new Map(rawAlbums.map((a) => [String(a.id), a])).values());
  const items = Array.from(new Map(rawItems.map((it) => [String(it.id), it])).values());

  const visibleItems = selectedAlbumId
    ? items.filter((it) => String(it.album_id) === String(selectedAlbumId))
    : items;

  const displayItems = visibleItems.length > 0 ? visibleItems : items;

  const activeItem = activeLightboxIndex !== null ? displayItems[activeLightboxIndex] : null;

  return (
    <div className="pt-[var(--header-height)]">
      {/* Architectural Gallery Hero */}
      <section className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 bg-slate-50 dark:bg-[#070d1e] overflow-hidden border-b border-slate-200/80 dark:border-amber-500/10 transition-colors duration-300">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageHeroBackground pageKey="gallery" overlayOpacity={0.4} />
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[20rem] bg-gradient-to-r from-amber-500/15 via-blue-600/10 to-amber-400/10 rounded-full blur-[100px]" />
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{ 
              backgroundImage: "linear-gradient(rgba(212,175,55,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.25) 1px, transparent 1px)", 
              backgroundSize: "36px 36px" 
            }} 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/85 via-slate-50/75 to-slate-50 dark:from-[#070d1e]/85 dark:via-[#070d1e]/75 dark:to-[#070d1e] transition-colors duration-300" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-5">
          {/* Breadcrumbs Navigation */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Link href={`/${locale}`} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              {isRtl ? "الرئيسية" : "Home"}
            </Link>
            <ChevronLeft className={cn("w-3 h-3 text-slate-400 dark:text-slate-500", !isRtl && "rotate-180")} />
            <span className="text-amber-600 dark:text-amber-400/90 font-medium">
              {isRtl ? "معرض الأعمال والوسائط" : "Media & Project Gallery"}
            </span>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-white/5 backdrop-blur-md border border-amber-500/30 shadow-sm"
          >
            <Camera className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-200/90 tracking-wide">
              {isRtl ? "ألبوم التوثيق الميداني عالي الدقة (4K) • مشاريع معتمدة" : "High-Definition Architectural Portfolio • Verified Projects"}
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight"
          >
            {isRtl ? (
              <>
                معرض التفاصيل البصرية و{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-[#F3E7C4] dark:via-[#E5C378] dark:to-[#C99E32]">
                  الهندسة المعمارية المنفذة
                </span>
              </>
            ) : (
              <>
                Visual Architectural &{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-[#F3E7C4] dark:via-[#E5C378] dark:to-[#C99E32]">
                  Engineering Portfolio
                </span>
              </>
            )}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            {isRtl
              ? "استكشف لقطات التنفيذ الميدانية لأعمال الزجاج السيكوريت، واجهات الاستركشر، فواصل المكاتب وكبائن الشاور المنفذة بالمملكة."
              : "High-definition photo gallery of structural glazing, securit partitions, and custom aluminum installations across Saudi Arabia."}
          </motion.p>

          {/* Technical Trust & Media Stats Matrix */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-none text-xs text-slate-700 dark:text-slate-300 transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              {isRtl ? "توثيق فوتوغرافي معتمد من مواقع العمل" : "Verified Field Photography"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-none text-xs text-slate-700 dark:text-slate-300 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              {isRtl ? "مشاريع سكنية وتجارية موثقة" : "Residential & Commercial"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-none text-xs text-slate-700 dark:text-slate-300 transition-colors">
              <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              {isRtl ? "تفاصيل دقيقة للقطاعات والملحقات" : "Detailed Profile Close-ups"}
            </span>
          </div>
        </div>
      </section>

      {/* View Toggle Bar */}
      <div className="bg-surface-elevated border-b border-border-light sticky top-[var(--header-height)] z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {(["grid", "albums"] as const).map((view) => (
              <button 
                key={view} 
                onClick={() => setSelectedView(view)}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all",
                  selectedView === view 
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-primary-950 shadow-md shadow-amber-500/20" 
                    : "text-text-secondary hover:bg-surface border border-transparent hover:border-border-light"
                )}
              >
                {view === "grid" ? (isRtl ? "عرض شبكة الصور" : "Grid View") : (isRtl ? "ألبومات المشاريع" : "Albums")}
              </button>
            ))}
          </div>

          <span className="text-xs text-text-tertiary font-bold">
            {isRtl ? `إجمالي الصور المعروضة: ${displayItems.length}` : `Total Photos: ${displayItems.length}`}
          </span>
        </div>
      </div>

      {/* Main Gallery Area */}
      <div className="py-12 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Filter Pills (Shown in Grid View) */}
          {selectedView === "grid" && (
            <div className="flex overflow-x-auto no-scrollbar scroll-smooth items-center gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
              <button
                onClick={() => setSelectedAlbumId(null)}
                className={cn(
                  "px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap",
                  selectedAlbumId === null
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-primary-950 shadow-md shadow-amber-500/20"
                    : "bg-surface-elevated text-text-secondary border border-border-light hover:text-text-primary"
                )}
              >
                {isRtl ? `كافة الصور (${items.length})` : `All Photos (${items.length})`}
              </button>
              {albums.map((album) => {
                const isSelected = selectedAlbumId === String(album.id);
                return (
                  <button
                    key={album.id}
                    onClick={() => setSelectedAlbumId(String(album.id))}
                    className={cn(
                      "px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap",
                      isSelected
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-primary-950 shadow-md shadow-amber-500/20"
                        : "bg-surface-elevated text-text-secondary border border-border-light hover:text-text-primary"
                    )}
                  >
                    {isRtl ? album.title_ar : album.title_en}
                  </button>
                );
              })}
            </div>
          )}

          {isLoading ? (
            selectedView === "albums" ? (
              <SkeletonGalleryAlbums count={6} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <SkeletonGalleryCard key={i} className="h-64" />
                ))}
              </div>
            )
          ) : selectedView === "albums" ? (
            /* Albums View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album, i) => (
                <motion.div 
                  key={album.id || i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  onClick={() => {
                    setSelectedAlbumId(String(album.id));
                    setSelectedView("grid");
                  }}
                  className="group cursor-pointer rounded-3xl overflow-hidden border border-border-light hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 bg-surface-elevated"
                >
                  <div className="h-52 relative overflow-hidden bg-surface">
                    <SmartFallbackImage 
                      src={album.image_url}
                      alt={album.title_ar}
                      aspectRatio="auto"
                      title={isRtl ? album.title_ar : album.title_en}
                      badge={`${album.count || 12} ${isRtl ? "صورة" : "photos"}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-extrabold text-base text-text-primary group-hover:text-amber-500 transition-colors">
                      {isRtl ? album.title_ar : album.title_en}
                    </h3>
                    <p className="text-xs text-text-tertiary mt-1 font-medium">
                      {isRtl ? "اضغط لاستعراض صور الألبوم" : "Click to view album photos"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayItems.map((item, i) => {
                const title = (isRtl ? item.title_ar : item.title_en) || (isRtl ? "صورة معمارية" : "Architectural Photo");
                return (
                  <motion.div 
                    key={item.id || i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    onClick={() => setActiveLightboxIndex(i)}
                    className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer bg-surface border border-border-light hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300"
                  >
                    <SmartFallbackImage 
                      src={item.image_url || item.thumbnail_url}
                      alt={title}
                      aspectRatio="auto"
                      title={title}
                      badge={isRtl ? "صورة معمارية" : "Architectural"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Hover Overlay with details */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070d1e]/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-5">
                      <div className="self-end">
                        <span className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                          <ZoomIn className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-amber-300">
                          {isRtl ? "مؤسسة القوة العاشرة" : "Tenth Power"}
                        </p>
                        <p className="text-sm font-extrabold text-white line-clamp-2">
                          {title}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Advanced Architectural Lightbox */}
      <AnimatePresence>
        {activeItem && activeLightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6"
            onClick={() => setActiveLightboxIndex(null)}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between text-white z-10" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-0.5">
                <span className="text-xs text-amber-400 font-bold">
                  {isRtl ? `صورة ${activeLightboxIndex + 1} من ${displayItems.length}` : `Photo ${activeLightboxIndex + 1} of ${displayItems.length}`}
                </span>
                <p className="text-sm sm:text-base font-extrabold text-white line-clamp-1">
                  {(isRtl ? activeItem.title_ar : activeItem.title_en) || ""}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`https://wa.me/966532438253?text=${encodeURIComponent(isRtl ? `السلام عليكم، أود الاستفسار عن تفاصيل تنفيذ هذا العمل المعماري: ${(activeItem.title_ar || "")}` : `Hello, I'd like to inquire about this work.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#25D366]/90 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isRtl ? "استفسر عن هذا العمل بالواتساب" : "Inquire via WhatsApp"}</span>
                </a>

                <button 
                  onClick={() => setActiveLightboxIndex(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label={isRtl ? "إغلاق" : "Close"}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Main Image Container */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden py-4" onClick={(e) => e.stopPropagation()}>
              {displayItems.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveLightboxIndex((prev) => (prev! - 1 + displayItems.length) % displayItems.length)}
                    className="absolute start-2 sm:start-6 z-10 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors border border-white/20"
                    aria-label={isRtl ? "السابق" : "Previous"}
                  >
                    <ChevronRight className={cn("w-6 h-6", !isRtl && "rotate-180")} />
                  </button>
                  <button
                    onClick={() => setActiveLightboxIndex((prev) => (prev! + 1) % displayItems.length)}
                    className="absolute end-2 sm:end-6 z-10 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors border border-white/20"
                    aria-label={isRtl ? "التالي" : "Next"}
                  >
                    <ChevronLeft className={cn("w-6 h-6", !isRtl && "rotate-180")} />
                  </button>
                </>
              )}

              <motion.img 
                key={activeItem.image_url}
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={activeItem.image_url || activeItem.thumbnail_url} 
                alt={activeItem.title_ar || "Enlarged"} 
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl" 
              />
            </div>

            {/* Bottom Info Bar */}
            <div className="text-center text-xs text-white/60 z-10">
              <span>{isRtl ? "مؤسسة القوة العاشرة • تنفيذ الواجهات الزجاجية والألمنيوم بالرياض • هاتف: 0532438253" : "Tenth Power • Glazing & Facades Execution in Riyadh"}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

