"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, FileText, Layers3, FolderOpen, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { searchDatabase } from "@/lib/actions/content";

interface Props { locale: Locale; dict: Dictionary; }

interface SearchResultItem {
  type: "service" | "article" | "project";
  title: string;
  title_ar?: string;
  title_en?: string;
  excerpt?: string;
  url: string;
  icon?: string | null;
}

function SearchInner({ locale, dict }: Props) {
  const isRtl = locale === "ar";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  // Live Database Search Execution
  useEffect(() => {
    const clean = debouncedQuery.trim();
    if (!clean) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    searchDatabase(clean, locale, 15)
      .then((res) => {
        if (isMounted) {
          setResults(res as SearchResultItem[]);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Live search failed:", err);
        if (isMounted) {
          setResults([]);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, locale]);

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

  const getResultIcon = (type: string) => {
    if (type === "service") return Layers3;
    if (type === "article") return FileText;
    return FolderOpen;
  };

  return (
    <div className="pt-[var(--header-height)]">
      {/* Architectural Search Hero */}
      <section className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 bg-slate-50 dark:bg-[#070d1e] overflow-hidden text-slate-900 dark:text-white border-b border-slate-200/80 dark:border-amber-500/10 transition-colors duration-300">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[16rem] bg-gradient-to-r from-amber-500/10 via-blue-600/10 to-amber-400/5 rounded-full blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(212,175,55,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.2) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/85 via-transparent to-slate-50 dark:from-[#070d1e]/85 dark:via-transparent dark:to-[#070d1e] transition-colors duration-300" />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white text-center leading-tight">
            {isRtl ? (
              <>
                البحث في{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-[#F3E7C4] dark:via-[#E5C378] dark:to-[#C99E32]">
                  المشاريع والخدمات
                </span>
              </>
            ) : (
              <>
                Search{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-[#F3E7C4] dark:via-[#E5C378] dark:to-[#C99E32]">
                  Services & Projects
                </span>
              </>
            )}
          </motion.h1>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="relative">
            {isLoading ? (
              <Loader2 className="absolute top-1/2 -translate-y-1/2 start-5 w-5 h-5 text-amber-500 dark:text-amber-400 animate-spin pointer-events-none" />
            ) : (
              <Search className="absolute top-1/2 -translate-y-1/2 start-5 w-5 h-5 text-slate-400 dark:text-white/50 pointer-events-none" />
            )}
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={dict.search.placeholder}
              autoFocus
              className="w-full ps-14 pe-12 py-4 rounded-xl bg-white dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/50 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 transition-all shadow-md dark:shadow-lg"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute top-1/2 -translate-y-1/2 end-4 text-slate-400 hover:text-slate-700 dark:text-white/50 dark:hover:text-white transition-colors">
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
            ) : isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-16 text-text-secondary">
                <Loader2 className="w-10 h-10 mx-auto mb-4 text-primary-500 animate-spin" />
                <p className="text-sm">{isRtl ? "جارٍ البحث..." : "Searching database..."}</p>
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
                    const Icon = getResultIcon(result.type);
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
                              {result.title}
                            </p>
                            {result.excerpt && (
                              <p className="text-xs text-text-tertiary line-clamp-1 mt-0.5">
                                {result.excerpt}
                              </p>
                            )}
                            <span className={cn("inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold", typeColor(result.type))}>
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
