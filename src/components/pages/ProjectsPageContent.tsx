"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  MapPin, Calendar, Filter, Building2, 
   ArrowUpRight, CheckCircle2, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { SmartFallbackImage } from "@/components/ui/SmartFallbackImage";
import { PageHeroBackground } from "@/components/ui/PageHeroBackground";
import { SkeletonProjectCard } from "@/components/ui/Skeleton";

interface Props {
  locale: Locale;
  dict: Dictionary;
  initialProjects?: any[];
}

const CATEGORIES_AR = [
  { label: "كافة المشاريع", key: "all" },
  { label: "واجهات استركشر وزجاج", key: "facades" },
  { label: "زجاج سيكوريت وقواطع", key: "glass" },
  { label: "أبواب ونوافذ ألمنيوم", key: "aluminum" },
  { label: "كبائن شاور ومرايا", key: "shower" },
  { label: "مقاولات وتجهيزات", key: "contracting" },
];

const CATEGORIES_EN = [
  { label: "All Projects", key: "all" },
  { label: "Curtain Walls & Facades", key: "facades" },
  { label: "Securit & Partitions", key: "glass" },
  { label: "Aluminum Doors & Windows", key: "aluminum" },
  { label: "Showers & Mirrors", key: "shower" },
  { label: "General Contracting", key: "contracting" },
];

export function ProjectsPageContent({ locale, dict, initialProjects }: Props) {
  const isRtl = locale === "ar";
  const [activeCategory, setActiveCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(t);
  }, []);

  const projects = useMemo(() => {
    return (initialProjects && initialProjects.length > 0) ? initialProjects : [];
  }, [initialProjects]);

  // Real, smart filtering by category and search keyword
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const catText = `${project.category_ar || ""} ${project.category_en || ""} ${project.category || ""}`.toLowerCase();
      const nameText = `${project.name_ar || ""} ${project.name_en || ""} ${project.title_ar || ""} ${project.name || ""}`.toLowerCase();

      let matchesCategory = true;
      if (activeCategory === "facades") {
        matchesCategory = catText.includes("واجه") || catText.includes("استركشر") || catText.includes("facade") || catText.includes("curtain") || nameText.includes("واجهة") || nameText.includes("برج");
      } else if (activeCategory === "glass") {
        matchesCategory = catText.includes("زجاج") || catText.includes("سيكوريت") || catText.includes("قواطع") || catText.includes("glass") || catText.includes("partition");
      } else if (activeCategory === "aluminum") {
        matchesCategory = catText.includes("ألمنيوم") || catText.includes("المنيوم") || catText.includes("نوافذ") || catText.includes("أبواب") || catText.includes("aluminum");
      } else if (activeCategory === "shower") {
        matchesCategory = catText.includes("شاور") || catText.includes("مرايا") || catText.includes("shower") || catText.includes("mirror") || catText.includes("ديكور");
      } else if (activeCategory === "contracting") {
        matchesCategory = catText.includes("مقاولات") || catText.includes("بناء") || catText.includes("تشطيب") || catText.includes("contracting");
      }

      return matchesCategory;
    });
  }, [projects, activeCategory]);

  const categories = isRtl ? CATEGORIES_AR : CATEGORIES_EN;

  return (
    <div className="pt-[var(--header-height)]">
      {/* Cinematic Architectural Hero */}
      <section className="relative pt-8 pb-12 sm:pt-14 sm:pb-20 bg-slate-50 dark:bg-[#070d1e] overflow-hidden border-b border-slate-200/80 dark:border-amber-500/10 transition-colors duration-300">
        {/* Subtle Architectural Grid & Gold Ambient Glow */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageHeroBackground pageKey="projects" overlayOpacity={0.4} />
          <div className="absolute top-1/4 start-1/3 w-[36rem] h-[36rem] bg-gradient-to-tr from-amber-500/15 via-blue-600/10 to-transparent rounded-full blur-[120px]" />
          <div className="absolute bottom-10 end-10 w-[24rem] h-[24rem] bg-amber-400/10 rounded-full blur-[100px]" />
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{ 
              backgroundImage: "linear-gradient(rgba(212,175,55,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.25) 1px, transparent 1px)", 
              backgroundSize: "48px 48px" 
            }} 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/85 via-transparent to-slate-50 dark:from-[#070d1e]/85 dark:via-transparent dark:to-[#070d1e] transition-colors duration-300" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 dark:bg-white/5 shadow-sm dark:shadow-2xl backdrop-blur-xl border border-amber-500/30 text-amber-800 dark:text-amber-200"
          >
            <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs sm:text-sm font-bold">
              {isRtl ? "مؤسسة القوة العاشرة • سجل حافل بمشاريع الرياض والمملكة" : "Tenth Power • Saudi Architectural Execution Showcase"}
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight"
          >
            {isRtl ? (
              <>
                معرض المشاريع{" "}
                <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-amber-400 dark:via-yellow-300 dark:to-amber-200 bg-clip-text text-transparent">
                  الهندسية والمعمارية المنفذة
                </span>
              </>
            ) : (
              <>
                Portfolio of Executed{" "}
                <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-amber-400 dark:via-yellow-300 dark:to-amber-200 bg-clip-text text-transparent">
                  Architectural Projects
                </span>
              </>
            )}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            {dict.projects.subtitle || (isRtl
              ? "نماذج واقعية حية تم تنفيذها بأعلى معايير كود البناء السعودي (SBC)، تشمل واجهات الأبراج الاستركشر، قواطع السيكوريت الذكية، وقطاعات الألمنيوم المعزولة كسر حراري."
              : "Discover real-world architectural achievements built to Saudi Building Code (SBC) standards, spanning structural curtain walls, securit partitions, and thermal-break aluminum.")}
          </motion.p>

          {/* Architectural Trust Strip 
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto"
          >
            {[
              { icon: ShieldCheck, title: isRtl ? "ضمان 10 سنوات" : "10-Year Warranty", sub: isRtl ? "شامل التركيب والعزل" : "Installation & Seals" },
              { icon: Building2, title: isRtl ? "كود البناء السعودي" : "SBC Compliant", sub: isRtl ? "مطابقة تامة للمواصفات" : "Full Standards Match" },
              { icon: Ruler, title: isRtl ? "معاينة ورفع مساحي" : "Free Riyadh Survey", sub: isRtl ? "مجاناً بالموقع خلال 24h" : "On-site within 24h" },
              { icon: Layers, title: isRtl ? "+450 مشروع منجز" : "+450 Projects Built", sub: isRtl ? "سكني وتجاري وحكومي" : "Commercial & Residential" },
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="p-3 rounded-2xl bg-white/85 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-none backdrop-blur-md text-start flex items-center gap-3 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{item.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>*/}
        </div>
      </section>

      {/* Main Portfolio Grid Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Interactive Filter Strip */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 border-b border-border-light pb-4 sm:pb-6">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth w-full md:w-auto pb-2 md:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
              <span className="text-xs font-bold text-text-tertiary me-2 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5 text-amber-500" />
                {isRtl ? "التصنيف الهندسي:" : "Filter:"}
              </span>
              {categories.map((cat) => {
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap",
                      isActive
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-primary-950 shadow-md shadow-amber-500/20"
                        : "bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-surface border border-border-light"
                    )}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-text-tertiary font-semibold w-full md:w-auto text-end">
              {isRtl 
                ? `عرض ${filteredProjects.length} من إجمالي ${projects.length} مشروع`
                : `Showing ${filteredProjects.length} of ${projects.length} projects`}
            </div>
          </div>

          {/* Projects Architectural Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonProjectCard key={i} />)
            ) : filteredProjects.length === 0 ? (
              <div className="col-span-full py-16 text-center space-y-3">
                <p className="text-base font-bold text-text-secondary">
                  {isRtl ? "لا توجد مشاريع مطابقة لهذا التصنيف حالياً." : "No projects found matching this category."}
                </p>
                <button
                  onClick={() => setActiveCategory("all")}
                  className="text-xs font-bold text-amber-500 hover:underline"
                >
                  {isRtl ? "عرض كافة المشاريع" : "Show all projects"}
                </button>
              </div>
            ) : (
              filteredProjects.map((project, i) => {
                const title = isRtl 
                  ? (project.name_ar || project.title_ar || project.name) 
                  : (project.name_en || project.title_en || project.name_ar || project.name);
                const cat = isRtl 
                  ? (project.category_ar || project.category || "واجهات وزجاج") 
                  : (project.category_en || project.category_ar || project.category || "Facade & Glass");
                const city = isRtl 
                  ? (project.location_ar || project.city || "الرياض - المملكة") 
                  : (project.location_en || project.city || "Riyadh - KSA");
                const year = project.year || "2024";
                const projectSlug = project.slug || `project-${project.id || i}`;
                const coverImage = project.cover_image_url || project.image_url;

                // Smart technical spec badge extraction
                const specTag = project.spec_tag || (
                  cat.includes("استركشر") || cat.includes("facade")
                    ? (isRtl ? "دبل جلاس معزول 24مم" : "Double Glazed 24mm")
                    : cat.includes("سيكوريت") || cat.includes("glass")
                    ? (isRtl ? "سيكوريت مقسّى 12مم" : "12mm Tempered Glass")
                    : cat.includes("ألمنيوم") || cat.includes("aluminum")
                    ? (isRtl ? "قطاع سرايا كسر حراري" : "Thermal Break System")
                    : (isRtl ? "مواصفات هندسية معتمدة" : "Certified Engineering Specs")
                );

                return (
                  <motion.div 
                    key={project.id || project.slug || i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="group rounded-3xl overflow-hidden border border-border-light hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 bg-surface-elevated flex flex-col justify-between"
                  >
                    <Link href={`/${locale}/projects/${projectSlug}`} className="block relative">
                      {/* Project Image View */}
                      <div className="h-60 bg-surface relative overflow-hidden">
                        <SmartFallbackImage 
                          src={coverImage}
                          alt={title}
                          aspectRatio="auto"
                          title={title}
                          badge={cat}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Overlay Badges */}
                        <div className="absolute top-3 end-3 z-10 flex flex-col gap-1.5 items-end">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#070d1e]/85 backdrop-blur-md text-amber-300 border border-amber-500/30 shadow-md">
                            {specTag}
                          </span>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-[#070d1e]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300">
                            {isRtl ? "استعراض تفاصيل ودراسة المشروع" : "View Architectural Case Study"}
                            <ArrowUpRight className={cn("w-3.5 h-3.5", isRtl && "rotate-[-90deg]")} />
                          </span>
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="p-5 sm:p-6 space-y-4">
                        <h3 className="font-extrabold text-base sm:text-lg text-text-primary group-hover:text-amber-500 transition-colors leading-snug line-clamp-2">
                          {title}
                        </h3>

                        {/* Location & Year */}
                        <div className="flex items-center justify-between text-xs text-text-tertiary border-t border-border-light pt-3">
                          <span className="flex items-center gap-1.5 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            {city}
                          </span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {year}
                          </span>
                        </div>
                      </div>
                    </Link>

                    {/* Bottom Quick Consultation Trigger */}
                    <div className="px-5 pb-5 pt-0">
                      <Link
                        href={`/${locale}/quote?project=${projectSlug}`}
                        className="w-full py-2.5 px-3 rounded-xl bg-surface hover:bg-amber-500 hover:text-primary-950 text-text-secondary text-xs font-bold flex items-center justify-center gap-2 border border-border-light hover:border-amber-500 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:text-primary-950" />
                        <span>{isRtl ? "طلب دراسة مشروع مماثل" : "Request Similar Project Quote"}</span>
                      </Link>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Bottom Conversion Banner */}
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#070d1e] via-[#0b1532] to-[#070d1e] border border-amber-500/20 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center md:text-start max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isRtl ? "معاينة ميدانية مجانية في الرياض" : "Free Riyadh Site Survey"}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {isRtl 
                  ? "هل تخطط لتنفيذ واجهات زجاجية أو أعمال ألمنيوم لمشروعك؟"
                  : "Planning a Glazing or Architectural Aluminum Project?"}
              </h3>
              <p className="text-sm text-slate-300">
                {isRtl
                  ? "مهندسونا مستعدون لزيارة موقعك بالرياض، أخذ الرفع المساحي الدقيق، وتقديم دراسة فنية وجدول كميات معتمد مجاناً وبدون أي التزام."
                  : "Our engineering team provides on-site surveys in Riyadh, CAD approvals, and detailed BOQs at zero cost."}
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link
                href={`/${locale}/appointments`}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-primary-950 font-extrabold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all text-center"
              >
                {isRtl ? "حجز موعد معاينة ميدانية مجانية" : "Book Free Site Survey"}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all text-center"
              >
                {isRtl ? "تواصل مع الإدارة الهندسية" : "Contact Engineering Team"}
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

