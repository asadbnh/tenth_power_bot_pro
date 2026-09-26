"use client";

import { useState } from "react";
import { Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichImageEmbedProps {
  src: string;
  alt?: string;
  caption?: string;
  isRtl?: boolean;
  className?: string;
}

export function RichImageEmbed({
  src,
  alt,
  caption,
  isRtl = true,
  className,
}: RichImageEmbedProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const displayCaption = caption || alt;

  if (imgError) {
    return (
      <div className="my-6 p-4 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 text-center text-xs text-slate-400">
        <span>{isRtl ? "تعذر تحميل الصورة:" : "Could not load image:"} {src}</span>
      </div>
    );
  }

  return (
    <>
      <figure
        className={cn(
          "my-8 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.03] shadow-xl group transition-all duration-300",
          className
        )}
      >
        <div className="relative overflow-hidden cursor-zoom-in" onClick={() => setIsOpen(true)}>
          <img
            src={src}
            alt={alt || "Article illustration"}
            onError={() => setImgError(true)}
            loading="lazy"
            className="w-full max-h-[550px] object-cover transition-transform duration-500 group-hover:scale-103"
          />

          {/* Hover Zoom Overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white shadow-xl">
              <Maximize2 className="w-5 h-5" />
            </span>
          </div>
        </div>

        {/* Caption */}
        {displayCaption && (
          <figcaption className="p-3.5 sm:p-4 text-center text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#0a1020] border-t border-slate-200/80 dark:border-white/10">
            {displayCaption}
          </figcaption>
        )}
      </figure>

      {/* Lightbox Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label={isRtl ? "إغلاق" : "Close"}
            className="absolute top-4 end-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col items-center">
            <img
              src={src}
              alt={alt || ""}
              className="max-w-full max-h-[82vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            {displayCaption && (
              <p className="mt-3 text-white/90 text-sm font-medium text-center px-4" onClick={(e) => e.stopPropagation()}>
                {displayCaption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
