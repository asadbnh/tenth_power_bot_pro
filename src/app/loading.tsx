export default function Loading() {
  return (
    <div className="fixed top-0 inset-x-0 h-1 z-50 overflow-hidden bg-primary-500/10">
      <div className="h-full w-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 animate-[shimmer_1.5s_ease-in-out_infinite]" />
    </div>
  );
}


