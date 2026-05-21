"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  orderId: string;
  client: string;
  email: string;
  phone: string;
  address: string;
  date: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  notes: string;
}

const statusOptions = [
  { value: "in_asteptare", label: "În așteptare" },
  { value: "confirmata", label: "Confirmată" },
  { value: "in_livrare", label: "În livrare" },
  { value: "livrata", label: "Livrată" },
  { value: "anulata", label: "Anulată" },
];

const defaultOrders: Order[] = [
  { id: "1", orderId: "WI-2024-001", client: "Ion Popescu", email: "ion@email.com", phone: "+373 69 123 456", address: "str. Ștefan cel Mare 45, Chișinău", date: "2024-12-15", items: [{ name: "Parchet Stejar Natural", qty: 5, price: 890 }], subtotal: 4450, shipping: 130, total: 4580, status: "livrata", notes: "" },
  { id: "2", orderId: "WI-2024-002", client: "Maria Ionescu", email: "maria@email.com", phone: "+373 78 987 654", address: "str. Mihai Eminescu 12, Bălți", date: "2024-12-14", items: [{ name: "Laminat 8mm Classic", qty: 20, price: 245 }, { name: "Baseboard MDF 80mm", qty: 20, price: 45 }], subtotal: 5800, shipping: 250, total: 12500, status: "in_livrare", notes: "Sună înainte de livrare" },
  { id: "3", orderId: "WI-2024-003", client: "Andrei Radu", email: "andrei@email.com", phone: "+373 60 555 123", address: "str. Negruzzi 8, Chișinău", date: "2024-12-14", items: [{ name: "Ușă Interioară Aria", qty: 1, price: 890 }], subtotal: 890, shipping: 0, total: 890, status: "confirmata", notes: "" },
  { id: "4", orderId: "WI-2024-004", client: "Elena Vasile", email: "elena@email.com", phone: "+373 79 444 555", address: "str. 31 August 23, Cahul", date: "2024-12-13", items: [{ name: "Tapet Floral Manchester", qty: 10, price: 135 }, { name: "Vopsea Interior SuperWhite", qty: 4, price: 185 }], subtotal: 2050, shipping: 200, total: 6750, status: "in_asteptare", notes: "Verificare adresă" },
  { id: "5", orderId: "WI-2024-005", client: "Mihai Dinu", email: "mihai@email.com", phone: "+373 68 222 333", address: "str. Alexandru cel Bun 56, Ungheni", date: "2024-12-12", items: [{ name: "Parchet Bamboo Natural", qty: 3, price: 1120 }], subtotal: 3360, shipping: 180, total: 3200, status: "anulata", notes: "Clientul a anulat" },
  { id: "6", orderId: "WI-2024-006", client: "Ana Cristea", email: "ana@email.com", phone: "+373 77 111 222", address: "str. Bulgăr 14, Chișinău", date: "2024-12-11", items: [{ name: "Plintă LED Aluminiu", qty: 8, price: 220 }], subtotal: 1760, shipping: 100, total: 1860, status: "livrata", notes: "" },
  { id: "7", orderId: "WI-2024-007", client: "Victor Lupașcu", email: "victor@email.com", phone: "+373 69 888 999", address: "str. Decebal 3, Orhei", date: "2024-12-10", items: [{ name: "Ușă Glisantă Lumea", qty: 2, price: 3200 }, { name: "Baseboard MDF 80mm", qty: 10, price: 45 }], subtotal: 6850, shipping: 350, total: 7200, status: "in_livrare", notes: "Livrare grea — 2 persoane" },
  { id: "8", orderId: "WI-2024-008", client: "Dana Moraru", email: "dana@email.com", phone: "+373 60 333 444", address: "str. Cuza Vodă 77, Soroca", date: "2024-12-09", items: [{ name: "Mochetă Royal Blue", qty: 6, price: 310 }], subtotal: 1860, shipping: 200, total: 2060, status: "confirmata", notes: "" },
];

const statusMap: Record<string, { label: string; cls: string }> = {
  livrata: { label: "Livrată", cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  in_livrare: { label: "În livrare", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  confirmata: { label: "Confirmată", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  in_asteptare: { label: "În așteptare", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  anulata: { label: "Anulată", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const filters = ["toate", "in_asteptare", "confirmata", "in_livrare", "livrata", "anulata"];

function loadOrders(): Order[] {
  if (typeof window === "undefined") return defaultOrders;
  const s = localStorage.getItem("wi_admin_orders");
  if (s) { try { return JSON.parse(s); } catch {} }
  localStorage.setItem("wi_admin_orders", JSON.stringify(defaultOrders));
  return defaultOrders;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("toate");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setOrders(loadOrders()); setMounted(true); }, []);

  const save = (o: Order[]) => { setOrders(o); localStorage.setItem("wi_admin_orders", JSON.stringify(o)); };

  const filtered = filter === "toate" ? orders : orders.filter((o) => o.status === filter);

  const counts: Record<string, number> = { toate: orders.length };
  orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Comenzi</h1>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>
              {f === "toate" ? "Toate" : statusMap[f]?.label || f} ({counts[f] || 0})
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
              {filtered.map((o, i) => {
                const s = statusMap[o.status];
                return (
                  <tr key={o.id} className={`border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer ${i % 2 === 0 ? "" : "bg-slate-50/50 dark:bg-slate-800/50"}`}>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{o.orderId}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{o.client}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{o.date}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{o.total.toLocaleString()} MDL</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span></td>
                    <td className="px-4 py-3">
                      <button onClick={() => router.push(`/admin/orders/${o.id}`)} className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium">Vezi detalii</button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Nicio comandă găsită</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
          {filtered.length} comandă(e) afișate
        </div>
      </div>
    </div>
  );
}
