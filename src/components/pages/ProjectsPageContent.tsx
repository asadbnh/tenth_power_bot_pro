"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Calendar, Eye, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { AnimatedCanvasBanner } from "@/components/ui/AnimatedCanvasBanner";

interface Props {
  locale: Locale;
  dict: Dictionary;
  initialProjects?: any[];
}

const FILTERS_AR = ["الكل", "زجاج", "ألمنيوم", "مطابخ", "ديكورات", "مقاولات"];
const FILTERS_EN = ["All", "Glass", "Aluminum", "Kitchens", "Decorations", "Contracting"];

export function ProjectsPageContent({ locale, dict, initialProjects }: Props) {
  const isRtl = locale === "ar";
  const [activeFilter, setActiveFilter] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<string | number, boolean>>({});
  const filters = isRtl ? FILTERS_AR : FILTERS_EN;

  const projects = (initialProjects && initialProjects.length > 0) ? initialProjects : [];

  const filtered = projects.filter((project) => {
    if (activeFilter === 0) return true;
    const selectedCategory = filters[activeFilter];
    const cat = project.cat || project.category_ar || project.category || "";
    const title = (isRtl ? project.title_ar : project.title_en) || project.title_ar || project.name || "";
    return cat.includes(selectedCategory) || title.includes(selectedCategory);
  });

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
            {isRtl ? "مشاريعنا المميزة" : "Featured Projects"}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-lg text-white/60 max-w-2xl mx-auto">{dict.projects.subtitle}</motion.p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-6 bg-surface border-b border-border-light sticky top-[var(--header-height)] z-30 backdrop-blur-md bg-surface/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <Filter className="w-4 h-4 text-text-tertiary shrink-0 me-2" />
            {filters.map((filter, i) => (
              <button key={i} onClick={() => setActiveFilter(i)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all cursor-pointer",
                  activeFilter === i
                    ? "bg-primary-600 text-white shadow-md shadow-primary-600/20"
                    : "bg-background hover:bg-surface-elevated text-text-secondary border border-border-light"
                )}>
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project, i) => {
              const title = project.name || (isRtl ? project.title_ar || project.name_ar : project.title_en || project.name_en) || project.title_ar;
              const city = (isRtl ? project.location_ar || project.city_ar : project.location_en || project.city_en) || project.city || "السعودية";
              const cat = isRtl ? (project.category_ar || project.cat || "مشروع") : (project.category_en || project.cat || "Project");
              const coverImage = project.cover_image_url || project.image_url;
              const isError = imgErrors[project.id || i] || !coverImage;
              const projectSlug = project.slug || "king-abdullah-tower";

              return (
                <motion.article key={project.id || project.slug || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="group rounded-2xl overflow-hidden border border-border-light hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-xl transition-all duration-300 bg-surface-elevated">

                  <Link href={`/${locale}/projects/${projectSlug}`} className="block">
                    <div className="h-52 bg-surface relative overflow-hidden flex items-center justify-center">
                      {isError ? (
                        <AnimatedCanvasBanner aspectRatio="auto" badge={cat} className="w-full h-full" />
                      ) : (
                        <>
                          <img 
                            src={coverImage} 
                            alt={title} 
                            onError={() => setImgErrors(prev => ({ ...prev, [project.id || i]: true }))}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                          <span className="absolute top-3 end-3 px-2.5 py-1 rounded-full bg-black/40 text-white text-xs font-medium backdrop-blur-sm">
                            {cat}
                          </span>
                        </>
                      )}
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
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
