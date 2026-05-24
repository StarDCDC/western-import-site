'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, CheckCircle, XCircle, Upload, X } from 'lucide-react';
import { getBrands } from '@/lib/api';

interface Brand {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  description?: string;
}

export default function AdminBrandsPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [logoUrl, setLogoUrl] = useState('');

  async function fetchBrands() {
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBrands();
  }, []);

  function openNew() {
    setForm({ name: '', slug: '', description: '' });
    setLogoUrl('');
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(b: Brand) {
    setForm({ name: b.name, slug: b.slug || '', description: b.description || '' });
    setLogoUrl(b.logo || '');
    setEditingId(b.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/admin/brands?id=${editingId}` : '/api/admin/brands';
    const body = { name: form.name.trim(), slug: form.slug.trim() || undefined, logo: logoUrl || undefined, description: form.description || undefined };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) { alert(json.error || 'Eroare'); return; }
      setShowForm(false);
      fetchBrands();
    } catch { alert('Eroare'); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Ștergi brandul?')) return;
    try {
      const res = await fetch(`/api/admin/brands?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) { alert(json.error || 'Eroare'); return; }
      fetchBrands();
    } catch { alert('Eroare'); }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.success) setLogoUrl(json.data.url);
      else alert(json.error || 'Upload eșuat');
    } catch { alert('Upload eșuat'); }
  };

  const inputClass = "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Branduri</h1>
          <p className="text-sm text-slate-500 mt-1">{brands.length} branduri</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium">
          <Plus size={16} /> Adaugă brand
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Se încarcă...</div>
      ) : brands.length === 0 ? (
        <div className="text-center py-20 text-slate-400">Niciun brand. Adaugă primul!</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Logo</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Nume</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Slug</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4">
                    {b.logo ? (
                      <img src={b.logo} alt={b.name} className="w-10 h-10 object-contain rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center text-xs text-slate-400">—</div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{b.name}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{b.slug}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(b)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(b.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editingId ? 'Editează brand' : 'Brand nou'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Nume *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Apple, Samsung, Lenovo..." required />
              </div>
              <div>
                <label className={labelClass}>Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} placeholder="auto-generat dacă e gol" />
              </div>
              <div>
                <label className={labelClass}>Descriere</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} rows={2} placeholder="Descriere scurtă..." />
              </div>
              <div>
                <label className={labelClass}>Logo (URL sau încarcă)</label>
                <div className="flex gap-2">
                  <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" placeholder="https://..." />
                  <label className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-1">
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />Încarcă
                  </label>
                </div>
                {logoUrl && <img src={logoUrl} alt="logo" className="mt-2 h-12 object-contain rounded border border-slate-200 dark:border-slate-700" />}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm">
                  {editingId ? 'Salvează' : 'Creează'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                  Anulează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}