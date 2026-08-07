"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface Props {
  locale: Locale;
  dict: Dictionary;
  initialItems?: any[];
}

const ALBUMS = [
  { id: 1, title_ar: "مشاريع الزجاج", title_en: "Glass Projects", count: 24, image_url: "/images/defaults/projects/project-1.jpg" },
  { id: 2, title_ar: "أعمال الألمنيوم", title_en: "Aluminum Works", count: 18, image_url: "/images/defaults/projects/project-1.jpg" },
  { id: 3, title_ar: "تصاميم المطابخ", title_en: "Kitchen Designs", count: 32, image_url: "/images/defaults/projects/project-1.jpg" },
  { id: 4, title_ar: "مشاريع الديكور", title_en: "Decoration Projects", count: 41, image_url: "/images/defaults/projects/project-1.jpg" },
  { id: 5, title_ar: "الواجهات الزجاجية", title_en: "Glass Facades", count: 15, image_url: "/images/defaults/projects/project-1.jpg" },
  { id: 6, title_ar: "أبواب ونوافذ", title_en: "Doors & Windows", count: 28, image_url: "/images/defaults/projects/project-1.jpg" },
];

const DEFAULT_ITEMS = [
  { id: "1", image_url: "/images/defaults/projects/project-1.jpg", thumbnail_url: "/images/defaults/projects/project-1.jpg" },
  { id: "2", image_url: "/images/defaults/projects/project-1-before.jpg", thumbnail_url: "/images/defaults/projects/project-1-before.jpg" },
  { id: "3", image_url: "/images/defaults/projects/project-1-after.jpg", thumbnail_url: "/images/defaults/projects/project-1-after.jpg" },
];

export function GalleryPageContent({ locale, dict, initialItems }: Props) {
  const isRtl = locale === "ar";
  const [selectedView, setSelectedView] = useState<"albums" | "grid">("albums");
  const [lightboxItem, setLightboxItem] = useState<string | null>(null);

  const items = (initialItems && initialItems.length > 0) ? initialItems : DEFAULT_ITEMS;
  const activeLightboxObj = items.find((it) => String(it.id) === String(lightboxItem)) || items[0];

  return (
    <div className="pt-[var(--header-height)]">
      {/* Hero */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-br from-primary-950 via-[#0c1445] to-primary-900 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-sm font-semibold text-primary-300 uppercase tracking-widest mb-3">{dict.gallery.title}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            {isRtl ? "معرض أعمالنا" : "Our Work Gallery"}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-lg text-white/60">{dict.gallery.subtitle}</motion.p>
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
                    <img src={album.image_url} alt={album.title_ar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex items-end p-4">
                      <span className="text-white/90 text-xs font-medium bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                        {album.count} {dict.gallery.photos}
                      </span>
                    </div>
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
                  <img src={item.image_url || item.thumbnail_url} alt="Gallery item" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
