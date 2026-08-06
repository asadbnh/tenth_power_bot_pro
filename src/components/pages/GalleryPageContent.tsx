"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface Props { locale: Locale; dict: Dictionary; }

const ALBUMS = [
  { id: 1, title_ar: "مشاريع الزجاج", title_en: "Glass Projects", count: 24, gradient: "from-blue-500 to-cyan-400", emoji: "🪟" },
  { id: 2, title_ar: "أعمال الألمنيوم", title_en: "Aluminum Works", count: 18, gradient: "from-slate-500 to-gray-400", emoji: "🔩" },
  { id: 3, title_ar: "تصاميم المطابخ", title_en: "Kitchen Designs", count: 32, gradient: "from-amber-500 to-orange-400", emoji: "🍽️" },
  { id: 4, title_ar: "مشاريع الديكور", title_en: "Decoration Projects", count: 41, gradient: "from-rose-500 to-pink-400", emoji: "🎨" },
  { id: 5, title_ar: "الواجهات الزجاجية", title_en: "Glass Facades", count: 15, gradient: "from-indigo-500 to-purple-400", emoji: "🏢" },
  { id: 6, title_ar: "أبواب ونوافذ", title_en: "Doors & Windows", count: 28, gradient: "from-emerald-500 to-teal-400", emoji: "🚪" },
];

// Gallery grid images (using gradient placeholders until R2 is connected)
const GALLERY_ITEMS = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  emoji: ["🪟", "🔩", "🍽️", "🎨", "🏢", "🚪", "🏗️", "🏠", "⭐"][i % 9],
  gradient: [
    "from-blue-500 to-cyan-400", "from-slate-500 to-gray-400", "from-amber-500 to-orange-400",
    "from-rose-500 to-pink-400", "from-indigo-500 to-purple-400", "from-emerald-500 to-teal-400",
    "from-yellow-500 to-amber-400", "from-violet-500 to-fuchsia-400", "from-blue-600 to-indigo-500"
  ][i % 9],
}));

export function GalleryPageContent({ locale, dict }: Props) {
  const isRtl = locale === "ar";
  const [selectedView, setSelectedView] = useState<"albums" | "grid">("albums");
  const [lightboxItem, setLightboxItem] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true });

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

      <div ref={sectionRef} className="py-12 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {selectedView === "albums" ? (
            /* Albums View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ALBUMS.map((album, i) => (
                <motion.div key={album.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  onClick={() => setSelectedView("grid")}
                  className="group cursor-pointer rounded-2xl overflow-hidden border border-border-light hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xl transition-all duration-300">
                  <div className={cn("h-44 bg-gradient-to-br flex items-center justify-center text-5xl relative", album.gradient)}>
                    <span>{album.emoji}</span>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex items-end p-4">
                      <span className="text-white/80 text-xs font-medium bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
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
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
              {GALLERY_ITEMS.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  onClick={() => setLightboxItem(item.id)}
                  className={cn("group relative rounded-xl overflow-hidden cursor-pointer bg-gradient-to-br",
                    item.gradient,
                    i % 3 === 0 ? "aspect-square" : i % 3 === 1 ? "aspect-[4/3]" : "aspect-[3/4]")}>
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {item.emoji}
                  </div>
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
              className={cn("w-full max-w-2xl aspect-square rounded-2xl bg-gradient-to-br flex items-center justify-center text-8xl",
                GALLERY_ITEMS[(lightboxItem - 1) % GALLERY_ITEMS.length]?.gradient)}
              onClick={(e) => e.stopPropagation()}>
              {GALLERY_ITEMS[(lightboxItem - 1) % GALLERY_ITEMS.length]?.emoji}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
