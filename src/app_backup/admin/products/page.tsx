"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  oldPrice?: number;
  stock: number;
  sku: string;
  brand: string;
  active: boolean;
  featured: boolean;
  image: string;
}

const defaultProducts: Product[] = [
  { id: "1", name: "Parchet Stejar Natural", slug: "parchet-stejar-natural", category: "Parchet", price: 890, oldPrice: 1050, stock: 45, sku: "PSN-001", brand: "Kronotex", active: true, featured: true, image: "🪵" },
  { id: "2", name: "Laminat 8mm Classic Oak", slug: "laminat-8mm-classic", category: "Laminat", price: 245, oldPrice: 290, stock: 120, sku: "LCO-002", brand: "Quick-Step", active: true, featured: false, image: "🟫" },
  { id: "3", name: "Ușă Interioară Aria Albă", slug: "usa-interioara-aria", category: "Uși", price: 1850, stock: 12, sku: "UIA-003", brand: "Porta Prima", active: true, featured: true, image: "🚪" },
  { id: "4", name: "Baseboard MDF 80mm Alb", slug: "baseboard-mdf-alb", category: "Decor", price: 45, stock: 200, sku: "BMA-004", brand: "Wildör", active: true, featured: false, image: "📏" },
  { id: "5", name: "Tapet Floral Manchester", slug: "tapet-floral-manchester", category: "Tapet", price: 135, stock: 67, sku: "TFM-005", brand: "AS Creation", active: true, featured: false, image: "🎨" },
  { id: "6", name: "Parchet Bamboo Natural", slug: "parchet-bamboo-natural", category: "Parchet", price: 1120, stock: 0, sku: "PBN-006", brand: "MOSO", active: true, featured: true, image: "🎋" },
  { id: "7", name: "Laminat 12mm Walnut", slug: "laminat-12mm-walnut", category: "Laminat", price: 380, oldPrice: 420, stock: 55, sku: "LWW-007", brand: "Kronotex", active: true, featured: false, image: "🟤" },
  { id: "8", name: "Ușă Glisantă Lumea", slug: "usa-glisanta-lumea", category: "Uși", price: 3200, stock: 4, sku: "UGL-008", brand: "Porta Prima", active: true, featured: true, image: "🚪" },
  { id: "9", name: "Vopsea Interior SuperWhite", slug: "vopsea-interior-superwhite", category: "Vopsea", price: 185, stock: 0, sku: "VIS-009", brand: "Caparol", active: false, featured: false, image: "🪣" },
  { id: "10", name: "Mochetă Royal Blue", slug: "mocheta-royal-blue", category: "Mochetă", price: 310, stock: 38, sku: "MRB-010", brand: "Desso", active: true, featured: false, image: "🔵" },
  { id: "11", name: "Folie Decorativă Lemn", slug: "folie-decorativa-lemn", category: "Decor", price: 78, stock: 0, sku: "FDL-011", brand: "d-c-fix", active: true, featured: false, image: "📜" },
  { id: "12", name: "Plintă LED Aluminiu", slug: "plinta-led-aluminiu", category: "Decor", price: 220, oldPrice: 260, stock: 25, sku: "PLA-012", brand: "Wildör", active: true, featured: true, image: "💡" },
];

const categories = ["Toate", "Parchet", "Laminat", "Uși", "Decor", "Tapet", "Vopsea", "Mochetă"];

function loadProducts(): Product[] {
  if (typeof window === "undefined") return defaultProducts;
  const saved = localStorage.getItem("wi_admin_products");
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  localStorage.setItem("wi_admin_products", JSON.stringify(defaultProducts));
  return defaultProducts;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Toate");
  const [sort, setSort] = useState("name");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setProducts(loadProducts()); setMounted(true); }, []);

  const save = (p: Product[]) => { setProducts(p); localStorage.setItem("wi_admin_products", JSON.stringify(p)); };

  const filtered = products
    .filter((p) => {
      if (catFilter !== "Toate" && p.category !== catFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "price") return a.price - b.price;
      if (sort === "stock") return a.stock - b.stock;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const deleteProduct = (id: string) => {
    if (confirm("Sigur vrei să ștergi acest produs?")) {
      save(products.filter((p) => p.id !== id));
    }
  };

  const exportCSV = () => {
    const header = "Nume,SKU,Categorie,Pret,Stoc,Activ\n";
    const rows = filtered.map((p) => `"${p.name}",${p.sku},${p.category},${p.price},${p.stock},${p.active ? "Da" : "Nu"}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "produse.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/products/import", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        alert(`Importate: ${json.data.imported}, Sărite: ${json.data.skipped} din ${json.data.total}`);
      } else {
        alert(json.error || "Eroare la import");
      }
    } catch {
      alert("Eroare la import");
    }
    e.target.value = "";
  };

  const handleExportExcel = () => {
    window.open("/api/admin/products/export", "_blank");
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Produse</h1>
        <div className="flex gap-2 flex-wrap">
          <label className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer">
            📥 Import Excel
            <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} className="hidden" />
          </label>
          <button onClick={handleExportExcel} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition">📤 Export Excel</button>
          <button onClick={exportCSV} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition">📥 Export CSV</button>
          <button onClick={() => router.push("/admin/products/new")} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition">+ Adaugă produs</button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Caută produs sau SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm" />
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none">
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none">
            <option value="name">Sortează: Nume</option>
            <option value="price">Sortează: Preț</option>
            <option value="stock">Sortează: Stoc</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 font-medium"></th>
                <th className="px-4 py-3 font-medium">Produs</th>
                <th className="px-4 py-3 font-medium">Categorie</th>
                <th className="px-4 py-3 font-medium">Preț</th>
                <th className="px-4 py-3 font-medium">Stoc</th>
                <th className="px-4 py-3 font-medium">Stare</th>
                <th className="px-4 py-3 font-medium">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} className={`border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 ${i % 2 === 0 ? "" : "bg-slate-50/50 dark:bg-slate-800/50"}`}>
                  <td className="px-4 py-3 text-2xl">{p.image}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.sku}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.category}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 dark:text-white">{p.price} MDL</p>
                    {p.oldPrice && <p className="text-xs text-slate-400 line-through">{p.oldPrice} MDL</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${p.stock === 0 ? "text-red-500" : p.stock < 10 ? "text-yellow-500" : "text-slate-900 dark:text-white"}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {p.active && <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">Activ</span>}
                      {p.featured && <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs">Recomandat</span>}
                      {!p.active && <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full text-xs">Inactiv</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => router.push(`/admin/products/${p.id}/edit`)} className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium">Edit</button>
                      <button onClick={() => deleteProduct(p.id)} className="text-red-600 dark:text-red-400 hover:underline text-xs font-medium">Șterge</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Niciun produs găsit</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
          {filtered.length} produs(e) afișate din {products.length} total
        </div>
      </div>
    </div>
  );
}
