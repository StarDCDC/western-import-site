"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const catOptions = ["Parchet", "Laminat", "Uși", "Decor", "Tapet", "Vopsea", "Mochetă", "Accesorii"];
const brandOptions = ["Kronotex", "Quick-Step", "Porta Prima", "Wildör", "AS Creation", "MOSO", "Caparol", "Desso", "d-c-fix", "Altele"];

interface Spec { key: string; value: string; }

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({
    name: "", descriptionRO: "", descriptionRU: "", price: "", oldPrice: "",
    stock: "", sku: "", category: catOptions[0], brand: brandOptions[0],
    active: true, featured: false,
  });
  const [specs, setSpecs] = useState<Spec[]>([{ key: "", value: "" }]);

  useEffect(() => {
    const products = JSON.parse(localStorage.getItem("wi_admin_products") || "[]");
    const p = products.find((x: any) => x.id === id);
    if (p) {
      setForm({
        name: p.name || "", descriptionRO: p.descriptionRO || "", descriptionRU: p.descriptionRU || "",
        price: String(p.price || ""), oldPrice: p.oldPrice ? String(p.oldPrice) : "",
        stock: String(p.stock || ""), sku: p.sku || "", category: p.category || catOptions[0],
        brand: p.brand || brandOptions[0], active: p.active !== false, featured: !!p.featured,
      });
      if (p.specs?.length) setSpecs(p.specs);
    }
    setLoaded(true);
  }, [id]);

  const slug = form.name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
  const removeSpec = (i: number) => setSpecs(specs.filter((_, idx) => idx !== i));
  const updateSpec = (i: number, field: "key" | "value", val: string) => {
    const s = [...specs]; s[i][field] = val; setSpecs(s);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      const products = JSON.parse(localStorage.getItem("wi_admin_products") || "[]");
      const idx = products.findIndex((x: any) => x.id === id);
      if (idx >= 0) {
        products[idx] = {
          ...products[idx],
          name: form.name, slug, descriptionRO: form.descriptionRO, descriptionRU: form.descriptionRU,
          price: Number(form.price) || 0, oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
          stock: Number(form.stock) || 0, sku: form.sku, category: form.category,
          brand: form.brand, active: form.active, featured: form.featured,
          specs: specs.filter((s) => s.key && s.value),
        };
        localStorage.setItem("wi_admin_products", JSON.stringify(products));
      }
      router.push("/admin/products");
    }, 300);
  };

  if (!loaded) return <div className="text-slate-400 text-center py-20">Se încarcă...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Editare produs</h1>
        <button onClick={() => router.back()} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">← Înapoi</button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900 dark:text-white text-lg border-b border-slate-200 dark:border-slate-700 pb-2">Informații generale</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nume produs *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug (auto)</label>
            <input value={slug} readOnly className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-600 text-slate-500 dark:text-slate-300 text-sm cursor-not-allowed" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descriere (RO)</label>
            <textarea value={form.descriptionRO} onChange={(e) => set("descriptionRO", e.target.value)} rows={4} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-sm resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descriere (RU)</label>
            <textarea value={form.descriptionRU} onChange={(e) => set("descriptionRU", e.target.value)} rows={4} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-sm resize-none" />
          </div>
        </div>

        <h2 className="font-semibold text-slate-900 dark:text-white text-lg border-b border-slate-200 dark:border-slate-700 pb-2 pt-2">Preț și stoc</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preț (MDL) *</label>
            <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preț vechi (MDL)</label>
            <input type="number" value={form.oldPrice} onChange={(e) => set("oldPrice", e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stoc *</label>
            <input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cod SKU</label>
            <input value={form.sku} onChange={(e) => set("sku", e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categorie</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-sm">
              {catOptions.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Brand</label>
            <select value={form.brand} onChange={(e) => set("brand", e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-sm">
              {brandOptions.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <h2 className="font-semibold text-slate-900 dark:text-white text-lg border-b border-slate-200 dark:border-slate-700 pb-2 pt-2">Specificații</h2>
        <div className="space-y-2">
          {specs.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input value={s.key} onChange={(e) => updateSpec(i, "key", e.target.value)} placeholder="Nume" className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              <input value={s.value} onChange={(e) => updateSpec(i, "value", e.target.value)} placeholder="Valoare" className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              <button onClick={() => removeSpec(i)} className="px-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm">✕</button>
            </div>
          ))}
          <button onClick={addSpec} className="text-sm text-amber-600 dark:text-amber-400 hover:underline">+ Adaugă specificație</button>
        </div>

        <h2 className="font-semibold text-slate-900 dark:text-white text-lg border-b border-slate-200 dark:border-slate-700 pb-2 pt-2">Imagini</h2>
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center">
          <p className="text-4xl mb-2">📁</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Trage imagini aici sau click pentru upload</p>
          <p className="text-xs text-slate-400 mt-1">(Simulat)</p>
        </div>

        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Produs activ</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Recomandat</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving || !form.name || !form.price} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition">
          {saving ? "Se salvează..." : "Salvează modificările"}
        </button>
        <button onClick={() => router.back()} className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition">Anulează</button>
      </div>
    </div>
  );
}
