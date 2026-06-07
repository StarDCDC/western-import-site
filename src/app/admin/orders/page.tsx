"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";

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

// ─── Confirm Modal ────────────────────────────────────────────────
interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  details?: string;
  icon?: "trash" | "warning";
}

function ConfirmModal({ open, onClose, onConfirm, loading, title, message, confirmLabel = "Șterge", details, icon = "trash" }: ConfirmModalProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white dark:bg-[var(--color-dark-elevated)] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[0.06] w-full max-w-md overflow-hidden"
          >
            {/* Header gradient */}
            <div className={`px-6 pt-6 pb-4 ${icon === "warning" ? "bg-gradient-to-br from-red-500 to-orange-600" : "bg-gradient-to-br from-red-500 to-red-700"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    {icon === "warning" ? (
                      <AlertTriangle className="w-6 h-6 text-white" />
                    ) : (
                      <Trash2 className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <p className="text-sm text-white/80">Acțiune ireversibilă</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">{message}</p>
              {details && (
                <div className="mt-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl">
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">{details}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Anulează
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Se șterge...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    {confirmLabel}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal state
  const [deleting, setDeleting] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<{ type: "single" | "all"; orderId?: string; orderNumber?: string }>({ type: "all" });

  const openDeleteSingle = (orderId: string, orderNumber: string) => {
    setModalTarget({ type: "single", orderId, orderNumber });
    setModalOpen(true);
  };

  const openDeleteAll = () => {
    setModalTarget({ type: "all" });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (deleting) return; // don't close while deleting
    setModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (modalTarget.type === "single" && modalTarget.orderId) {
      setDeleting(modalTarget.orderId);
      try {
        const res = await fetch(`/api/orders/${modalTarget.orderId}`, { method: "DELETE" });
        const json = await res.json();
        if (json.success) {
          fetchOrders();
        } else {
          alert(json.error || "Eroare la ștergere");
        }
      } catch {
        alert("Eroare de conexiune");
      } finally {
        setDeleting(null);
        setModalOpen(false);
      }
    } else {
      setDeleting("all");
      try {
        const res = await fetch("/api/admin/orders/delete-all", { method: "POST" });
        const json = await res.json();
        if (json.success) {
          fetchOrders();
        } else {
          alert(json.error || "Eroare");
        }
      } catch {
        alert("Eroare de conexiune");
      } finally {
        setDeleting(null);
        setModalOpen(false);
      }
    }
  };

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
    counts[s.value] = orders.filter((o) => o.status === s.value).length;
  });

  const displayed = filter ? orders.filter((o) => o.status === filter) : orders;

  // Modal props based on target
  const modalTitle = modalTarget.type === "all" ? "Șterge toate comenzile" : `Șterge comanda ${modalTarget.orderNumber}`;
  const modalMessage = modalTarget.type === "all"
    ? "Sigur vrei să ștergi toate comenzile din sistem? Această acțiune nu poate fi anulată și vei pierde tot istoricul de comenzi."
    : `Sigur vrei să ștergi comanda ${modalTarget.orderNumber}? Produsele din comandă nu vor fi afectate.`;
  const modalDetails = modalTarget.type === "all"
    ? `⚠️ Se vor șterge permanent ${total} comenz${total === 1 ? "e" : "i"} și toate item-urile asociate.`
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Comenzi</h1>
        {total > 0 && (
          <button
            onClick={openDeleteAll}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Șterge toate ({total})
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-xl shadow-sm border border-slate-200 dark:border-white/[0.06] p-4">
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
      <div className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-xl shadow-sm border border-slate-200 dark:border-white/[0.06] overflow-hidden">
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
                  <tr key={o.id} className={`border-b border-slate-100 dark:border-white/[0.06]/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer ${i % 2 === 0 ? "" : "bg-slate-50/50 dark:bg-[var(--color-dark-elevated)]/50"}`}>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{o.user?.name || o.email || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{new Date(o.createdAt).toLocaleDateString("ro-RO")}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{Math.round(o.total).toLocaleString()} MDL</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => router.push(`/admin/orders/${o.id}`)} className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium">Detalii</button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openDeleteSingle(o.id, o.orderNumber); }}
                          disabled={deleting === o.id}
                          className="text-red-500 hover:text-red-700 hover:underline text-xs font-medium disabled:opacity-50 flex items-center gap-1"
                        >
                          {deleting === o.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          {deleting === o.id ? "Se șterge..." : "Șterge"}
                        </button>
                      </div>
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
          <div className="px-4 py-3 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Pagina {page} din {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1 border border-slate-300 dark:border-white/[0.08] rounded text-xs disabled:opacity-50 text-slate-700 dark:text-slate-200">← Anterior</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="px-3 py-1 border border-slate-300 dark:border-white/[0.08] rounded text-xs disabled:opacity-50 text-slate-700 dark:text-slate-200">Următor →</button>
            </div>
          </div>
        )}

        <div className="px-4 py-3 border-t border-slate-200 dark:border-white/[0.06] text-sm text-slate-500 dark:text-slate-400">
          {displayed.length} comandă(e) afișate din {total} total
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        open={modalOpen}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        loading={!!deleting}
        title={modalTitle}
        message={modalMessage}
        details={modalDetails}
        confirmLabel={modalTarget.type === "all" ? "Șterge tot" : "Șterge comanda"}
        icon={modalTarget.type === "all" ? "warning" : "trash"}
      />
    </div>
  );
}
