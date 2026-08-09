"use client";

import { useState } from "react";
import { AnimatedCanvasBanner } from "@/components/ui/AnimatedCanvasBanner";

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
 * SmartFallbackImage Component
 * 
 * Renders standard image if src is valid and loads successfully.
 * Automatically switches to AnimatedCanvasBanner if src is null/undefined or fails to load (onError).
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
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
