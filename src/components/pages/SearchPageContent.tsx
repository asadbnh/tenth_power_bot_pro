"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, FileText, Layers3, FolderOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface Props { locale: Locale; dict: Dictionary; }

// Mock search results — real implementation queries /api/search → Supabase full-text
const ALL_RESULTS = [
  { type: "service", title_ar: "زجاج سكريت (مقوى)", title_en: "Tempered Glass", url: "/services", icon: Layers3, keywords: ["زجاج", "سكريت", "glass", "tempered"] },
  { type: "service", title_ar: "واجهات زجاجية", title_en: "Glass Facades", url: "/services", icon: Layers3, keywords: ["واجهات", "زجاجية", "facade", "glass"] },
  { type: "service", title_ar: "أعمال الألمنيوم", title_en: "Aluminum Works", url: "/services", icon: Layers3, keywords: ["ألمنيوم", "aluminum", "نوافذ"] },
  { type: "service", title_ar: "مطابخ", title_en: "Kitchens", url: "/services", icon: Layers3, keywords: ["مطبخ", "مطابخ", "kitchen"] },
  { type: "service", title_ar: "ديكورات", title_en: "Decorations", url: "/services", icon: Layers3, keywords: ["ديكور", "decoration", "تصميم"] },
  { type: "article", title_ar: "دليل شامل: أنواع الزجاج السكريت", title_en: "Complete Guide: Types of Tempered Glass", url: "/blog/types-of-tempered-glass", icon: FileText, keywords: ["زجاج", "glass", "سكريت", "دليل"] },
  { type: "article", title_ar: "أبرز ترندات تصميم المطابخ 2024", title_en: "Top Kitchen Design Trends 2024", url: "/blog/kitchen-design-trends-2024", icon: FileText, keywords: ["مطبخ", "تصميم", "kitchen", "design"] },
  { type: "project", title_ar: "واجهة برج تجاري — الرياض", title_en: "Commercial Tower Facade — Riyadh", url: "/projects", icon: FolderOpen, keywords: ["برج", "واجهة", "الرياض", "tower", "riyadh"] },
  { type: "project", title_ar: "مطبخ فيلا فاخرة — جدة", title_en: "Luxury Villa Kitchen — Jeddah", url: "/projects", icon: FolderOpen, keywords: ["مطبخ", "فيلا", "جدة", "kitchen", "villa"] },
];

function SearchInner({ locale, dict }: Props) {
  const isRtl = locale === "ar";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Sync URL param
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) params.set("q", debouncedQuery);
    else params.delete("q");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedQuery, router, pathname, searchParams]);

  const results = debouncedQuery.trim()
    ? ALL_RESULTS.filter(r =>
        r.keywords.some(k => k.includes(debouncedQuery.toLowerCase())) ||
        (isRtl ? r.title_ar : r.title_en).toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : [];

  const typeLabel = (type: string) => {
    if (type === "service") return isRtl ? "خدمة" : "Service";
    if (type === "article") return isRtl ? "مقال" : "Article";
    return isRtl ? "مشروع" : "Project";
  };

  const typeColor = (type: string) => {
    if (type === "service") return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
    if (type === "article") return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
  };

  return (
    <div className="pt-[var(--header-height)]">
      {/* Search Hero */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-br from-primary-950 via-[#0c1445] to-primary-900 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-8">{dict.search.title}</motion.h1>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 start-5 w-6 h-6 text-white/40 pointer-events-none" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={dict.search.placeholder}
              autoFocus
              className="w-full ps-14 pe-12 py-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 text-lg focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute top-1/2 -translate-y-1/2 end-4 text-white/50 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="py-10 sm:py-16 bg-background min-h-[40vh]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {!debouncedQuery.trim() ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-16 text-text-secondary">
                <Search className="w-12 h-12 mx-auto mb-4 text-text-tertiary" />
                <p className="text-lg">{dict.search.placeholder}</p>
              </motion.div>
            ) : results.length === 0 ? (
              <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-16">
                <p className="text-xl font-semibold mb-2">{dict.search.noResults}</p>
                <p className="text-text-secondary text-sm">«{debouncedQuery}»</p>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-sm text-text-secondary mb-5 font-medium">
                  {results.length} {dict.search.results}
                </p>
                <div className="space-y-3">
                  {results.map((result, i) => {
                    const Icon = result.icon;
                    return (
                      <motion.div key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}>
                        <Link href={`/${locale}${result.url}`}
                          className="group flex items-center gap-4 p-4 rounded-2xl border border-border-light bg-surface-elevated hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-md transition-all duration-200">
                          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {isRtl ? result.title_ar : result.title_en}
                            </p>
                            <span className={cn("inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium", typeColor(result.type))}>
                              {typeLabel(result.type)}
                            </span>
                          </div>
                          <ArrowRight className={cn("w-4 h-4 text-text-tertiary group-hover:text-primary-600 dark:group-hover:text-primary-400 shrink-0 transition-colors", isRtl && "rotate-180")} />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

// Wrap in Suspense to allow useSearchParams
export function SearchPageContent(props: Props) {
  return (
    <Suspense>
      <SearchInner {...props} />
    </Suspense>
  );
}
