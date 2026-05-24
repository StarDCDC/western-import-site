"use client";

import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  _count: { orders: number };
}

const roleLabels: Record<string, { label: string; cls: string }> = {
  ADMIN: { label: "Admin", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  MODERATOR: { label: "Moderator", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  CUSTOMER: { label: "Client", cls: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300" },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${page}&limit=20`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data || []);
        setTotal(json.pagination?.total || 0);
        setTotalPages(json.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const changeRole = async (id: string, newRole: string) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role: newRole }),
      });
      const json = await res.json();
      if (json.success) {
        setUsers(users.map((u) => u.id === id ? { ...u, role: newRole } : u));
      } else {
        alert(json.error || "Eroare");
      }
    } catch {
      alert("Eroare");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (u.name || "").toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || (u.phone || "").includes(s);
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Utilizatori</h1>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <input
          type="text"
          placeholder="Caută după nume, email sau telefon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-sm"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 font-medium">Utilizator</th>
                <th className="px-4 py-3 font-medium">Telefon</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Înregistrat</th>
                <th className="px-4 py-3 font-medium text-center">Comenzi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-400">Se încarcă...</td></tr>
              ) : filtered.map((u, i) => {
                const r = roleLabels[u.role] || roleLabels.CUSTOMER;
                return (
                  <tr key={u.id} className={`border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 ${i % 2 === 0 ? "" : "bg-slate-50/50 dark:bg-slate-800/50"}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {(u.name || u.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{u.name || "—"}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        disabled={updating === u.id}
                        className="text-xs border-0 bg-transparent focus:ring-0 p-0 cursor-pointer disabled:opacity-50"
                      >
                        <option value="CUSTOMER">Client</option>
                        <option value="MODERATOR">Moderator</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {new Date(u.createdAt).toLocaleDateString("ro-RO")}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-900 dark:text-white font-medium">{u._count.orders}</td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Nu sunt utilizatori</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Pagina {page} din {totalPages} ({total} utilizatori)</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-xs disabled:opacity-50 text-slate-700 dark:text-slate-200">← Anterior</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-xs disabled:opacity-50 text-slate-700 dark:text-slate-200">Următor →</button>
            </div>
          </div>
        )}

        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
          {filtered.length} utilizator(i) afișați din {total} total
        </div>
      </div>
    </div>
  );
}