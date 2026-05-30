"use client";

import { useState, useEffect, useCallback } from "react";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  buttonText: string | null;
  position: string;
  order: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", image: "", link: "", buttonText: "", position: "HERO", order: 0, startDate: "", endDate: "", isActive: true });
  const [saving, setSaving] = useState(false);

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setImage: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (json.success) setImage(json.data.url);
      else alert(json.error || 'Upload eșuat');
    } catch { alert('Upload eșuat'); }
  };

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/banners");
      const json = await res.json();
      if (json.success) setBanners(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const resetForm = () => setForm({ title: "", subtitle: "", image: "", link: "", buttonText: "", position: "HERO", order: 0, startDate: "", endDate: "", isActive: true });
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleAdd = async () => {
    if (!form.title || !form.image) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        resetForm(); setAdding(false); fetchBanners();
      } else {
        alert(json.error || "Eroare");
      }
    } catch {
      alert("Eroare");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (b: Banner) => {
    setEditing(b.id);
    setForm({
      title: b.title,
      subtitle: b.subtitle || "",
      image: b.image,
      link: b.link || "",
      buttonText: b.buttonText || "",
      position: b.position,
      order: b.order ?? 0,
      startDate: b.startDate ? b.startDate.slice(0, 16) : "",
      endDate: b.endDate ? b.endDate.slice(0, 16) : "",
      isActive: b.isActive,
    });
  };

  const handleSaveEdit = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setEditing(null); resetForm(); fetchBanners();
      } else {
        alert(json.error || "Eroare");
      }
    } catch {
      alert("Eroare");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sigur vrei să ștergi acest banner?")) return;
    try {
      await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      fetchBanners();
    } catch {
      alert("Eroare");
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      fetchBanners();
    } catch {
      alert("Eroare");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" /></div>;
  }

  const posColors: Record<string, string> = { HERO: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", MIDDLE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", SIDEBAR: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400", FOOTER: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300" };

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
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Imagine (URL sau încarcă) *</label><div className="flex gap-2"><input value={form.image} onChange={(e) => set("image", e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" placeholder="https://... sau lasă gol și folosește butonul" /><label className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-1"><input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (v) => set("image", v))} />Încarcă</label></div>{form.image && <img src={form.image} alt="preview" className="mt-2 h-20 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}</div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link</label><input value={form.link} onChange={(e) => set("link", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Buton CTA</label><input value={form.buttonText} onChange={(e) => set("buttonText", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Poziție</label><select value={form.position} onChange={(e) => set("position", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"><option value="HERO">Hero</option><option value="MIDDLE">Middle</option><option value="SIDEBAR">Sidebar</option><option value="FOOTER">Footer</option></select></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ordine</label><input type="number" value={form.order} onChange={(e) => set("order", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dată start</label><input type="datetime-local" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dată sfârșit</label><input type="datetime-local" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="rounded" /><span className="text-sm text-slate-700 dark:text-slate-300">Activ</span></label>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm disabled:opacity-50">{saving ? "Se salvează..." : "Salvează"}</button>
            <button onClick={() => { setAdding(false); resetForm(); }} className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm">Anulează</button>
          </div>
        </div>
      )}

      {/* Banner list */}
      <div className="space-y-4">
        {banners.length === 0 && (
          <div className="text-center py-12 text-slate-400">Nu sunt bannere</div>
        )}
        {banners.map((b) => {
          const isEditing = editing === b.id;
          return (
            <div key={b.id} className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border overflow-hidden ${b.isActive ? "border-slate-200 dark:border-slate-700" : "border-slate-200 dark:border-slate-700 opacity-60"}`}>
              {isEditing ? (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titlu</label><input value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subtitlu</label><input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Imagine URL</label><div className="flex gap-2"><input value={form.image} onChange={(e) => set("image", e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" placeholder="https://..." /><label className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-1"><input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (v) => set("image", v))} />Încarcă</label></div>{form.image && <img src={form.image} alt="preview" className="mt-2 h-16 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}</div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link</label><input value={form.link} onChange={(e) => set("link", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CTA</label><input value={form.buttonText} onChange={(e) => set("buttonText", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Poziție</label><select value={form.position} onChange={(e) => set("position", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"><option value="HERO">Hero</option><option value="MIDDLE">Middle</option><option value="SIDEBAR">Sidebar</option><option value="FOOTER">Footer</option></select></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ordine</label><input type="number" value={form.order} onChange={(e) => set("order", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start</label><input type="datetime-local" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End</label><input type="datetime-local" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
                  </div>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="rounded" /><span className="text-sm text-slate-700 dark:text-slate-300">Activ</span></label>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(b.id)} disabled={saving} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm disabled:opacity-50">{saving ? "Se salvează..." : "Salvează"}</button>
                    <button onClick={() => { setEditing(null); resetForm(); }} className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm">Anulează</button>
                  </div>
                </div>
              ) : (
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                        {b.image ? <img src={b.image} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : "🖼️"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{b.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{b.subtitle || "—"}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${posColors[b.position] || posColors.HERO}`}>{b.position}</span>
                          {b.buttonText && <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs">{b.buttonText}</span>}
                          {b.link && <span className="text-xs text-slate-400 truncate max-w-[200px]">{b.link}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => toggleActive(b)} className={`px-3 py-1 rounded-lg text-xs font-medium ${b.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"}`}>{b.isActive ? "Activ" : "Inactiv"}</button>
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