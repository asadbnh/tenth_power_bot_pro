"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

import { SmartFallbackImage } from "@/components/ui/SmartFallbackImage";
import { PageHeroBackground } from "@/components/ui/PageHeroBackground";

interface Props {
  locale: Locale;
  dict: Dictionary;
  initialItems?: any[];
}

const ALBUMS = [
  { id: 1, title_ar: "مشاريع الزجاج", title_en: "Glass Projects", count: 24, image_url: "/images/defaults/services/tempered-glass.webp" },
  { id: 2, title_ar: "أعمال الألمنيوم", title_en: "Aluminum Works", count: 18, image_url: "/images/defaults/services/aluminum-works.webp" },
  { id: 3, title_ar: "تصاميم المطابخ", title_en: "Kitchen Designs", count: 32, image_url: "/images/defaults/services/kitchens.webp" },
  { id: 4, title_ar: "مشاريع الديكور", title_en: "Decoration Projects", count: 41, image_url: "/images/defaults/services/decorations.webp" },
  { id: 5, title_ar: "الواجهات الزجاجية", title_en: "Glass Facades", count: 15, image_url: "/images/defaults/services/glass-facades.webp" },
  { id: 6, title_ar: "أبواب ونوافذ", title_en: "Doors & Windows", count: 28, image_url: "/images/defaults/services/doors-windows.webp" },
];

const DEFAULT_ITEMS = [
  { id: "1", title_ar: "برج الملك عبد الله - واجهة هيكلية دبل معزولة", title_en: "King Abdullah Commercial Tower Facade", image_url: "/images/defaults/projects/project-1.webp", thumbnail_url: "/images/defaults/projects/project-1.webp" },
  { id: "2", title_ar: "زجاج سكريت 12مم - فواصل مكاتب إدارية", title_en: "12mm Tempered Glass Partitions", image_url: "/images/defaults/services/tempered-glass.webp", thumbnail_url: "/images/defaults/services/tempered-glass.webp" },
  { id: "3", title_ar: "مطبخ ألمنيوم مودرن - أسطح رخام صناعي", title_en: "Modern Aluminum Kitchen Suite", image_url: "/images/defaults/services/kitchens.webp", thumbnail_url: "/images/defaults/services/kitchens.webp" },
  { id: "4", title_ar: "نوافذ ألمنيوم معزولة حرارياً كسر حراري", title_en: "Thermal Break Aluminum Windows", image_url: "/images/defaults/services/aluminum-works.webp", thumbnail_url: "/images/defaults/services/aluminum-works.webp" },
  { id: "5", title_ar: "واجهة وتجهيزات فيلا سكنية فاخرة بجدة", title_en: "Luxury Residential Villa Facade", image_url: "/images/defaults/projects/project-2.webp", thumbnail_url: "/images/defaults/projects/project-2.webp" },
  { id: "6", title_ar: "ديكورات زجاج واستانلس ستيل 304", title_en: "Glass & Stainless 304 Decor", image_url: "/images/defaults/services/decorations.webp", thumbnail_url: "/images/defaults/services/decorations.webp" },
  { id: "7", title_ar: "أبواب زجاجية أوتوماتيكية سحب وسلايد", title_en: "Automatic Sliding Glass Doors", image_url: "/images/defaults/services/doors-windows.webp", thumbnail_url: "/images/defaults/services/doors-windows.webp" },
  { id: "8", title_ar: "صيانة وتجديد واجهة برج تجاري بالرياض", title_en: "Commercial Tower Facade Restoration", image_url: "/images/defaults/services/maintenance.webp", thumbnail_url: "/images/defaults/services/maintenance.webp" },
  { id: "9", title_ar: "مشروع مقاولات عامة وتجهيزات هندسية", title_en: "General Contracting & Building Engineering", image_url: "/images/defaults/services/contracting.webp", thumbnail_url: "/images/defaults/services/contracting.webp" },
];

export function GalleryPageContent({ locale, dict, initialItems }: Props) {
  const isRtl = locale === "ar";
  const [selectedView, setSelectedView] = useState<"albums" | "grid">("albums");
  const [lightboxItem, setLightboxItem] = useState<string | null>(null);

  const items = (initialItems && initialItems.length > 0) ? initialItems : DEFAULT_ITEMS;
  const activeLightboxObj = items.find((it) => String(it.id) === String(lightboxItem)) || items[0];

  return (
    <div className="pt-[var(--header-height)]">
      {/* Cinematic Gallery Studio Hero */}
      <section className="relative py-20 sm:py-28 bg-[#080d1a] overflow-hidden">
        {/* Dark Luxury Studio Illumination */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageHeroBackground pageKey="gallery" />
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[22rem] bg-gradient-to-r from-amber-500/15 via-blue-600/15 to-purple-600/15 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080d1a]/80 via-transparent to-[#080d1a]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full royal-badge shadow-xl backdrop-blur-xl border border-amber-500/30">
            <ZoomIn className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-bold text-white">
              {isRtl ? "🖼️ ألبوم التفاصيل والصور عالية الدقة" : "🖼️ High-Definition Architectural Photo Gallery"}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
            className="text-4xl sm:text-6xl font-extrabold text-white leading-tight">
            {isRtl ? (
              <>
                معرض التفاصيل{" "}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                  البصرية والمعمارية
                </span>
              </>
            ) : (
              <>
                Visual Architectural{" "}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                  Work Gallery
                </span>
              </>
            )}
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.7 }}
            className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {dict.gallery.subtitle || (isRtl
              ? "استكشف ألبومات صور المشاريع الحية، التفاصيل المعمارية الدقيقة للزجاج والألمنيوم، ولقطات التنفيذ قبل وبعد."
              : "Explore high-definition photos of structural glass installations, aluminum details, and project transformations.")}
          </motion.p>
        </div>
      </section>

      {/* View Toggle */}
      <div className="bg-background border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex gap-2">
          {(["albums", "grid"] as const).map((view) => (
            <button key={view} onClick={() => setSelectedView(view)}
              className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                selectedView === view ? "bg-primary-600 text-white" : "text-text-secondary hover:bg-surface")}>
              {view === "albums" ? (isRtl ? "الألبومات" : "Albums") : (isRtl ? "عرض الشبكة" : "Grid View")}
            </button>
          ))}
        </div>
      </div>

      <div className="py-12 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {selectedView === "albums" ? (
            /* Albums View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ALBUMS.map((album, i) => (
                <motion.div key={album.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  onClick={() => setSelectedView("grid")}
                  className="group cursor-pointer rounded-2xl overflow-hidden border border-border-light hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xl transition-all duration-300">
                  <div className="h-48 relative overflow-hidden bg-surface">
                    <SmartFallbackImage 
                      src={album.image_url}
                      alt={album.title_ar}
                      aspectRatio="auto"
                      title={isRtl ? album.title_ar : album.title_en}
                      badge={`${album.count} ${dict.gallery.photos}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 bg-surface-elevated">
                    <h3 className="font-bold group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {isRtl ? album.title_ar : album.title_en}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">{dict.gallery.viewAlbum}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Grid View with Lightbox */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item, i) => (
                <motion.div key={item.id || i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  onClick={() => setLightboxItem(String(item.id))}
                  className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer bg-surface border border-border-light hover:shadow-xl transition-all duration-300">
                  <SmartFallbackImage 
                    src={item.image_url || item.thumbnail_url}
                    alt={isRtl ? item.title_ar : item.title_en}
                    aspectRatio="auto"
                    title={(isRtl ? item.title_ar : item.title_en) || (isRtl ? "صورة معمارية" : "Architectural Photo")}
                    badge={isRtl ? "معرض الصور" : "Gallery Photo"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxItem !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxItem(null)}>
            <button className="absolute top-4 end-4 text-white/80 hover:text-white">
              <X className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              className="w-full max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}>
              <img src={activeLightboxObj?.image_url || activeLightboxObj?.thumbnail_url} alt="Enlarged" className="w-full h-full object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
