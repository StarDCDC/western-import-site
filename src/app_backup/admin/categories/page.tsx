"use client";

import { useState, useEffect } from "react";

interface Category {
  id: string;
  nameRO: string;
  nameRU: string;
  slug: string;
  image: string;
  active: boolean;
  parentId: string | null;
}

const defaultCategories: Category[] = [
  { id: "1", nameRO: "Parchet", nameRU: "Паркет", slug: "parchet", image: "🪵", active: true, parentId: null },
  { id: "2", nameRO: "Laminat", nameRU: "Ламинат", slug: "laminat", image: "🟫", active: true, parentId: null },
  { id: "3", nameRO: "Uși", nameRU: "Двери", slug: "usi", image: "🚪", active: true, parentId: null },
  { id: "4", nameRO: "Decor", nameRU: "Декор", slug: "decor", image: "🎨", active: true, parentId: null },
  { id: "5", nameRO: "Tapet", nameRU: "Обои", slug: "tapet", image: "🖼️", active: true, parentId: null },
  { id: "6", nameRO: "Vopsea", nameRU: "Краска", slug: "vopsea", image: "🪣", active: true, parentId: null },
  { id: "7", nameRO: "Mochetă", nameRU: "Ковёр", slug: "mocheta", image: "🧶", active: true, parentId: null },
  { id: "8", nameRO: "Parchet Masiv", nameRU: "Массивная доска", slug: "parchet-masiv", image: "🪵", active: true, parentId: "1" },
  { id: "9", nameRO: "Parchet Ingineresc", nameRU: "Инженерная доска", slug: "parchet-ingineresc", image: "🪵", active: true, parentId: "1" },
  { id: "10", nameRO: "Uși Interioare", nameRU: "Межкомнатные двери", slug: "usi-interioare", image: "🚪", active: true, parentId: "3" },
  { id: "11", nameRO: "Uși Exterioare", nameRU: "Входные двери", slug: "usi-exterioare", image: "🚪", active: true, parentId: "3" },
  { id: "12", nameRO: "Baseboard", nameRU: "Плинтус", slug: "baseboard", image: "📏", active: true, parentId: "4" },
];

function loadCategories(): Category[] {
  if (typeof window === "undefined") return defaultCategories;
  const s = localStorage.getItem("wi_admin_categories");
  if (s) { try { return JSON.parse(s); } catch {} }
  localStorage.setItem("wi_admin_categories", JSON.stringify(defaultCategories));
  return defaultCategories;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addingChild, setAddingChild] = useState<string | null>(null);
  const [form, setForm] = useState({ nameRO: "", nameRU: "", slug: "", image: "", active: true });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setCategories(loadCategories()); setMounted(true); }, []);

  const save = (cats: Category[]) => { setCategories(cats); localStorage.setItem("wi_admin_categories", JSON.stringify(cats)); };
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

  const resetForm = () => setForm({ nameRO: "", nameRU: "", slug: "", image: "", active: true });

  const handleAdd = (parentId: string | null) => {
    if (!form.nameRO) return;
    const newCat: Category = {
      id: String(Date.now()), nameRO: form.nameRO, nameRU: form.nameRU,
      slug: form.slug || autoSlug(form.nameRO), image: form.image || "📁", active: form.active, parentId,
    };
    save([...categories, newCat]);
    resetForm(); setAdding(false); setAddingChild(null);
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat.id);
    setForm({ nameRO: cat.nameRO, nameRU: cat.nameRU, slug: cat.slug, image: cat.image, active: cat.active });
  };

  const handleSaveEdit = (id: string) => {
    const cats = categories.map((c) => c.id === id ? { ...c, ...form } : c);
    save(cats); setEditing(null); resetForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Sigur vrei să ștergi această categorie?")) return;
    save(categories.filter((c) => c.id !== id && c.parentId !== id));
  };

  if (!mounted) return null;

  const roots = categories.filter((c) => !c.parentId);
  const getChildren = (pid: string) => categories.filter((c) => c.parentId === pid);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Categorii</h1>
        <button onClick={() => { setAdding(true); setAddingChild(null); resetForm(); }} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition">+ Adaugă categorie</button>
      </div>

      {/* Add root category */}
      {adding && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-amber-300 dark:border-amber-600 p-4">
          <h3 className="font-medium text-slate-900 dark:text-white mb-3">Categorie nouă</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <input value={form.nameRO} onChange={(e) => { set("nameRO", e.target.value); set("slug", autoSlug(e.target.value)); }} placeholder="Nume RO *" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
            <input value={form.nameRU} onChange={(e) => set("nameRU", e.target.value)} placeholder="Nume RU" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
            <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="Slug (auto)" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
            <input value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="Emoji / Icon" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="rounded" /><span className="text-sm text-slate-700 dark:text-slate-300">Activă</span></label>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => handleAdd(null)} className="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-sm">Salvează</button>
            <button onClick={() => { setAdding(false); resetForm(); }} className="px-4 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm">Anulează</button>
          </div>
        </div>
      )}

      {/* Tree */}
      <div className="space-y-2">
        {roots.map((cat) => {
          const children = getChildren(cat.id);
          const isEditing = editing === cat.id;
          return (
            <div key={cat.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                {isEditing ? (
                  <div className="flex flex-wrap items-center gap-2 flex-1">
                    <input value={form.nameRO} onChange={(e) => { set("nameRO", e.target.value); set("slug", autoSlug(e.target.value)); }} className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm w-32 focus:ring-2 focus:ring-amber-500 outline-none" />
                    <input value={form.nameRU} onChange={(e) => set("nameRU", e.target.value)} className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm w-32 focus:ring-2 focus:ring-amber-500 outline-none" placeholder="RU" />
                    <input value={form.slug} onChange={(e) => set("slug", e.target.value)} className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm w-28 focus:ring-2 focus:ring-amber-500 outline-none" />
                    <button onClick={() => handleSaveEdit(cat.id)} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs">✓</button>
                    <button onClick={() => { setEditing(null); resetForm(); }} className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs">✕</button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.image}</span>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{cat.nameRO} <span className="text-slate-400 text-sm">/ {cat.nameRU}</span></p>
                        <p className="text-xs text-slate-400">/{cat.slug}</p>
                      </div>
                      {cat.active ? <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">Activă</span> : <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full text-xs">Inactivă</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setAddingChild(cat.id); resetForm(); }} className="text-xs text-amber-600 dark:text-amber-400 hover:underline">+ Subcategorie</button>
                      <button onClick={() => handleEdit(cat)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(cat.id)} className="text-xs text-red-600 dark:text-red-400 hover:underline">Șterge</button>
                    </div>
                  </>
                )}
              </div>

              {/* Add child */}
              {addingChild === cat.id && (
                <div className="px-4 pb-4 ml-8">
                  <div className="flex flex-wrap gap-2">
                    <input value={form.nameRO} onChange={(e) => { set("nameRO", e.target.value); set("slug", autoSlug(e.target.value)); }} placeholder="Nume RO *" className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
                    <input value={form.nameRU} onChange={(e) => set("nameRU", e.target.value)} placeholder="Nume RU" className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
                    <button onClick={() => handleAdd(cat.id)} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs">Salvează</button>
                    <button onClick={() => setAddingChild(null)} className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs">Anulează</button>
                  </div>
                </div>
              )}

              {/* Children */}
              {children.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-700/50 ml-8">
                  {children.map((child) => {
                    const isChildEditing = editing === child.id;
                    return (
                      <div key={child.id} className="px-4 py-3 flex items-center justify-between border-b border-slate-50 dark:border-slate-700/30 last:border-0">
                        {isChildEditing ? (
                          <div className="flex flex-wrap items-center gap-2 flex-1">
                            <input value={form.nameRO} onChange={(e) => { set("nameRO", e.target.value); set("slug", autoSlug(e.target.value)); }} className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm w-32 focus:ring-2 focus:ring-amber-500 outline-none" />
                            <input value={form.nameRU} onChange={(e) => set("nameRU", e.target.value)} className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm w-32 focus:ring-2 focus:ring-amber-500 outline-none" placeholder="RU" />
                            <button onClick={() => handleSaveEdit(child.id)} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs">✓</button>
                            <button onClick={() => { setEditing(null); resetForm(); }} className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-600 rounded-lg text-xs">✕</button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{child.image}</span>
                              <span className="text-sm text-slate-700 dark:text-slate-200">{child.nameRO} <span className="text-slate-400">/ {child.nameRU}</span></span>
                              <span className="text-xs text-slate-400">/{child.slug}</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleEdit(child)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Edit</button>
                              <button onClick={() => handleDelete(child.id)} className="text-xs text-red-600 dark:text-red-400 hover:underline">Șterge</button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
