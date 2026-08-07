"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Eye, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface Props {
  locale: Locale;
  dict: Dictionary;
  initialProjects?: any[];
}

const FILTERS_AR = ["الكل", "زجاج", "ألمنيوم", "مطابخ", "ديكورات", "مقاولات"];
const FILTERS_EN = ["All", "Glass", "Aluminum", "Kitchens", "Decorations", "Contracting"];

const DEFAULT_PROJECTS = [
  { id: 1, title_ar: "واجهة برج تجاري — الرياض", title_en: "Commercial Tower Facade — Riyadh", cat: "زجاج", city_ar: "الرياض", city_en: "Riyadh", year: 2024, views: 1240, cover_image_url: "/images/defaults/projects/project-1.jpg" },
  { id: 2, title_ar: "مطبخ فيلا فاخرة — جدة", title_en: "Luxury Villa Kitchen — Jeddah", cat: "مطابخ", city_ar: "جدة", city_en: "Jeddah", year: 2024, views: 890, cover_image_url: "/images/defaults/projects/project-1.jpg" },
  { id: 3, title_ar: "ديكور مجمع سكني — الدمام", title_en: "Residential Complex Decor — Dammam", cat: "ديكورات", city_ar: "الدمام", city_en: "Dammam", year: 2023, views: 670, cover_image_url: "/images/defaults/projects/project-1.jpg" },
  { id: 4, title_ar: "أبواب وشبابيك — الخبر", title_en: "Doors & Windows — Al Khobar", cat: "ألمنيوم", city_ar: "الخبر", city_en: "Al Khobar", year: 2024, views: 520, cover_image_url: "/images/defaults/projects/project-1.jpg" },
  { id: 5, title_ar: "مقاولات مبنى إداري — الرياض", title_en: "Administrative Building — Riyadh", cat: "مقاولات", city_ar: "الرياض", city_en: "Riyadh", year: 2023, views: 1100, cover_image_url: "/images/defaults/projects/project-1.jpg" },
  { id: 6, title_ar: "واجهات مركز تسوق — جدة", title_en: "Shopping Center Facades — Jeddah", cat: "زجاج", city_ar: "جدة", city_en: "Jeddah", year: 2024, views: 950, cover_image_url: "/images/defaults/projects/project-1.jpg" },
];

export function ProjectsPageContent({ locale, dict, initialProjects }: Props) {
  const isRtl = locale === "ar";
  const [activeFilter, setActiveFilter] = useState(0);
  const filters = isRtl ? FILTERS_AR : FILTERS_EN;

  const projects = (initialProjects && initialProjects.length > 0) ? initialProjects : DEFAULT_PROJECTS;

  const filtered = activeFilter === 0
    ? projects
    : projects.filter(p => (p.cat === FILTERS_AR[activeFilter] || p.services?.slug === FILTERS_EN[activeFilter].toLowerCase()));

  return (
    <div className="pt-[var(--header-height)]">
      {/* Page Hero */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-br from-primary-950 via-[#0c1445] to-primary-900 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold text-primary-300 uppercase tracking-widest mb-3">{dict.projects.title}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            {isRtl ? "مشاريعنا المنجزة" : "Our Completed Projects"}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-lg text-white/60 max-w-2xl mx-auto">{dict.projects.subtitle}</motion.p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-[var(--header-height)] z-30 bg-background/80 backdrop-blur-xl border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Filter className="w-4 h-4 text-text-tertiary shrink-0 me-2" />
          {filters.map((f, i) => (
            <button key={f} onClick={() => setActiveFilter(i)}
              className={cn("px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                activeFilter === i
                  ? "bg-primary-600 text-white shadow-md"
                  : "bg-surface text-text-secondary hover:bg-surface-elevated border border-border-light")}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project, i) => {
              const title = project.name || (isRtl ? project.title_ar : project.title_en) || project.title_ar;
              const city = project.city || (isRtl ? project.city_ar : project.city_en) || "السعودية";
              const cat = project.cat || project.services?.slug || "مشروع";
              const coverImage = project.cover_image_url || project.image_url || "/images/defaults/projects/project-1.jpg";

              return (
                <motion.article key={project.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="group rounded-2xl overflow-hidden border border-border-light hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-xl transition-all duration-300 bg-surface-elevated cursor-pointer">

                  <div className="h-52 bg-surface relative overflow-hidden flex items-center justify-center">
                    <img src={coverImage} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <span className="absolute top-3 end-3 px-2.5 py-1 rounded-full bg-black/40 text-white text-xs font-medium backdrop-blur-sm">
                      {cat}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-base mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
                      {title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {project.year || 2024}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {(project.views || project.view_count || 100).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
