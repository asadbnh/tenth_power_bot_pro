/**
 * Skeleton & Shimmer Loading Components
 * Used globally across the site for image and card loading states.
 */

import { cn } from "@/lib/utils";

/* ─── Base Shimmer Box ─────────────────────────────────────────────────── */
export function SkeletonBox({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-white/5",
        "before:absolute before:inset-0 before:translate-x-[-200%]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/8 before:to-transparent",
        "before:animate-[shimmer_1.6s_ease-in-out_infinite]",
        className
      )}
    />
  );
}

/* ─── Image Skeleton ───────────────────────────────────────────────────── */
export function SkeletonImage({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-white/5", className)}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-10 h-10 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  );
}

/* ─── Service Card Skeleton ────────────────────────────────────────────── */
export function SkeletonServiceCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border-light bg-surface-elevated">
      <SkeletonImage className="h-48 w-full" />
      <div className="p-5 space-y-3">
        <SkeletonBox className="h-5 w-3/4 rounded-full" />
        <SkeletonBox className="h-3.5 w-full rounded-full" />
        <SkeletonBox className="h-3.5 w-5/6 rounded-full" />
        <SkeletonBox className="h-8 w-24 rounded-xl mt-2" />
      </div>
    </div>
  );
}

/* ─── Project Card Skeleton ────────────────────────────────────────────── */
export function SkeletonProjectCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border-light bg-surface-elevated">
      <SkeletonImage className="h-56 w-full" />
      <div className="p-4 space-y-2.5">
        <SkeletonBox className="h-5 w-4/5 rounded-full" />
        <SkeletonBox className="h-3.5 w-1/2 rounded-full" />
        <div className="flex gap-2">
          <SkeletonBox className="h-6 w-16 rounded-full" />
          <SkeletonBox className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ─── Article Card Skeleton ────────────────────────────────────────────── */
export function SkeletonArticleCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border-light bg-surface-elevated">
      <SkeletonImage className="h-44 w-full" />
      <div className="p-5 space-y-3">
        <SkeletonBox className="h-3.5 w-1/3 rounded-full" />
        <SkeletonBox className="h-5 w-full rounded-full" />
        <SkeletonBox className="h-3.5 w-4/5 rounded-full" />
        <SkeletonBox className="h-3.5 w-3/5 rounded-full" />
        <div className="flex justify-between pt-1">
          <SkeletonBox className="h-3 w-1/4 rounded-full" />
          <SkeletonBox className="h-3 w-1/4 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ─── Gallery Card Skeleton ────────────────────────────────────────────── */
export function SkeletonGalleryCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl overflow-hidden border border-border-light bg-surface-elevated", className)}>
      <SkeletonImage className="w-full h-full" />
    </div>
  );
}

/* ─── Gallery Albums Grid Skeleton ────────────────────────────────────── */
export function SkeletonGalleryAlbums({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-border-light bg-surface-elevated">
          <SkeletonImage className="h-48 w-full" />
          <div className="p-4 space-y-2">
            <SkeletonBox className="h-5 w-2/3 rounded-full" />
            <SkeletonBox className="h-3.5 w-1/3 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
