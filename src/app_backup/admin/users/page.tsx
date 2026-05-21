"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  registeredAt: string;
  orders: number;
}

const defaultUsers: User[] = [
  { id: "1", name: "Ion Popescu", email: "ion@email.com", phone: "+373 69 123 456", role: "client", registeredAt: "2024-06-15", orders: 5 },
  { id: "2", name: "Maria Ionescu", email: "maria@email.com", phone: "+373 78 987 654", role: "client", registeredAt: "2024-07-22", orders: 3 },
  { id: "3", name: "Andrei Radu", email: "andrei@email.com", phone: "+373 60 555 123", role: "client", registeredAt: "2024-08-10", orders: 1 },
  { id: "4", name: "Admin Western", email: "admin@western.md", phone: "+373 22 123 456", role: "admin", registeredAt: "2024-01-01", orders: 0 },
  { id: "5", name: "Elena Vasile", email: "elena@email.com", phone: "+373 79 444 555", role: "moderator", registeredAt: "2024-09-05", orders: 2 },
];

const roleLabels: Record<string, { label: string; cls: string }> = {
  admin: { label: "Admin", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  moderator: { label: "Moderator", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  client: { label: "Client", cls: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300" },
};

function loadUsers(): User[] {
  if (typeof window === "undefined") return defaultUsers;
  const s = localStorage.getItem("wi_admin_users");
  if (s) { try { return JSON.parse(s); } catch {} }
  localStorage.setItem("wi_admin_users", JSON.stringify(defaultUsers));
  return defaultUsers;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setUsers(loadUsers()); setMounted(true); }, []);

  const save = (u: User[]) => { setUsers(u); localStorage.setItem("wi_admin_users", JSON.stringify(u)); };

  const changeRole = (id: string, role: string) => {
    save(users.map((u) => u.id === id ? { ...u, role } : u));
  };

  const deleteUser = (id: string) => {
    if (!confirm("Sigur vrei să ștergi acest utilizator?")) return;
    save(users.filter((u) => u.id !== id));
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.phone.includes(s);
  });

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Utilizatori</h1>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <input type="text" placeholder="Caută după nume, email sau telefon..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
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
                <th className="px-4 py-3 font-medium">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const r = roleLabels[u.role] || roleLabels.client;
                return (
                  <tr key={u.id} className={`border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 ${i % 2 === 0 ? "" : "bg-slate-50/50 dark:bg-slate-800/50"}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center text-white font-medium text-sm">{u.name[0]}</div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.phone}</td>
                    <td className="px-4 py-3">
                      <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} className="text-xs border-0 bg-transparent focus:ring-0 p-0 cursor-pointer">
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="client">Client</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.registeredAt}</td>
                    <td className="px-4 py-3 text-center text-slate-900 dark:text-white font-medium">{u.orders}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteUser(u.id)} className="text-xs text-red-600 dark:text-red-400 hover:underline">Șterge</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
          {filtered.length} utilizator(i) afișați
        </div>
      </div>
    </div>
  );
}
