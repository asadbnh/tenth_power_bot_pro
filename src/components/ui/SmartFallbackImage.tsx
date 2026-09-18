"use client";

import { useState } from "react";
import { AnimatedCanvasBanner } from "@/components/ui/AnimatedCanvasBanner";
import { cn } from "@/lib/utils";

interface SmartFallbackImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  aspectRatio?: "square" | "video" | "wide" | "tall" | "auto" | string;
  title?: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
}

/**
 * SmartFallbackImage
 * - Shows shimmer skeleton while the image is loading
 * - Fades the image in once loaded
 * - Falls back to AnimatedCanvasBanner only when src is null/undefined or broken
 */
export function SmartFallbackImage({
  src,
  alt,
  className = "w-full h-full object-cover",
  aspectRatio = "video",
  title,
  subtitle,
  badge,
  icon,
}: SmartFallbackImageProps) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || hasError) {
    return (
      <AnimatedCanvasBanner
        className={className}
        aspectRatio={aspectRatio}
        title={title || alt}
        subtitle={subtitle}
        badge={badge}
        icon={icon}
      />
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {!loaded && (
        <div className="absolute inset-0 skeleton flex items-center justify-center">
          <svg className="w-10 h-10 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(className, "transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
