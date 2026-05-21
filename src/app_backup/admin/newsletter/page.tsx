"use client";

import { useState, useEffect, useCallback } from "react";

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showSend, setShowSend] = useState(false);
  const [sendForm, setSendForm] = useState({ subject: "", content: "" });
  const [sending, setSending] = useState(false);

  const fetchSubscribers = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/newsletter?page=${page}&limit=20`);
      const json = await res.json();
      if (json.success) {
        setSubscribers(json.data || []);
        setTotal(json.pagination?.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const handleDelete = async (id: string) => {
    if (!confirm("Sigur vrei să ștergi acest abonat?")) return;
    await fetch(`/api/admin/newsletter?id=${id}`, { method: "DELETE" });
    fetchSubscribers();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sendForm),
      });
      const json = await res.json();
      if (json.success) {
        alert(`Newsletter trimis către ${json.data.sent} abonați!`);
        setShowSend(false);
        setSendForm({ subject: "", content: "" });
      } else {
        alert(json.error || "Eroare");
      }
    } catch {
      alert("Eroare la trimitere");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" /></div>;
  }

  const activeCount = subscribers.filter((s) => s.isActive).length;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Newsletter</h1>
        <button onClick={() => setShowSend(!showSend)} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition">
          ✉️ Trimite newsletter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total abonați</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Abonați activi</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Dezabonați</p>
          <p className="text-2xl font-bold text-red-500">{subscribers.filter((s) => !s.isActive).length}</p>
        </div>
      </div>

      {/* Send form */}
      {showSend && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Trimite newsletter</h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subiect *</label>
              <input
                type="text"
                value={sendForm.subject}
                onChange={(e) => setSendForm({ ...sendForm, subject: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Conținut *</label>
              <textarea
                value={sendForm.content}
                onChange={(e) => setSendForm({ ...sendForm, content: e.target.value })}
                rows={8}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={sending} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
                {sending ? "Se trimite..." : "Trimite"}
              </button>
              <button type="button" onClick={() => setShowSend(false)} className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                Anulează
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subscribers list */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Abonat la</th>
                <th className="px-4 py-3 font-medium">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{sub.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${sub.isActive ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>
                      {sub.isActive ? "Activ" : "Dezabonat"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{new Date(sub.subscribedAt).toLocaleDateString("ro-RO")}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(sub.id)} className="text-red-600 dark:text-red-400 hover:underline text-xs font-medium">Șterge</button>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Nu sunt abonați</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Pagina {page} din {totalPages} ({total} total)
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-xs disabled:opacity-50 text-slate-700 dark:text-slate-200">← Anterior</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-xs disabled:opacity-50 text-slate-700 dark:text-slate-200">Următor →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
