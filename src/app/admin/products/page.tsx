"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  sku: string | null;
  condition: string;
  images: string;
  isActive: boolean;
  isFeatured: boolean;
  category: { nameRo: string };
  brand: { name: string };
  createdAt: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search && { search }),
        ...(catFilter && { category: catFilter }),
      });
      const res = await fetch(`/api/admin/products?${params}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data || []);
        setTotal(json.pagination?.total || 0);
        setTotalPages(json.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, catFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const deleteProduct = async (id: string) => {
    if (!confirm("Sigur vrei să ștergi acest produs?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProducts();
      } else {
        const json = await res.json();
        alert(json.error || "Eroare la ștergere");
      }
    } catch {
      alert("Eroare la ștergere");
    } finally {
      setDeletingId(null);
    }
  };

  const exportCSV = () => {
    const header = "Nume,SKU,Categorie,Preț,Preț vechi,Stoc,Activ\n";
    const rows = filtered.map((p) =>
      `"${p.name}",${p.sku || ""},${p.category?.nameRo || ""},${p.price},${p.oldPrice || ""},${p.stock},${p.isActive ? "Da" : "Nu"}`
    ).join("\n");
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
      const res = await fetch("/api/admin/products/import", { method: "POST", body: formData, credentials: "include" });
      const json = await res.json();
      if (json.success) {
        alert(`Importate: ${json.data?.imported || 0}, Sărite: ${json.data?.skipped || 0}`);
        fetchProducts();
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

  const filtered = products;

  const getImage = (images: string) => {
    try {
      const arr = JSON.parse(images);
      return arr[0] || null;
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Produse</h1>
        <div className="flex gap-2 flex-wrap">
          <label className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer">
            📥 Import Excel / CSV
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportExcel} className="hidden" />
          </label>
          <button onClick={handleExportExcel} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition">📤 Export Excel</button>
          <button onClick={exportCSV} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition">📥 Export CSV</button>
          <button onClick={() => router.push("/admin/products/new")} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition">+ Adaugă produs</button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Caută produs sau SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
          />
          <select
            value={catFilter}
            onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none"
          >
            <option value="">Toate categoriile</option>
            <option value="laptopuri">Laptopuri</option>
            <option value="telefoane">Telefoane</option>
            <option value="pc-monitoare">PC & Monitoare</option>
            <option value="tablete">Tablete</option>
            <option value="componente">Componente</option>
            <option value="accesorii">Accesorii</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none"
          >
            <option value="createdAt">Sort: Cel mai nou</option>
            <option value="name">Sort: Nume</option>
            <option value="price">Sort: Preț</option>
            <option value="stock">Sort: Stoc</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 font-medium">Imagine</th>
                <th className="px-4 py-3 font-medium">Produs</th>
                <th className="px-4 py-3 font-medium">Categorie</th>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Preț</th>
                <th className="px-4 py-3 font-medium">Stoc</th>
                <th className="px-4 py-3 font-medium">Stare</th>
                <th className="px-4 py-3 font-medium">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400">Se încarcă...</td></tr>
              ) : filtered.map((p, i) => {
                const img = getImage(p.images);
                return (
                  <tr key={p.id} className={`border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 ${i % 2 === 0 ? "" : "bg-slate-50/50 dark:bg-slate-800/50"}`}>
                    <td className="px-4 py-3">
                      {img ? (
                        <img src={img} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-slate-100" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg">📦</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.sku || "—"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.category?.nameRo || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.brand?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">{p.price.toLocaleString()} MDL</p>
                      {p.oldPrice && <p className="text-xs text-slate-400 line-through">{p.oldPrice.toLocaleString()} MDL</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${p.stock === 0 ? "text-red-500" : p.stock < 5 ? "text-yellow-500" : "text-slate-900 dark:text-white"}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {p.isActive && <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">Activ</span>}
                        {p.isFeatured && <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs">Recomandat</span>}
                        {!p.isActive && <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full text-xs">Inactiv</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => router.push(`/admin/products/${p.id}/edit`)} className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium">Edit</button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          disabled={deletingId === p.id}
                          className="text-red-600 dark:text-red-400 hover:underline text-xs font-medium disabled:opacity-50"
                        >
                          {deletingId === p.id ? "..." : "Șterge"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Niciun produs găsit</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Pagina {page} din {totalPages} ({total} produse)
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-xs disabled:opacity-50 text-slate-700 dark:text-slate-200">← Anterior</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-xs disabled:opacity-50 text-slate-700 dark:text-slate-200">Următor →</button>
            </div>
          </div>
        )}

        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
          {total} produs(e) în total
        </div>
      </div>
    </div>
  );
}