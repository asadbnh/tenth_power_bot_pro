"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkPreviewData {
  url: string;
  title: string;
  description: string;
  image: string | null;
  siteName: string;
  domain: string;
  favicon: string;
}

interface SmartLinkPreviewProps {
  url: string;
  isRtl?: boolean;
  className?: string;
}

export function SmartLinkPreview({ url, isRtl = true, className }: SmartLinkPreviewProps) {
  const [data, setData] = useState<LinkPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success) {
          setData(json);
        } else if (isMounted) {
          try {
            const parsed = new URL(url);
            const domain = parsed.hostname.replace(/^www\./i, "");
            setData({
              url,
              title: domain,
              description: url,
              image: null,
              siteName: domain,
              domain,
              favicon: `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`,
            });
          } catch {
            setData(null);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          try {
            const parsed = new URL(url);
            const domain = parsed.hostname.replace(/^www\./i, "");
            setData({
              url,
              title: domain,
              description: url,
              image: null,
              siteName: domain,
              domain,
              favicon: `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`,
            });
          } catch {
            setData(null);
          }
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [url]);

  // Loading Skeleton (WhatsApp / Twitter style)
  if (isLoading) {
    return (
      <div
        className={cn(
          "my-6 rounded-2xl border border-slate-200 dark:border-white/10 p-4 bg-slate-50/50 dark:bg-white/[0.02] animate-pulse flex flex-col sm:flex-row gap-4",
          className
        )}
      >
        <div className="w-full sm:w-44 h-28 bg-slate-200 dark:bg-white/10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2.5 py-1">
          <div className="w-24 h-4 bg-slate-200 dark:bg-white/10 rounded-md" />
          <div className="w-3/4 h-5 bg-slate-200 dark:bg-white/10 rounded-md" />
          <div className="w-full h-3.5 bg-slate-200 dark:bg-white/10 rounded-md" />
          <div className="w-2/3 h-3.5 bg-slate-200 dark:bg-white/10 rounded-md" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold underline underline-offset-4 hover:text-amber-700 dark:hover:text-amber-300"
      >
        <span>{url}</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    );
  }

  const hasImage = Boolean(data.image && !imageFailed);

  return (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      dir={isRtl ? "rtl" : "ltr"}
      className={cn(
        "group my-6 block rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#0c1427]/80 hover:bg-white dark:hover:bg-[#0e172e] hover:border-amber-500/40 dark:hover:border-amber-500/30 hover:shadow-xl transition-all duration-300 overflow-hidden no-underline",
        isRtl ? "text-right" : "text-left",
        className
      )}
    >
      <div className={cn("flex flex-col", hasImage ? "sm:flex-row items-stretch" : "")}>
        {/* Preview Thumbnail */}
        {hasImage && (
          <div className="relative sm:w-52 md:w-60 h-44 sm:h-auto shrink-0 bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <img
              src={data.image!}
              alt={data.title}
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>
        )}

        {/* Content Box */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5">
          {/* Header row: Favicon + Domain */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 font-medium">
              {data.favicon ? (
                <img
                  src={data.favicon}
                  alt=""
                  className="w-4 h-4 rounded-sm shrink-0 object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <Globe className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              )}
              <span className="truncate max-w-[200px] text-slate-600 dark:text-slate-300 font-semibold">
                {data.siteName || data.domain}
              </span>
            </div>

            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition-colors shrink-0" />
          </div>

          {/* Title */}
          <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
            {data.title}
          </h4>

          {/* Description */}
          {data.description && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300/90 line-clamp-2 leading-relaxed">
              {data.description}
            </p>
          )}

          {/* URL domain link badge */}
          <div className="pt-1 flex items-center gap-1 text-[11px] text-amber-700/80 dark:text-amber-400/80 font-mono truncate">
            <span>{data.domain}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
