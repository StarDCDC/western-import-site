export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[var(--color-dark-bg)]">
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded w-48 mb-4" />
        <div className="h-1 bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded w-16 mb-8" />
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded w-5/6" />
          <div className="h-4 bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded w-4/6" />
          <div className="h-32 bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded" />
          <div className="h-4 bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}
