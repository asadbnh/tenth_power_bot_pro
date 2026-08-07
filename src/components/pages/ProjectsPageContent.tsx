"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Calendar, Eye, Filter, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { SmartFallbackImage } from "@/components/ui/SmartFallbackImage";
import { PageHeroBackground } from "@/components/ui/PageHeroBackground";

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

  const projects = (initialProjects && initialProjects.length > 0) ? initialProjects : [];

  return (
    <div className="pt-[var(--header-height)]">
      {/* Cinematic Projects Hero */}
      <section className="relative py-20 sm:py-28 bg-[#091124] overflow-hidden">
        {/* Architectural Grid & Ambient Gold Spotlight */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageHeroBackground pageKey="projects" />
          <div className="absolute top-1/3 start-1/4 w-[35rem] h-[35rem] bg-amber-500/10 rounded-full blur-[110px]" />
          <div className="absolute bottom-1/4 end-1/4 w-[30rem] h-[30rem] bg-blue-600/15 rounded-full blur-[90px]" />
          <div className="absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: "linear-gradient(rgba(212,175,55,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.2) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#091124]/80 via-transparent to-[#091124]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full royal-badge shadow-xl backdrop-blur-xl border border-amber-500/30">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-bold">
              {isRtl ? "معرض الإنجازات المعمارية في المملكة" : "Saudi Architectural Portfolio Showcase"}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
            className="text-4xl sm:text-6xl font-extrabold text-white leading-tight">
            {isRtl ? (
              <>
                معرض مشاريعنا{" "}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                  المعمارية والهندسية
                </span>
              </>
            ) : (
              <>
                Portfolio of Exceptional{" "}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                  Architectural Projects
                </span>
              </>
            )}
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.7 }}
            className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {dict.projects.subtitle || (isRtl
              ? "استعرض حصيلة إنجازاتنا في تنفيذ الواجهات الزجاجية الهيكلية، أبراج السيكوريت، وأعمال الألمنيوم المعزولة بأعلى مواصفات الجودة والدقة الهندسية."
              : "Explore our portfolio of structural glazing, securit towers, and insulated aluminum profiles executed across the Kingdom.")}
          </motion.p>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-12">
            <span className="flex items-center gap-1.5 text-xs text-text-tertiary me-2">
              <Filter className="w-3.5 h-3.5" />
              {dict.projects.filter}:
            </span>
            {(isRtl ? FILTERS_AR : FILTERS_EN).map((filter, index) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(index)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  activeFilter === index
                    ? "bg-primary-600 text-white shadow-md"
                    : "bg-surface-elevated text-text-secondary hover:text-text-primary border border-border-light"
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, i) => {
              const title = isRtl ? (project.name_ar || project.title_ar || project.name) : (project.name_en || project.title_en || project.name_ar || project.name);
              const cat = isRtl ? (project.category_ar || project.category) : (project.category_en || project.category_ar || project.category || "Project");
              const city = isRtl ? (project.location_ar || project.city || "الرياض") : (project.location_en || project.city || "Riyadh");
              const year = project.year || "2024";
              const projectSlug = project.slug || "king-abdullah-tower";
              const coverImage = project.cover_image_url || project.image_url;

              return (
                <motion.div key={project.id || project.slug || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="group rounded-2xl overflow-hidden border border-border-light hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-xl transition-all duration-300 bg-surface-elevated">

                  <Link href={`/${locale}/projects/${projectSlug}`} className="block">
                    <div className="h-52 bg-surface relative overflow-hidden">
                      <SmartFallbackImage 
                        src={coverImage}
                        alt={title}
                        aspectRatio="auto"
                        title={title}
                        badge={cat}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
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
                          {year}
                        </span>
                        <span className="flex items-center gap-1" suppressHydrationWarning>
                          <Eye className="w-3.5 h-3.5" />
                          {(project.views || project.view_count || 100).toLocaleString("en-US")}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
