"use client";

import { useState, useEffect, useCallback } from "react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  questionRu: string;
  answerRu: string;
  order: number;
  isActive: boolean;
}

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", questionRu: "", answerRu: "", order: 0, isActive: true });

  const fetchFaqs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/faq");
      const json = await res.json();
      if (json.success) setFaqs(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFaqs(); }, [fetchFaqs]);

  const resetForm = () => {
    setForm({ question: "", answer: "", questionRu: "", answerRu: "", order: 0, isActive: true });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (faq: FAQ) => {
    setEditing(faq);
    setForm({ question: faq.question, answer: faq.answer, questionRu: faq.questionRu || "", answerRu: faq.answerRu || "", order: faq.order, isActive: faq.isActive });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editing ? "PUT" : "POST";
      const body = editing ? { id: editing.id, ...form } : form;
      const res = await fetch("/api/admin/faq", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.success) { resetForm(); fetchFaqs(); }
      else alert(json.error || "Eroare");
    } catch {
      alert("Eroare la salvare");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sigur vrei să ștergi?")) return;
    await fetch(`/api/admin/faq?id=${id}`, { method: "DELETE" });
    fetchFaqs();
  };

  const toggleActive = async (faq: FAQ) => {
    await fetch("/api/admin/faq", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: faq.id, isActive: !faq.isActive }),
    });
    fetchFaqs();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">FAQ</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition">
          + Întrebare nouă
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-xl shadow-sm border border-slate-200 dark:border-white/[0.06] p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            {editing ? "Editează" : "Întrebare nouă"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Întrebare *</label>
              <input
                type="text"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-white/[0.08] rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Răspuns *</label>
              <textarea
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                rows={5}
                className="w-full px-4 py-2 border border-slate-300 dark:border-white/[0.08] rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div className="border-t border-slate-200 dark:border-white/[0.06] pt-4 mt-2">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3">🇷🇺 Перевод на русский</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Вопрос (RU)</label>
              <input
                type="text"
                value={form.questionRu}
                onChange={(e) => setForm({ ...form, questionRu: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-white/[0.08] rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Вопрос на русском языке"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ответ (RU)</label>
              <textarea
                value={form.answerRu}
                onChange={(e) => setForm({ ...form, answerRu: e.target.value })}
                rows={5}
                className="w-full px-4 py-2 border border-slate-300 dark:border-white/[0.08] rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Ответ на русском языке"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ordine</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-white/[0.08] rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="faqActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 text-amber-500 rounded" />
                <label htmlFor="faqActive" className="text-sm text-slate-700 dark:text-slate-300">Activ</label>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition">
                {editing ? "Salvează" : "Creează"}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 border border-slate-300 dark:border-white/[0.08] rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                Anulează
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-xl shadow-sm border border-slate-200 dark:border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 font-medium w-10">#</th>
                <th className="px-4 py-3 font-medium">Întrebare</th>
                <th className="px-4 py-3 font-medium">Răspuns</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((faq) => (
                <tr key={faq.id} className="border-b border-slate-100 dark:border-white/[0.06]/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-slate-500">{faq.order}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white max-w-xs truncate">{faq.question}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-md truncate">{faq.answer}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(faq)}>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${faq.isActive ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}>
                        {faq.isActive ? "Activ" : "Inactiv"}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(faq)} className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium">Edit</button>
                      <button onClick={() => handleDelete(faq.id)} className="text-red-600 dark:text-red-400 hover:underline text-xs font-medium">Șterge</button>
                    </div>
                  </td>
                </tr>
              ))}
              {faqs.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Nu sunt întrebări FAQ</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
