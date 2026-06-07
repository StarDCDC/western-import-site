export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[var(--color-dark-bg)]">
      <div className="max-w-[1280px] mx-auto px-5 py-8 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          <div className="bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded-2xl h-96" />
          <div className="space-y-4">
            <div className="bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded-2xl h-48" />
            <div className="bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded-2xl h-40" />
            <div className="bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded-2xl h-48" />
          </div>
        </div>
      </div>
    </div>
  );
}
