"use client";

import { useState, useEffect } from "react";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  ctaButton: string;
  position: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

const defaultBanners: Banner[] = [
  { id: "1", title: "Reduceri de Iarnă -40%", subtitle: "La toate laminatele și parchetele", image: "❄️", link: "/catalog?sale=winter", ctaButton: "Vezi reduceri", position: "hero", startDate: "2024-12-01", endDate: "2025-01-15", active: true },
  { id: "2", title: "Uși noi în stoc!", subtitle: "Colecția 2025 de la Porta Prima", image: "🚪", link: "/catalog?category=usi", ctaButton: "Descoperă", position: "middle", startDate: "2024-12-10", endDate: "2025-02-28", active: true },
  { id: "3", title: "Transport Gratuit", subtitle: "La comenzi peste 3000 MDL în Chișinău", image: "🚚", link: "/catalog", ctaButton: "Comandă acum", position: "sidebar", startDate: "2024-01-01", endDate: "2025-12-31", active: true },
];

const positions = ["hero", "middle", "sidebar", "footer"];

function loadBanners(): Banner[] {
  if (typeof window === "undefined") return defaultBanners;
  const s = localStorage.getItem("wi_admin_banners");
  if (s) { try { return JSON.parse(s); } catch {} }
  localStorage.setItem("wi_admin_banners", JSON.stringify(defaultBanners));
  return defaultBanners;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", image: "", link: "", ctaButton: "", position: "hero", startDate: "", endDate: "", active: true });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setBanners(loadBanners()); setMounted(true); }, []);

  const save = (b: Banner[]) => { setBanners(b); localStorage.setItem("wi_admin_banners", JSON.stringify(b)); };
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const resetForm = () => setForm({ title: "", subtitle: "", image: "", link: "", ctaButton: "", position: "hero", startDate: "", endDate: "", active: true });

  const handleAdd = () => {
    if (!form.title) return;
    const newBanner: Banner = { id: String(Date.now()), ...form };
    save([...banners, newBanner]);
    resetForm(); setAdding(false);
  };

  const handleEdit = (b: Banner) => {
    setEditing(b.id);
    setForm({ title: b.title, subtitle: b.subtitle, image: b.image, link: b.link, ctaButton: b.ctaButton, position: b.position, startDate: b.startDate, endDate: b.endDate, active: b.active });
  };

  const handleSaveEdit = (id: string) => {
    save(banners.map((b) => b.id === id ? { ...b, ...form } : b));
    setEditing(null); resetForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Sigur vrei să ștergi acest banner?")) return;
    save(banners.filter((b) => b.id !== id));
  };

  const toggleActive = (id: string) => {
    save(banners.map((b) => b.id === id ? { ...b, active: !b.active } : b));
  };

  if (!mounted) return null;

  const posColors: Record<string, string> = { hero: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", middle: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", sidebar: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400", footer: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bannere</h1>
        <button onClick={() => { setAdding(true); resetForm(); }} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition">+ Adaugă banner</button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-amber-300 dark:border-amber-600 p-6 space-y-4">
          <h3 className="font-medium text-slate-900 dark:text-white">Banner nou</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titlu *</label><input value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subtitlu</label><input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Imagine (emoji/URL)</label><input value={form.image} onChange={(e) => set("image", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link</label><input value={form.link} onChange={(e) => set("link", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Buton CTA</label><input value={form.ctaButton} onChange={(e) => set("ctaButton", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Poziție</label><select value={form.position} onChange={(e) => set("position", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none">{positions.map((p) => <option key={p}>{p}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dată start</label><input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dată sfârșit</label><input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="rounded" /><span className="text-sm text-slate-700 dark:text-slate-300">Activ</span></label>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm">Salvează</button>
            <button onClick={() => { setAdding(false); resetForm(); }} className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm">Anulează</button>
          </div>
        </div>
      )}

      {/* Banner list */}
      <div className="space-y-4">
        {banners.map((b) => {
          const isEditing = editing === b.id;
          return (
            <div key={b.id} className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border overflow-hidden ${b.active ? "border-slate-200 dark:border-slate-700" : "border-slate-200 dark:border-slate-700 opacity-60"}`}>
              {isEditing ? (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titlu</label><input value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subtitlu</label><input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Imagine</label><input value={form.image} onChange={(e) => set("image", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link</label><input value={form.link} onChange={(e) => set("link", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CTA</label><input value={form.ctaButton} onChange={(e) => set("ctaButton", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Poziție</label><select value={form.position} onChange={(e) => set("position", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none">{positions.map((p) => <option key={p}>{p}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start</label><input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End</label><input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
                  </div>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="rounded" /><span className="text-sm text-slate-700 dark:text-slate-300">Activ</span></label>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(b.id)} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm">Salvează</button>
                    <button onClick={() => { setEditing(null); resetForm(); }} className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm">Anulează</button>
                  </div>
                </div>
              ) : (
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">{b.image}</div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{b.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{b.subtitle}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${posColors[b.position] || posColors.footer}`}>{b.position}</span>
                          {b.ctaButton && <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs">{b.ctaButton}</span>}
                          <span className="text-xs text-slate-400">{b.startDate} — {b.endDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => toggleActive(b.id)} className={`px-3 py-1 rounded-lg text-xs font-medium ${b.active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"}`}>{b.active ? "Activ" : "Inactiv"}</button>
                      <button onClick={() => handleEdit(b)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(b.id)} className="text-xs text-red-600 dark:text-red-400 hover:underline">Șterge</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
