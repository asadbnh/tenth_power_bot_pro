"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Moon,
  Sun,
  Globe,
  Search,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { CompanyLogo } from "@/components/ui/CompanyLogo";

interface HeaderProps {
  locale: Locale;
  dict: Dictionary;
}

const NAV_ITEMS = [
  { key: "home", href: "" },
  { key: "services", href: "/services" },
  { key: "projects", href: "/projects" },
  { key: "gallery", href: "/gallery" },
  { key: "blog", href: "/blog" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const;

/**
 * Premium responsive header with:
 * - Transparent → solid on scroll
 * - Mobile hamburger menu
 * - Language switcher
 * - Theme toggle
 * - Search trigger
 */
export function Header({ locale, dict }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isRtl = locale === "ar";
  const alternateLocale = locale === "ar" ? "en" : "ar";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track scroll position for header style change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const getLocalizedHref = (href: string) => `/${locale}${href}`;
  const getAlternateHref = () => pathname.replace(`/${locale}`, `/${alternateLocale}`);

  const isActive = (href: string) => {
    const fullHref = getLocalizedHref(href);
    if (href === "") return pathname === `/${locale}` || pathname === `/${locale}/`;
    return pathname.startsWith(fullHref);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300 safe-top",
          isScrolled
            ? "bg-surface/95 dark:bg-background/95 backdrop-blur-xl border-b border-border-light shadow-md"
            : "bg-surface/85 dark:bg-background/85 backdrop-blur-md border-b border-border-light/50"
        )}
        role="banner"
      >
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[var(--header-height)] flex items-center justify-between gap-2"
          aria-label={isRtl ? "التنقل الرئيسي" : "Main Navigation"}
        >
          {/* Logo */}
          <Link
            href={getLocalizedHref("")}
            className="flex items-center gap-2 shrink-0 max-w-[220px] sm:max-w-none"
            aria-label={dict.meta.siteName}
          >
            <CompanyLogo size={28} className="shrink-0 sm:w-8 sm:h-8" />
            <span className="text-xs sm:text-sm lg:text-base font-bold text-text-primary transition-colors line-clamp-1">
              {dict.meta.siteName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={getLocalizedHref(item.href)}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap",
                  isActive(item.href)
                    ? "text-primary-600 bg-primary-50 dark:text-amber-400 dark:bg-primary-950/60 font-bold"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                )}
              >
                {dict.nav[item.key as keyof typeof dict.nav]}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Search */}
            <button
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
              aria-label={dict.nav.search}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                aria-label={theme === "dark" ? dict.common.lightMode : dict.common.darkMode}
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Language Switcher */}
            <Link
              href={getAlternateHref()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-elevated border border-border-light transition-all shrink-0 whitespace-nowrap"
              hrefLang={alternateLocale}
            >
              <Globe className="w-3.5 h-3.5 text-amber-500" />
              <span>{alternateLocale === "ar" ? "العربية" : "English"}</span>
            </Link>

            {/* CTA Button (Desktop) */}
            <Link
              href={getLocalizedHref("/quote")}
              className="hidden sm:inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-primary-950 shadow-sm hover:scale-[1.02] active:scale-95 transition-all shrink-0 whitespace-nowrap"
            >
              {dict.nav.quote}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-text-primary hover:bg-surface-elevated transition-colors"
              aria-label={isMobileMenuOpen ? dict.common.close : "Menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.nav
              initial={{ x: isRtl ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={cn(
                "absolute top-0 bottom-0 w-[80%] max-w-sm bg-background shadow-2xl",
                "flex flex-col safe-top",
                isRtl ? "start-0" : "end-0"
              )}
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="text-lg font-bold">{dict.meta.siteName}</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-surface"
                  aria-label={dict.common.close}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {NAV_ITEMS.map((item, index) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={getLocalizedHref(item.href)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300"
                          : "text-text-secondary hover:bg-surface hover:text-text-primary"
                      )}
                    >
                      {dict.nav[item.key as keyof typeof dict.nav]}
                      {isActive(item.href) && (
                        <ChevronDown className={cn("w-4 h-4 ms-auto", isRtl ? "rotate-90" : "-rotate-90")} />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile Menu Footer */}
              <div className="p-4 border-t border-border space-y-3">
                <Link
                  href={getLocalizedHref("/quote")}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-accent-500 text-white font-semibold hover:bg-accent-600 transition-colors"
                >
                  {dict.nav.quote}
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
