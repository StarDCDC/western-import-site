"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Category { id: string; nameRo: string; nameRu: string; slug: string; }
interface Brand { id: string; name: string; slug: string; }
interface Spec { key: string; value: string; }

// Spec fields for tech products (maps to ProductSpec relation)
const SPEC_FIELDS: { key: string; label: string; placeholder: string }[] = [
  { key: 'display', label: 'Display (ecran)', placeholder: 'ex: 15.6 inch' },
  { key: 'storage', label: 'Spațiu de stocare', placeholder: 'ex: 512GB SSD' },
  { key: 'weight', label: 'Greutate', placeholder: 'ex: 1.8 kg' },
  { key: 'refreshRate', label: 'Frecvență ecran', placeholder: 'ex: 144Hz' },
  { key: 'ram', label: 'Memorie RAM', placeholder: 'ex: 16GB DDR4' },
  { key: 'gpuModel', label: 'Model Placă Video', placeholder: 'ex: RTX 4060' },
  { key: 'cpuModel', label: 'Model Procesor', placeholder: 'ex: Intel i7-13700H' },
  { key: 'resolution', label: 'Rezoluție', placeholder: 'ex: 1920x1080' },
  { key: 'gpuSeries', label: 'Serie Placă Video', placeholder: 'ex: NVIDIA GeForce' },
  { key: 'cpuSeries', label: 'Serie Procesor', placeholder: 'ex: Intel Core' },
  { key: 'os', label: 'Sistem de Operare', placeholder: 'ex: Windows 11' },
  { key: 'storageType', label: 'Tip Stocare', placeholder: 'ex: SSD' },
  { key: 'gpuType', label: 'Tip Placă Video', placeholder: 'ex: Dedicată' },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [specs, setSpecs] = useState<Spec[]>([{ key: "", value: "" }]);

  // Form state
  const [form, setForm] = useState({
    name: "",
    slug: "",
    descriptionRO: "",
    descriptionRu: "",
    price: "",
    oldPrice: "",
    sku: "",
    condition: "NEW",
    categoryId: "",
    brandId: "",
    isActive: true,
    isFeatured: false,
  });

  // Spec form fields (ProductSpec relation)
  const [specFields, setSpecFields] = useState<Record<string, string>>({});

  // Load product from DB via API
  useEffect(() => {
    async function loadProduct() {
      try {
        // Load categories and brands in parallel
        const [catRes, brandRes] = await Promise.all([
          fetch('/api/categories?flat=true'),
          fetch('/api/admin/brands'),
        ]);

        const catJson = await catRes.json();
        if (catJson.success && Array.isArray(catJson.data)) {
          setCategories(catJson.data);
        }
        setLoadingCategories(false);

        const brandJson = await brandRes.json();
        if (brandJson.success && Array.isArray(brandJson.data)) {
          setBrands(brandJson.data);
        }
        setLoadingBrands(false);

        // Load product data from DB
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setLoadingError('Produsul nu a fost găsit');
          } else {
            setLoadingError('Eroare la încărcarea produsului');
          }
          setLoading(false);
          return;
        }

        const json = await res.json();
        if (!json.success) {
          setLoadingError('Eroare la încărcarea produsului');
          setLoading(false);
          return;
        }

        const p = json.data;

        // Parse images
        let parsedImages: string[] = [];
        if (p.images) {
          try {
            if (typeof p.images === 'string') {
              const parsed = JSON.parse(p.images);
              // Handle case where DB stores images as JSON-stringified empty array "[]" or "\"[]\""
              if (parsed === '[]' || parsed === '"[]"') {
                parsedImages = [];
              } else if (Array.isArray(parsed)) {
                parsedImages = parsed;
              }
            } else if (Array.isArray(p.images)) {
              parsedImages = p.images;
            }
          } catch { parsedImages = []; }
        }
        setImages(parsedImages);

        // Parse legacy specs (JSON string in `specs` column)
        let parsedSpecs: Spec[] = [{ key: "", value: "" }];
        if (p.specs) {
          try {
            const sp = typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs;
            if (typeof sp === 'object' && sp !== null) {
              parsedSpecs = Object.entries(sp as Record<string, string>).map(([key, value]) => ({ key, value }));
              if (parsedSpecs.length === 0) parsedSpecs = [{ key: "", value: "" }];
            }
          } catch {
            parsedSpecs = [{ key: "", value: "" }];
          }
        }
        setSpecs(parsedSpecs);

        // Load ProductSpec relation fields
        const specRel = p.spec as Record<string, string | null> | null;
        const loadedSpecFields: Record<string, string> = {};
        if (specRel) {
          for (const f of SPEC_FIELDS) {
            if (specRel[f.key] && specRel[f.key] !== null) {
              loadedSpecFields[f.key] = specRel[f.key] as string;
            }
          }
        }
        setSpecFields(loadedSpecFields);

        // Populate form
        setForm({
          name: p.name || "",
          slug: p.slug || "",
          descriptionRO: p.descriptionRo || "",
          descriptionRu: p.descriptionRu || "",
          price: String(p.price || ""),
          oldPrice: p.oldPrice ? String(p.oldPrice) : "",
          sku: p.sku || "",
          condition: p.condition || "NEW",
          categoryId: p.categoryId || "",
          brandId: p.brandId || "",
          isActive: p.isActive !== false,
          isFeatured: !!p.isFeatured,
        });

      } catch {
        setLoadingError('Eroare de rețea la încărcarea produsului');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const setSpecField = (key: string, val: string) =>
    setSpecFields(prev => ({ ...prev, [key]: val }));

  // Auto-generate slug from name
  useEffect(() => {
    if (!loading && form.name) {
      const slug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setForm(f => ({ ...f, slug }));
    }
  }, [form.name, loading]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (json.success) {
        setImages(prev => [...prev, json.data.url]);
      } else {
        alert(json.error || 'Upload eșuat');
      }
    } catch {
      alert('Upload eșuat');
    }
  };

  const removeImage = (index: number) =>
    setImages(prev => prev.filter((_, i) => i !== index));

  const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
  const removeSpec = (i: number) => setSpecs(specs.filter((_, idx) => idx !== i));
  const updateSpec = (i: number, field: "key" | "value", val: string) => {
    const s = [...specs];
    s[i][field] = val;
    setSpecs(s);
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
      // Build legacy specs object from key-value pairs
      const legacySpecsObj: Record<string, string> = {};
      specs.forEach(s => {
        if (s.key && s.value) legacySpecsObj[s.key] = s.value;
      });

      const payload: Record<string, unknown> = {
        name: form.name,
        slug: form.slug,
        descriptionRo: form.descriptionRO,
        descriptionRu: form.descriptionRu,
        price: parseFloat(form.price),
        oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : undefined,
        stock: 0,
        sku: form.sku || undefined,
        condition: form.condition,
        categoryId: form.categoryId,
        brandId: form.brandId,
        images: JSON.stringify(images),
        specs: JSON.stringify(legacySpecsObj),
        isActive: form.isActive,
        isFeatured: form.isFeatured,
      };

      // Add spec fields from the dedicated ProductSpec fields
      for (const f of SPEC_FIELDS) {
        if (specFields[f.key] && specFields[f.key].trim()) {
          payload[f.key] = specFields[f.key].trim();
        }
      }

      // Use PUT /api/admin/products?id=id
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'PUT',
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-slate-500 dark:text-slate-400 text-sm">Se încarcă produsul...</p>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-500 text-lg font-medium">{loadingError}</p>
        <button onClick={() => router.push('/admin/products')} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm">
          ← Înapoi la produse
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Editare produs</h1>
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
          <textarea value={form.descriptionRO} onChange={(e) => set("descriptionRO", e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Descriere produs în română" />
        </div>

        <div>
          <label className={labelClass}>Descriere (RU)</label>
          <textarea value={form.descriptionRu} onChange={(e) => set("descriptionRu", e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Descriere produs în rusă" />
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
              {images.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt="" className="w-24 h-24 object-cover rounded-xl border border-slate-300 cursor-pointer hover:ring-2 hover:ring-amber-400 transition" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">✕</button>
                </div>
              ))}
            </div>
            <label className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-3 text-center cursor-pointer block hover:border-amber-400 transition text-sm text-slate-500 dark:text-slate-400">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              Click pentru a încărca imagini
            </label>
          </div>
        </div>

        {/* Spec Fields (ProductSpec relation) */}
        <h2 className="font-semibold text-slate-900 dark:text-white text-lg border-b border-slate-200 dark:border-slate-700 pb-2 pt-2">
          Specificații Tehnice
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SPEC_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className={labelClass}>{label}</label>
              <input
                value={specFields[key] || ''}
                onChange={(e) => setSpecField(key, e.target.value)}
                className={inputClass}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>

        {/* Legacy Specs */}
        <h2 className="font-semibold text-slate-900 dark:text-white text-lg border-b border-slate-200 dark:border-slate-700 pb-2 pt-2">
          Specificații suplimentare
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
          {saving ? "Se salvează..." : "Salvează modificările"}
        </button>
        <button onClick={() => router.back()} className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition">
          Anulează
        </button>
      </div>
    </div>
  );
}