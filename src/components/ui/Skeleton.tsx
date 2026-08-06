import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width of the skeleton (defaults to full width) */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Whether it's a circle (avatar) skeleton */
  circle?: boolean;
}

/**
 * Skeleton loading component with shimmer animation.
 * Used as placeholder while content loads.
 */
export function Skeleton({
  className,
  width,
  height,
  circle = false,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-lg",
        circle && "rounded-full",
        className
      )}
      style={{
        width: width ?? "100%",
        height: height ?? "1rem",
      }}
      role="status"
      aria-label="Loading..."
      {...props}
    />
  );
}

/** Text skeleton — simulates a paragraph */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="0.875rem"
          width={i === lines - 1 ? "60%" : "100%"}
        />
      ))}
    </div>
  );
}

/** Card skeleton — simulates a content card */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-light p-4 space-y-4",
        className
      )}
    >
      <Skeleton height="12rem" className="rounded-lg" />
      <Skeleton height="1.25rem" width="75%" />
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <Skeleton height="2rem" width="5rem" className="rounded-md" />
        <Skeleton height="2rem" width="5rem" className="rounded-md" />
      </div>
    </div>
  );
}
