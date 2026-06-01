"use client";

import { useState, useEffect, useCallback } from "react";

interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Coupon>>({
    code: "",
    type: "PERCENTAGE",
    value: 10,
    minOrder: null,
    maxDiscount: null,
    usageLimit: null,
    isActive: true,
    expiresAt: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      const json = await res.json();
      if (json.success) {
        setCoupons(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleSave = async () => {
    if (!form.code?.trim()) {
      setError("Codul este obligatoriu");
      return;
    }
    if (!form.value || form.value <= 0) {
      setError("Valoarea trebuie să fie mai mare decât 0");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSaved(true);
        setShowForm(false);
        setForm({ code: "", type: "PERCENTAGE", value: 10, minOrder: null, maxDiscount: null, usageLimit: null, isActive: true, expiresAt: "" });
        fetchCoupons();
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(json.error || "Eroare la salvare");
      }
    } catch {
      setError("Eroare la salvare");
    } finally {
      setSaving(false);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Ștergi acest cupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        setError(json.error || "Eroare la ștergerea cuponului");
        return;
      }
      fetchCoupons();
    } catch {
      setError("Eroare la ștergerea cuponului");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Coduri Promotionale</h1>
          <p className="text-sm text-slate-500 mt-1">Creează și gestionază coduri de reducere</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg text-sm transition"
        >
          {showForm ? "✕ Anulează" : "+ Cod Nou"}
        </button>
      </div>

      {saved && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
          ✓ Cupon salvat cu succes!
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Creează Cod Promotional</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cod *</label>
              <input
                value={form.code || ""}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="PROMO10"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tip</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "PERCENTAGE" | "FIXED" })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="PERCENTAGE">Procent (% din reducere)</option>
                <option value="FIXED">Sumă fixă (MDL)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {form.type === "PERCENTAGE" ? "Procente (%)" : "Sumă (MDL)"} *
              </label>
              <input
                type="number"
                value={form.value || ""}
                onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
                min="1"
                max={form.type === "PERCENTAGE" ? "100" : undefined}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Comandă minimă (MDL)</label>
              <input
                type="number"
                value={form.minOrder || ""}
                onChange={(e) => setForm({ ...form, minOrder: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="Ex: 500"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reducere maximă (MDL)</label>
              <input
                type="number"
                value={form.maxDiscount || ""}
                onChange={(e) => setForm({ ...form, maxDiscount: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="Ex: 100"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valabil până la</label>
              <input
                type="datetime-local"
                value={form.expiresAt || ""}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg text-sm transition disabled:opacity-50"
            >
              {saving ? "Se salvează..." : "💾 Salvează cuponul"}
            </button>
          </div>
        </div>
      )}

      {/* Coupons list */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Cod</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Tip</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Valoare</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Valabil</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">Nu sunt coduri promoționale</td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-primary">{c.code}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {c.type === "PERCENTAGE" ? "Procent" : "Sumă fixă"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {c.type === "PERCENTAGE" ? `${c.value}%` : `${c.value} MDL`}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {c.expiresAt
                      ? new Date(c.expiresAt).toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" })
                      : "Nelimitat"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {c.isActive ? "Activ" : "Inactiv"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteCoupon(c.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Șterge
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}