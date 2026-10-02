"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  title: string;
  url?: string;
  text?: string;
  variant?: "pill" | "icon" | "banner" | "outline";
  className?: string;
  label?: string;
  copiedLabel?: string;
}

export function ShareButton({
  title,
  url,
  text,
  variant = "pill",
  className,
  label,
  copiedLabel = "تم النسخ!",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const targetUrl = url || (typeof window !== "undefined" ? window.location.href : "");

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || title,
          url: targetUrl,
        });
        return;
      } catch (err: any) {
        // If aborted by user, do nothing. If error, fallback to clipboard
        if (err?.name === "AbortError") return;
      }
    }

    // Fallback to clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(targetUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // ignore
      }
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleShare}
        className={cn(
          "relative p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all hover:scale-105 active:scale-95 shadow-md border border-white/15",
          className
        )}
        title={label || "مشاركة"}
        aria-label={label || "Share"}
      >
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
      </button>
    );
  }

  if (variant === "banner") {
    return (
      <button
        onClick={handleShare}
        className={cn(
          "inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md shadow-lg border border-white/20 text-xs sm:text-sm font-bold transition-all hover:scale-105 active:scale-95",
          className
        )}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400">{copiedLabel}</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{label || "مشاركة"}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-light hover:bg-surface text-xs sm:text-sm font-bold transition-all text-text-secondary hover:text-text-primary active:scale-95 shadow-xs",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-500" />
          <span className="text-emerald-600 dark:text-emerald-400">{copiedLabel}</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 text-accent-500" />
          <span>{label || "مشاركة"}</span>
        </>
      )}
    </button>
  );
}
