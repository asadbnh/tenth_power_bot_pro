"use client";

import { useState } from "react";
import { Play, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface YouTubeEmbedProps {
  videoId: string;
  url: string;
  title?: string;
  isRtl?: boolean;
  className?: string;
}

export function YouTubeEmbed({
  videoId,
  url,
  title,
  isRtl = true,
  className,
}: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Max resolution thumbnail, with fallback to high quality
  const thumbnailUrl = imgError
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div
      className={cn(
        "my-8 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl bg-slate-900 group transition-all duration-300",
        className
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950 flex items-center justify-center">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title || "YouTube video player"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label={isRtl ? "تشغيل الفيديو" : "Play video"}
            className="w-full h-full relative cursor-pointer text-left focus:outline-hidden"
          >
            {/* Thumbnail */}
            <img
              src={thumbnailUrl}
              alt={title || "YouTube video thumbnail"}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
              loading="lazy"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none" />

            {/* Top Video Title Bar */}
            <div className="absolute top-0 inset-x-0 p-4 sm:p-5 flex items-center justify-between gap-3 text-white pointer-events-none">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md font-bold text-xs">
                  ▶
                </span>
                <span className="font-semibold text-xs sm:text-sm drop-shadow-md line-clamp-1">
                  {title || (isRtl ? "فيديو يوتيوب" : "YouTube Video")}
                </span>
              </div>

              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/90">
                YouTube
              </span>
            </div>

            {/* Big Center Play Button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 group-hover:bg-red-500 text-white flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 ring-4 ring-white/30 group-hover:ring-white/50">
                <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-current translate-x-0.5" />
              </div>
            </div>

            {/* Bottom Bar Info */}
            <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 flex items-center justify-between text-xs text-white/80 pointer-events-auto">
              <span className="pointer-events-none">{isRtl ? "انقر للتشغيل داخل المقال" : "Click to play"}</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              >
                <span>{isRtl ? "فتح في يوتيوب" : "Open in YouTube"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
