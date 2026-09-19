import { SkeletonBox } from "@/components/ui/Skeleton";

export default function LocaleLoading() {
  return (
    <div className="w-full relative min-h-[60vh] animate-in fade-in duration-300">
      {/* Top micro progress indicator */}
      <div className="fixed top-0 inset-x-0 h-1 z-50 overflow-hidden bg-primary-500/10">
        <div className="h-full w-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 animate-[shimmer_1.5s_ease-in-out_infinite]" />
      </div>

      {/* Hero section skeleton */}
      <section className="relative py-14 sm:py-20 border-b border-border-light bg-surface-elevated/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-4">
          <SkeletonBox className="h-6 w-32 rounded-full" />
          <SkeletonBox className="h-10 w-72 sm:w-96 rounded-2xl" />
          <SkeletonBox className="h-4 w-60 sm:w-80 rounded-xl" />
        </div>
      </section>

      {/* Content grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main card skeleton */}
          <div className="lg:col-span-7 rounded-3xl border border-border-light bg-surface-elevated/50 p-6 sm:p-8 space-y-6">
            <SkeletonBox className="h-7 w-48 rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkeletonBox className="h-12 w-full rounded-xl" />
              <SkeletonBox className="h-12 w-full rounded-xl" />
            </div>
            <SkeletonBox className="h-12 w-full rounded-xl" />
            <SkeletonBox className="h-32 w-full rounded-2xl" />
            <SkeletonBox className="h-12 w-44 rounded-xl" />
          </div>

          {/* Side card skeleton */}
          <div className="lg:col-span-5 rounded-3xl border border-border-light bg-surface-elevated/50 p-6 sm:p-8 space-y-5">
            <SkeletonBox className="h-7 w-40 rounded-xl" />
            <SkeletonBox className="h-16 w-full rounded-2xl" />
            <SkeletonBox className="h-16 w-full rounded-2xl" />
            <SkeletonBox className="h-16 w-full rounded-2xl" />
            <SkeletonBox className="h-14 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}