"use client";

import { useState, useEffect, useCallback } from "react";

interface Page {
  id: string;
  slug: string;
  titleRo: string;
  contentRo: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  updatedAt: string;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Page | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pages");
      const json = await res.json();
      if (json.success) {
        setPages(json.data || []);
        if (json.data?.length && !selectedId) {
          setSelectedId(json.data[0].id);
          setForm(json.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const selectPage = (id: string) => {
    const p = pages.find((x) => x.id === id);
    if (p) { setSelectedId(id); setForm({ ...p }); setSaved(false); }
  };

  const set = (k: keyof Page, v: string | boolean) => {
    if (!form) return;
    setForm({ ...form, [k]: v } as Page);
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          titleRo: form.titleRo,
                    contentRo: form.contentRo,
                    metaTitle: form.metaTitle,
          metaDescription: form.metaDescription,
          isPublished: form.isPublished,
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchPages();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert(json.error || "Eroare");
      }
    } catch {
      alert("Eroare");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" /></div>;
  }

  if (!form) {
    return <div className="text-center py-20 text-slate-400">Nu sunt pagini</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pagini</h1>
        {saved && <span className="text-green-600 dark:text-green-400 text-sm font-medium">✓ Salvat!</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Page list */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pagini site</p>
          </div>
          <div>
            {pages.map((p) => (
              <button key={p.id} onClick={() => selectPage(p.id)} className={`w-full text-left px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-700/50 transition ${selectedId === p.id ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium" : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/30"}`}>
                <span className="font-medium">{p.titleRo}</span>
                <span className="block text-xs text-slate-400 mt-0.5">/{p.slug}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{form.titleRo}</h2>
            <span className="text-xs text-slate-400">Actualizat: {new Date(form.updatedAt).toLocaleDateString("ro-RO")}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titlu (RO)</label>
              <input value={form.titleRo || ""} onChange={(e) => set("titleRo", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titlu (RU)</label>
              
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Conținut (RO)</label>
              <textarea value={form.contentRo || ""} onChange={(e) => set("contentRo", e.target.value)} rows={12} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Conținut (RU)</label>
              
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">SEO</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Meta Title</label>
                <input value={form.metaTitle || ""} onChange={(e) => set("metaTitle", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Meta Description</label>
                <input value={form.metaDescription || ""} onChange={(e) => set("metaDescription", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg text-sm transition disabled:opacity-50">
              {saving ? "Se salvează..." : "Salvează pagina"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}