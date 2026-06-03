"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Category { id: string; nameRo: string; nameRu: string; slug: string; }
interface Brand { id: string; name: string; slug: string; }

interface Spec { key: string; value: string; }

interface FormState {
  name: string;
  slug: string;
  descriptionRo: string;
  descriptionRu: string;
  price: string;
  oldPrice: string;
  sku: string;
  condition: string;
  categoryId: string;
  brandId: string;
  images: string;
  specs: string;
  isActive: boolean;
  isFeatured: boolean;
}

// Spec fields for tech products
const SPEC_FIELDS: { key: keyof FormState; label: string; placeholder: string }[] = [
  { key: 'display' as any, label: 'Display (ecran)', placeholder: 'ex: 15.6 inch' },
  { key: 'storage' as any, label: 'Spațiu de stocare', placeholder: 'ex: 512GB SSD' },
  { key: 'weight' as any, label: 'Greutate', placeholder: 'ex: 1.8 kg' },
  { key: 'refreshRate' as any, label: 'Frecvență ecran', placeholder: 'ex: 144Hz' },
  { key: 'ram' as any, label: 'Memorie RAM', placeholder: 'ex: 16GB DDR4' },
  { key: 'gpuModel' as any, label: 'Model Placă Video', placeholder: 'ex: RTX 4060' },
  { key: 'cpuModel' as any, label: 'Model Procesor', placeholder: 'ex: Intel i7-13700H' },
  { key: 'resolution' as any, label: 'Rezoluție', placeholder: 'ex: 1920x1080' },
  { key: 'gpuSeries' as any, label: 'Serie Placă Video', placeholder: 'ex: NVIDIA GeForce' },
  { key: 'cpuSeries' as any, label: 'Serie Procesor', placeholder: 'ex: Intel Core' },
  { key: 'os' as any, label: 'Sistem de Operare', placeholder: 'ex: Windows 11' },
  { key: 'storageType' as any, label: 'Tip Stocare', placeholder: 'ex: SSD' },
  { key: 'gpuType' as any, label: 'Tip Placă Video', placeholder: 'ex: Dedicată' },
];

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [specs, setSpecs] = useState<Spec[]>([{ key: "", value: "" }]);

  const [form, setForm] = useState<FormState>({
    name: "",
    slug: "",
    descriptionRo: "",
    descriptionRu: "",
    price: "",
    oldPrice: "",
    sku: "",
    condition: "NEW",
    categoryId: "",
    brandId: "",
    images: "[]",
    specs: "{}",
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories?flat=true');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
          if (json.data.length > 0) {
            setForm(f => ({ ...f, categoryId: json.data[0].id }));
          }
        }
      } catch (e) {
        console.error('Failed to load categories:', e);
      } finally {
        setLoadingCategories(false);
      }
    }

    async function loadBrands() {
      try {
        const res = await fetch('/api/admin/brands');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setBrands(json.data);
            if (json.data.length > 0) {
              setForm(f => ({ ...f, brandId: json.data[0].id }));
            }
          }
        } else {
          setBrands([]);
        }
      } catch (e) {
        console.error('Failed to load brands:', e);
      } finally {
        setLoadingBrands(false);
      }
    }

    loadCategories();
    loadBrands();
  }, []);

  const set = (k: keyof FormState, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const slug = form.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setForm(f => ({ ...f, slug }));
  }, [form.name]);

  const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
  const removeSpec = (i: number) => setSpecs(specs.filter((_, idx) => idx !== i));
  const updateSpec = (i: number, field: "key" | "value", val: string) => {
    const s = [...specs];
    s[i][field] = val;
    setSpecs(s);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (json.success) {
        let arr: string[] = [];
        try { arr = JSON.parse(form.images); } catch { arr = []; }
        arr.push(json.data.url);
        setForm(f => ({ ...f, images: JSON.stringify(arr) }));
      } else alert(json.error || 'Upload eșuat');
    } catch { alert('Upload eșuat'); }
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.categoryId || !form.brandId) {
      setSaveError('Completează câmpurile obligatorii: Nume, Preț, Categorie, Brand');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const specsObj: Record<string, string> = {};
      specs.forEach(s => {
        if (s.key && s.value) specsObj[s.key] = s.value;
      });

      let imagesArr: string[] = [];
      try { imagesArr = JSON.parse(form.images); } catch { imagesArr = []; }

      const payload: Record<string, unknown> = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        descriptionRo: form.descriptionRo || form.name,
        descriptionRu: form.descriptionRu || undefined,
        price: parseFloat(form.price),
        oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : undefined,
        stock: 0,
        sku: form.sku || undefined,
        condition: form.condition,
        categoryId: form.categoryId,
        brandId: form.brandId,
        images: JSON.stringify(imagesArr),
        specs: JSON.stringify(specsObj),
        isActive: form.isActive,
        isFeatured: form.isFeatured,
      };

      // Add spec fields
      SPEC_FIELDS.forEach(({ key }) => {
        const val = form[key as keyof FormState];
        if (val && typeof val === 'string' && val.trim()) {
          payload[key] = val.trim();
        }
      });

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        setSaveSuccess(true);
        setTimeout(() => router.push('/admin/products'), 1500);
      } else {
        setSaveError(json.error || 'Eroare la salvare. Încearcă din nou.');
      }
    } catch {
      setSaveError('Eroare de rețea. Verifică conexiunea și încearcă din nou.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Adaugă produs nou</h1>
        <button onClick={() => router.back()} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          ← Înapoi
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
          ✅ Produs salvat cu succes! Redirectare...
        </div>
      )}

      {saveError && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm">
          {saveError}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-5">

        <h2 className="font-semibold text-slate-900 dark:text-white text-lg border-b border-slate-200 dark:border-slate-700 pb-2">
          Informații generale
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nume produs *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} placeholder="Ex: MacBook Pro 14 inch M3" />
          </div>
          <div>
            <label className={labelClass}>Slug (auto-generat)</label>
            <input value={form.slug} readOnly className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-600 text-slate-500 dark:text-slate-300 text-sm cursor-not-allowed" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Descriere (RO)</label>
          <textarea value={form.descriptionRo} onChange={(e) => set("descriptionRo", e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Descriere produs în română" />
        </div>

        <div>
          <label className={labelClass}>Descriere (RU)</label>
          <textarea value={form.descriptionRu} onChange={(e) => set("descriptionRu", e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Descrierea produsului în rusă" />
          <p className="text-xs text-slate-400 mt-1">Dacă lași gol, se traduce automat din RO</p>
        </div>

        <h2 className="font-semibold text-slate-900 dark:text-white text-lg border-b border-slate-200 dark:border-slate-700 pb-2 pt-2">
          Preț
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Preț (MDL) *</label>
            <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} className={inputClass} placeholder="0" min="0" />
          </div>
          <div>
            <label className={labelClass}>Preț vechi (MDL)</label>
            <input type="number" value={form.oldPrice} onChange={(e) => set("oldPrice", e.target.value)} className={inputClass} placeholder="0" min="0" />
          </div>
          <div>
            <label className={labelClass}>Cod SKU</label>
            <input value={form.sku} onChange={(e) => set("sku", e.target.value)} className={inputClass} placeholder="SKU-001" />
          </div>
        </div>

        <h2 className="font-semibold text-slate-900 dark:text-white text-lg border-b border-slate-200 dark:border-slate-700 pb-2 pt-2">
          Categorie și Brand
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Categorie *</label>
            {loadingCategories ? (
              <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Se încarcă...
              </div>
            ) : (
              <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputClass}>
                <option value="">Selectează categorie</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nameRo} {c.nameRu ? `/ ${c.nameRu}` : ''}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className={labelClass}>Brand *</label>
            {loadingBrands ? (
              <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Se încarcă...
              </div>
            ) : (
              <select value={form.brandId} onChange={(e) => set("brandId", e.target.value)} className={inputClass}>
                <option value="">Selectează brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Stare produs</label>
            <select value={form.condition} onChange={(e) => set("condition", e.target.value)} className={inputClass}>
              <option value="NEW">Nou</option>
              <option value="REFURBISHED">Refurbished</option>
              <option value="USED">Folosit</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Imagini</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(() => { let arr: string[] = []; try { arr = JSON.parse(form.images); } catch { arr = []; } return arr.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-slate-300" />
                  <button type="button" onClick={() => { const a = JSON.parse(form.images); a.splice(i,1); set("images", JSON.stringify(a)); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">✕</button>
                </div>
              )); })()}
            </div>
            <div className="flex gap-2">
              <input value={form.images} onChange={(e) => set("images", e.target.value)} className={inputClass} placeholder='["https://..."]' />
              <label className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-1 whitespace-nowrap">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                Încarcă
              </label>
            </div>
          </div>
        </div>

        {/* Spec Fields */}
        <h2 className="font-semibold text-slate-900 dark:text-white text-lg border-b border-slate-200 dark:border-slate-700 pb-2 pt-2">
          Specificații Tehnice
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SPEC_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className={labelClass}>{label}</label>
              <input
                value={(form as any)[key] || ''}
                onChange={(e) => set(key as keyof FormState, e.target.value)}
                className={inputClass}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>

        {/* Legacy Specs */}
        <h2 className="font-semibold text-slate-900 dark:text-white text-lg border-b border-slate-200 dark:border-slate-700 pb-2 pt-2">
          Specificații suplimentare (legacy)
        </h2>

        <div className="space-y-2">
          {specs.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input value={s.key} onChange={(e) => updateSpec(i, "key", e.target.value)} placeholder="Nume (ex: Procesor)" className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              <input value={s.value} onChange={(e) => updateSpec(i, "value", e.target.value)} placeholder="Valoare (ex: Intel i7)" className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              <button onClick={() => removeSpec(i)} className="px-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm">✕</button>
            </div>
          ))}
          <button onClick={addSpec} className="text-sm text-amber-600 dark:text-amber-400 hover:underline">+ Adaugă specificație</button>
        </div>

        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Produs activ</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Recomandat (Featured)</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving || loadingCategories || loadingBrands} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition flex items-center gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "Se salvează..." : "Salvează produsul"}
        </button>
        <button onClick={() => router.back()} className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition">
          Anulează
        </button>
      </div>
    </div>
  );
}