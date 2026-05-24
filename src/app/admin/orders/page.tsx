"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  discount: number;
  shippingCost: number;
  paymentMethod: string;
  shippingAddress: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
  user: { name: string | null; email: string } | null;
}

const statusOptions = [
  { value: "PENDING", label: "În așteptare" },
  { value: "CONFIRMED", label: "Confirmată" },
  { value: "PROCESSING", label: "Procesare" },
  { value: "SHIPPED", label: "În livrare" },
  { value: "DELIVERED", label: "Livrată" },
  { value: "CANCELLED", label: "Anulată" },
  { value: "RETURNED", label: "Returnată" },
  { value: "REFUNDED", label: "Rambursată" },
];

const statusMap: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "În așteptare", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  CONFIRMED: { label: "Confirmată", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  PROCESSING: { label: "Procesare", cls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  SHIPPED: { label: "În livrare", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  DELIVERED: { label: "Livrată", cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  CANCELLED: { label: "Anulată", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  RETURNED: { label: "Returnată", cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  REFUNDED: { label: "Rambursată", cls: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20", ...(filter && { status: filter }) });
      const res = await fetch(`/api/orders?${params}`);
      const json = await res.json();
      if (json.data) {
        setOrders(json.data || []);
        setTotal(json.total || 0);
        setTotalPages(json.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const counts: Record<string, number> = { all: total };
  statusOptions.forEach((s) => {
    const filteredOrders = filter ? orders.filter((o) => o.status === filter) : orders;
    counts[s.value] = orders.filter((o) => o.status === s.value).length;
  });

  const displayed = filter ? orders.filter((o) => o.status === filter) : orders;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Comenzi</h1>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setFilter(""); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!filter ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"}`}
          >
            Toate ({total})
          </button>
          {statusOptions.map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f.value ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"}`}
            >
              {f.label} ({counts[f.value] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 font-medium">Comandă</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Dată</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">Se încarcă...</td></tr>
              ) : displayed.map((o, i) => {
                const s = statusMap[o.status] || { label: o.status, cls: "bg-slate-100 text-slate-600" };
                return (
                  <tr key={o.id} className={`border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer ${i % 2 === 0 ? "" : "bg-slate-50/50 dark:bg-slate-800/50"}`}>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{o.user?.name || o.email || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{new Date(o.createdAt).toLocaleDateString("ro-RO")}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{Math.round(o.total).toLocaleString()} MDL</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span></td>
                    <td className="px-4 py-3">
                      <button onClick={() => router.push(`/admin/orders/${o.id}`)} className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium">Vezi detalii</button>
                    </td>
                  </tr>
                );
              })}
              {!loading && displayed.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Nicio comandă găsită</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Pagina {page} din {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-xs disabled:opacity-50 text-slate-700 dark:text-slate-200">← Anterior</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-xs disabled:opacity-50 text-slate-700 dark:text-slate-200">Următor →</button>
            </div>
          </div>
        )}

        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
          {displayed.length} comandă(e) afișate din {total} total
        </div>
      </div>
    </div>
  );
}