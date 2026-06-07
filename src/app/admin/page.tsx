"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

interface DashboardData {
  overview: {
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    totalCustomers: number;
    totalRevenue: number;
    monthlyRevenue: number;
    pendingOrders: number;
    newCustomers7d: number;
    outOfStockProducts: number;
  };
  ordersByStatus: { status: string; count: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
    user?: { name: string | null; email: string } | null;
  }[];
  topProducts: {
    id: string;
    name: string;
    price: number;
    totalSold: number | null;
  }[];
  dailySales: Record<string, { orders: number; revenue: number }>;
}

const statusMap: Record<string, { label: string; cls: string }> = {
  DELIVERED: { label: "Livrată", cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  SHIPPED: { label: "În livrare", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  CONFIRMED: { label: "Confirmată", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  PENDING: { label: "În așteptare", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  PROCESSING: { label: "Procesare", cls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  CANCELLED: { label: "Anulată", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  RETURNED: { label: "Returnată", cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  REFUNDED: { label: "Rambursată", cls: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
};

const PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#eab308", "#6366f1", "#ef4444", "#f97316", "#ec4899"];

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("7d");

  useEffect(() => {
    // Verify admin session before showing anything
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(session => {
        const role = session?.user?.role;
        if (!session?.user || (role !== 'ADMIN' && role !== 'MODERATOR')) {
          router.push('/admin/login?callbackUrl=/admin&error=access_denied');
        }
      })
      .catch(() => router.push('/admin/login'));
  }, [router]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  const overview = data?.overview || {
    totalProducts: 0, activeProducts: 0, totalOrders: 0,
    totalCustomers: 0, totalRevenue: 0, monthlyRevenue: 0,
    pendingOrders: 0, newCustomers7d: 0, outOfStockProducts: 0,
  };
  const recentOrders = data?.recentOrders || [];
  const topProducts = data?.topProducts || [];
  const ordersByStatus = data?.ordersByStatus || [];
  const dailySales = data?.dailySales || {};

  // Prepare chart data
  const salesChartData = Object.entries(dailySales).map(([date, val]) => ({
    date: date.slice(5),
    Venituri: Math.round(val.revenue),
    Comenzi: val.orders,
  }));

  const pieData = ordersByStatus.map((s) => ({
    name: statusMap[s.status]?.label || s.status,
    value: s.count,
  }));

  const cards = [
    { label: "Venituri totale", value: `${Math.round(overview.totalRevenue).toLocaleString()} MDL`, icon: "💰", color: "bg-green-500", sub: `Luna: ${Math.round(overview.monthlyRevenue).toLocaleString()} MDL` },
    { label: "Comenzi", value: String(overview.totalOrders), icon: "🛒", color: "bg-blue-500", sub: `${overview.pendingOrders} în așteptare` },
    { label: "Produse active", value: String(overview.activeProducts), icon: "📦", color: "bg-amber-500", sub: `${overview.totalProducts} total` },
    { label: "Clienți noi (7z)", value: String(overview.newCustomers7d), icon: "👥", color: "bg-purple-500", sub: `${overview.totalCustomers} total` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <div className="flex gap-2">
          {(["7d", "30d", "all"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                period === p
                  ? "bg-amber-500 text-white"
                  : "bg-white dark:bg-[var(--color-dark-elevated)] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06]"
              }`}
            >
              {p === "7d" ? "7 zile" : p === "30d" ? "30 zile" : "Tot"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-xl shadow-sm border border-slate-200 dark:border-white/[0.06] p-5">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${c.color} rounded-xl flex items-center justify-center text-2xl text-white`}>{c.icon}</div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{c.label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{c.value}</p>
                <p className="text-xs text-slate-400">{c.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue trend */}
        <div className="lg:col-span-2 bg-white dark:bg-[var(--color-dark-elevated)] rounded-xl shadow-sm border border-slate-200 dark:border-white/[0.06] p-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Vânzări (7 zile)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff" }}
                formatter={(value: unknown) => [`${Number(value).toLocaleString()} MDL`, "Venituri"]}
              />
              <Bar dataKey="Venituri" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by status pie */}
        <div className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-xl shadow-sm border border-slate-200 dark:border-white/[0.06] p-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Comenzi după status</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-slate-400">Nu sunt comenzi</div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {pieData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white dark:bg-[var(--color-dark-elevated)] rounded-xl shadow-sm border border-slate-200 dark:border-white/[0.06] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Ultimele comenzi</h2>
            <button onClick={() => router.push("/admin/orders")} className="text-sm text-amber-600 dark:text-amber-400 hover:underline">Vezi toate →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.06]">
                  <th className="pb-2 font-medium">Comandă</th>
                  <th className="pb-2 font-medium">Client</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.slice(0, 8).map((o) => {
                  const s = statusMap[o.status] || { label: o.status, cls: "bg-slate-100 text-slate-600" };
                  return (
                    <tr key={o.id} className="border-b border-slate-100 dark:border-white/[0.06]/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer">
                      <td className="py-2.5 font-medium text-slate-900 dark:text-white">{o.orderNumber}</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-300">{o.user?.name || o.user?.email || "—"} </td>
                      <td className="py-2.5 text-slate-900 dark:text-white font-medium">{Math.round(o.total).toLocaleString()} MDL</td>
                      <td className="py-2.5"><span className={`px-2 py-1 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span></td>
                    </tr>
                  );
                })}
                {recentOrders.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-slate-400">Nu sunt comenzi</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-xl shadow-sm border border-slate-200 dark:border-white/[0.06] p-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Produse populare</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-bold text-amber-500 w-5">#{i + 1}</span>
                  <span className="text-sm text-slate-700 dark:text-slate-200 truncate">{p.name}</span>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap ml-2">{p.totalSold || 0} vând.</span>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Nu sunt date</p>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-xl shadow-sm border border-slate-200 dark:border-white/[0.06] p-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">⚠️ Alertă stoc</h2>
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <span className="text-red-500 text-lg">🔴</span>
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Produse fără stoc</p>
              <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">{overview.outOfStockProducts} produse au stocul 0</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mt-3">
            <span className="text-yellow-500 text-lg">🟡</span>
            <div>
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Comenzi în așteptare</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-0.5">{overview.pendingOrders} comenzi necesită confirmare</p>
            </div>
          </div>
        </div>

        {/* Revenue trend mini */}
        <div className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-xl shadow-sm border border-slate-200 dark:border-white/[0.06] p-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Trend venituri</h2>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff" }}
                formatter={(value: unknown) => [`${Number(value).toLocaleString()} MDL`, ""]}
              />
              <Line type="monotone" dataKey="Venituri" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
