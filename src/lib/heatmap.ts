// ─── Heatmap Click Tracking ───────────────────────────────────────

export async function trackClick(page: string, x: number, y: number, width: number) {
  try {
    await fetch('/api/analytics/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page,
        x,
        y,
        width,
        userAgent: navigator.userAgent.substring(0, 200),
      }),
    });
  } catch { /* ignore */ }
}

export function initHeatmapTracking() {
  if (typeof window === 'undefined') return;

  let clickTimeout: ReturnType<typeof setTimeout>;

  document.addEventListener('click', (e) => {
    clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => {
      const target = e.target as HTMLElement;
      // Only track clicks on main content areas, not admin
      if (window.location.pathname.startsWith('/admin')) return;

      trackClick(
        window.location.pathname,
        e.clientX,
        e.clientY,
        window.innerWidth,
      );
    }, 100);
  }, { passive: true });
}
