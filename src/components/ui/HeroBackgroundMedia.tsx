"use client";

import { useState, useEffect, useRef } from "react";
import companyData from "../../../public/fallback-data/company.json";
import pageHeroesData from "../../../public/fallback-data/page-heroes.json";

export type PageHeroKey = keyof typeof pageHeroesData;

interface HeroBackgroundMediaProps {
  pageKey?: PageHeroKey;
  overlayOpacity?: number;
  className?: string;
}

/**
 * HeroBackgroundMedia Component
 *
 * Dynamically loads background video or image(s) based on JSON configuration (company.json / page-heroes.json).
 *
 * Requirements met:
 * 1. Displays video or image(s) according to JSON settings.
 * 2. If neither video nor image is specified in JSON (or disabled), the base design remains completely unchanged.
 * 3. While video or image is still loading (or if loading fails), the base design remains fully visible as fallback.
 * 4. Smooth opacity transition once media loading completes.
 */
export function HeroBackgroundMedia({
  pageKey = "home",
  overlayOpacity = 0.55,
  className = "",
}: HeroBackgroundMediaProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const cData = companyData as Record<string, any>;
  const pHeroes = pageHeroesData as Record<string, any>;

  // Check page-specific overrides in page-heroes.json if present
  const pageSpecific = pHeroes[pageKey];

  // Determine configured background type ("video" | "image" | "slideshow" | "none" | "auto")
  const bgType: string = (
    pageSpecific?.type ||
    cData.hero_bg_type ||
    "auto"
  ).toLowerCase();

  // Video URL from JSON
  const videoUrl: string | null =
    pageSpecific?.video_url || cData.hero_video_url || null;

  // Single Image URL from JSON
  const singleImage: string | null =
    pageSpecific?.image_url ||
    cData.hero_image_url ||
    cData.hero_fallback_image ||
    (typeof pageSpecific === "string" ? pageSpecific : null);

  // Images list from JSON
  const rawImages: any[] = pageSpecific?.images || cData.hero_images || [];
  const imagesList: string[] = Array.isArray(rawImages)
    ? rawImages.filter((img) => typeof img === "string" && img.trim().length > 0)
    : singleImage
    ? [singleImage]
    : [];

  // Determine effective media mode to attempt
  let effectiveType: "video" | "slideshow" | "image" | "none" = "none";

  if (bgType === "video" && videoUrl) {
    effectiveType = "video";
  } else if (bgType === "slideshow" && imagesList.length > 0) {
    effectiveType = "slideshow";
  } else if (
    (bgType === "image" || bgType === "photo") &&
    (singleImage || imagesList.length > 0)
  ) {
    effectiveType = imagesList.length > 1 ? "slideshow" : "image";
  } else if (bgType === "none" || bgType === "off") {
    effectiveType = "none";
  } else {
    // "auto" or default mode: priority -> video -> slideshow -> single image -> none
    if (videoUrl && videoUrl.trim().length > 0) {
      effectiveType = "video";
    } else if (imagesList.length > 1) {
      effectiveType = "slideshow";
    } else if (singleImage || imagesList.length === 1) {
      effectiveType = "image";
    }
  }

  // Handle image slideshow rotation if multiple images provided
  useEffect(() => {
    if (effectiveType !== "slideshow" || imagesList.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImageIdx((prev) => (prev + 1) % imagesList.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [effectiveType, imagesList.length]);

  // Attempt video playback when component mounts or mode switches to video
  useEffect(() => {
    if (effectiveType === "video" && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay handled safely
      });
    }
  }, [effectiveType]);

  // If no media is specified in JSON or an error occurred during load, render nothing (base design remains)
  if (effectiveType === "none" || hasError) {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden ${className}`}>
      {effectiveType === "video" && videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          onCanPlayThrough={() => setIsLoaded(true)}
          onLoadedData={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          style={{ opacity: isLoaded ? overlayOpacity : 0 }}
          className="w-full h-full object-cover transition-opacity duration-1000 ease-out"
        />
      ) : effectiveType === "slideshow" && imagesList.length > 0 ? (
        <img
          key={imagesList[activeImageIdx]}
          src={imagesList[activeImageIdx]}
          alt=""
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          style={{ opacity: isLoaded ? overlayOpacity : 0 }}
          className="w-full h-full object-cover transition-opacity duration-1000 ease-out"
        />
      ) : effectiveType === "image" && (singleImage || imagesList[0]) ? (
        <img
          src={singleImage || imagesList[0]}
          alt=""
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          style={{ opacity: isLoaded ? overlayOpacity : 0 }}
          className="w-full h-full object-cover transition-opacity duration-1000 ease-out"
        />
      ) : null}
    </div>
  );
}
