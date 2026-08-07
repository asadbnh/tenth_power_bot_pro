"use client";

import { useState } from "react";
import pageHeroesData from "../../../public/fallback-data/page-heroes.json";

export type PageHeroKey = keyof typeof pageHeroesData;

interface PageHeroBackgroundProps {
  pageKey: PageHeroKey;
  overlayOpacity?: number;
  className?: string;
}

/**
 * PageHeroBackground Component
 * 
 * Attempts to load a background image from public/fallback-data/page-heroes.json.
 * If image path is null, undefined, or fails to load (onError), it gracefully 
 * leaves the existing dark gradient/ambient lighting background as-is.
 */
export function PageHeroBackground({
  pageKey,
  overlayOpacity = 0.3,
  className = "",
}: PageHeroBackgroundProps) {
  const [hasError, setHasError] = useState(false);
  const bgImage = pageHeroesData[pageKey];

  if (!bgImage || hasError) {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden ${className}`}>
      <img
        src={bgImage}
        alt=""
        style={{ opacity: overlayOpacity }}
        className="w-full h-full object-cover mix-blend-overlay transition-opacity duration-700"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
