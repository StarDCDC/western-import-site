export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[var(--color-dark-bg)]">
      <div className="max-w-[1280px] mx-auto px-5 py-8">
        {/* Hero skeleton */}
        <div className="animate-pulse">
          <div className="h-[300px] bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded-2xl mb-8" />
          {/* Category cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded-xl" />
            ))}
          </div>
          {/* Product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded-xl" />
                <div className="h-4 bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
