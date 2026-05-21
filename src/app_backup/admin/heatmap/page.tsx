'use client';

import { useState, useEffect, useCallback } from 'react';
import { Flame, RefreshCw } from 'lucide-react';

interface ClickPoint {
  x: number;
  y: number;
  width: number;
}

interface PageInfo {
  page: string;
  count: number;
}

export default function HeatmapAdmin() {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [selectedPage, setSelectedPage] = useState('/');
  const [clicks, setClicks] = useState<ClickPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [opacity, setOpacity] = useState(0.6);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/click?page=${encodeURIComponent(selectedPage)}&days=7`);
      if (res.ok) {
        const data = await res.json();
        setClicks(data.clicks || []);
        if (data.pages) setPages(data.pages);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [selectedPage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" /> Heatmap
          </h1>
          <p className="text-sm text-slate-500 mt-1">Vizualizare clicuri pe pagini</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Page selector */}
      <div className="flex flex-wrap gap-2">
        {pages.map(p => (
          <button
            key={p.page}
            onClick={() => setSelectedPage(p.page)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedPage === p.page ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
          >
            {p.page} ({p.count})
          </button>
        ))}
      </div>

      {/* Opacity */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-600 dark:text-slate-300">Opacitate:</label>
        <input type="range" min="0.1" max="1" step="0.1" value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="w-40" />
      </div>

      {/* Heatmap canvas */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="h-96 flex items-center justify-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        ) : clicks.length === 0 ? (
          <div className="h-96 flex items-center justify-center text-slate-400">
            <p>Nicio dată de heatmap pentru pagina {selectedPage}</p>
          </div>
        ) : (
          <div className="relative h-96 bg-slate-50 dark:bg-slate-900">
            <div className="absolute inset-0 overflow-hidden">
              {clicks.map((click, i) => {
                const relX = click.width > 0 ? (click.x / click.width) * 100 : 50;
                const relY = (click.y / 1000) * 100;
                return (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: `${Math.min(100, Math.max(0, relX))}%`,
                      top: `${Math.min(100, Math.max(0, relY))}%`,
                      width: '24px',
                      height: '24px',
                      transform: 'translate(-50%, -50%)',
                      background: `rgba(255, 69, 0, ${opacity})`,
                      boxShadow: `0 0 12px rgba(255, 69, 0, ${opacity * 0.5})`,
                      borderRadius: '50%',
                    }}
                  />
                );
              })}
            </div>
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {clicks.length} clicuri
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
