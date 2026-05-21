"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface Order {
  id: string; orderId: string; client: string; email: string; phone: string; address: string;
  date: string; items: { name: string; qty: number; price: number }[];
  subtotal: number; shipping: number; total: number; status: string; notes: string;
}

const statusSteps = ["in_asteptare", "confirmata", "in_livrare", "livrata"];
const statusLabels: Record<string, string> = { in_asteptare: "În așteptare", confirmata: "Confirmată", in_livrare: "În livrare", livrata: "Livrată", anulata: "Anulată" };

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const orders: Order[] = JSON.parse(localStorage.getItem("wi_admin_orders") || "[]");
    const o = orders.find((x) => x.id === id);
    if (o) { setOrder(o); setStatus(o.status); setNotes(o.notes); }
    setMounted(true);
  }, [id]);

  const handleSave = () => {
    const orders: Order[] = JSON.parse(localStorage.getItem("wi_admin_orders") || "[]");
    const idx = orders.findIndex((x) => x.id === id);
    if (idx >= 0) {
      orders[idx] = { ...orders[idx], status, notes };
      localStorage.setItem("wi_admin_orders", JSON.stringify(orders));
      setOrder({ ...orders[idx] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (!mounted) return null;
  if (!order) return <div className="text-center py-20 text-slate-400">Comandă negăsită</div>;

  const isCancelled = order.status === "anulata";
  const currentStepIdx = statusSteps.indexOf(status);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.back()} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-1">← Înapoi la comenzi</button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Comanda {order.orderId}</h1>
        </div>
        {saved && <span className="text-green-600 dark:text-green-400 text-sm font-medium">✓ Salvat!</span>}
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Status comandă</h2>
        {isCancelled ? (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <span className="text-2xl">❌</span>
            <span className="text-red-600 dark:text-red-400 font-medium">Comandă anulată</span>
          </div>
        ) : (
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-600 rounded" />
            <div className="absolute top-5 left-0 h-1 bg-amber-500 rounded transition-all" style={{ width: `${(currentStepIdx / (statusSteps.length - 1)) * 100}%` }} />
            {statusSteps.map((step, i) => (
              <div key={step} className="relative flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${i <= currentStepIdx ? "bg-amber-500 text-white" : "bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400"}`}>
                  {i <= currentStepIdx ? "✓" : i + 1}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">{statusLabels[step]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client info */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Informații client</h2>
          <div className="space-y-3 text-sm">
            <div><span className="text-slate-500 dark:text-slate-400">Nume:</span><p className="font-medium text-slate-900 dark:text-white">{order.client}</p></div>
            <div><span className="text-slate-500 dark:text-slate-400">Email:</span><p className="font-medium text-slate-900 dark:text-white">{order.email}</p></div>
            <div><span className="text-slate-500 dark:text-slate-400">Telefon:</span><p className="font-medium text-slate-900 dark:text-white">{order.phone}</p></div>
            <div><span className="text-slate-500 dark:text-slate-400">Adresă:</span><p className="font-medium text-slate-900 dark:text-white">{order.address}</p></div>
            <div><span className="text-slate-500 dark:text-slate-400">Dată:</span><p className="font-medium text-slate-900 dark:text-white">{order.date}</p></div>
          </div>
        </div>

        {/* Order items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Produse</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-2 font-medium">Produs</th>
                  <th className="pb-2 font-medium text-center">Cant.</th>
                  <th className="pb-2 font-medium text-right">Preț</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="py-2.5 text-slate-900 dark:text-white">{item.name}</td>
                    <td className="py-2.5 text-center text-slate-600 dark:text-slate-300">{item.qty}</td>
                    <td className="py-2.5 text-right text-slate-600 dark:text-slate-300">{item.price} MDL</td>
                    <td className="py-2.5 text-right font-medium text-slate-900 dark:text-white">{(item.qty * item.price).toLocaleString()} MDL</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Subtotal</span><span>{order.subtotal.toLocaleString()} MDL</span></div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Transport</span><span>{order.shipping === 0 ? "Gratuit" : `${order.shipping} MDL`}</span></div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white text-base pt-2 border-t border-slate-200 dark:border-slate-700"><span>Total</span><span>{order.total.toLocaleString()} MDL</span></div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-white">Actualizare status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none">
                  {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Note interne</label>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Note..." />
              </div>
            </div>
            <button onClick={handleSave} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg text-sm transition">
              Salvează modificările
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
