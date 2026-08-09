"use client";

import { HeroBackgroundMedia, type PageHeroKey } from "@/components/ui/HeroBackgroundMedia";

export type { PageHeroKey };

interface PageHeroBackgroundProps {
  pageKey: PageHeroKey;
  overlayOpacity?: number;
  className?: string;
}

/**
 * PageHeroBackground Component
 *
 * Delegate background video/image rendering to HeroBackgroundMedia.
 * Reads JSON settings (company.json and page-heroes.json) to display background video or image(s).
 * If neither is specified or while loading / upon error, keeps the default ambient/canvas backdrop intact.
 */
export function PageHeroBackground({
  pageKey,
  overlayOpacity = 0.3,
  className = "",
}: PageHeroBackgroundProps) {
  return (
    <HeroBackgroundMedia
      pageKey={pageKey}
      overlayOpacity={overlayOpacity}
      className={className}
    />
  );
}
