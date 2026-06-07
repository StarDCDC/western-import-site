export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[var(--color-dark-bg)]">
      <div className="max-w-7xl mx-auto px-5 py-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-[16/9] bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded-2xl" />
            <div className="h-6 bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded w-3/4" />
            <div className="h-4 bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded w-1/2" />
            <div className="h-20 bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded" />
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded-xl" />
            <div className="h-32 bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
