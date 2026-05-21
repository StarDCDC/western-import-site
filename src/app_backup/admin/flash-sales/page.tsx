'use client';

import { useState, useEffect, useCallback } from 'react';
import { Zap, Plus, Trash2, Edit2, Save, X, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string;
}

interface FlashSale {
  id: string;
  productId: string;
  discountPercent: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  product: { id: string; name: string; price: number; images: string };
}

export default function FlashSalesAdmin() {
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    productId: '',
    discountPercent: 20,
    startsAt: '',
    endsAt: '',
    isActive: true,
  });

  const fetchSales = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/flash-sales');
      if (res.ok) setSales(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products?limit=200');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || data);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchSales(); fetchProducts(); }, [fetchSales, fetchProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/flash-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ productId: '', discountPercent: 20, startsAt: '', endsAt: '', isActive: true });
        fetchSales();
      }
    } catch { /* ignore */ }
  };

  const toggleActive = async (sale: FlashSale) => {
    try {
      await fetch('/api/admin/flash-sales', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sale.id, isActive: !sale.isActive }),
      });
      fetchSales();
    } catch { /* ignore */ }
  };

  const deleteSale = async (id: string) => {
    if (!confirm('Sigur vrei să ștergi acest flash sale?')) return;
    try {
      await fetch(`/api/admin/flash-sales?id=${id}`, { method: 'DELETE' });
      fetchSales();
    } catch { /* ignore */ }
  };

  const getImg = (images: string) => {
    try { return JSON.parse(images)[0] || '/placeholder.png'; } catch { return '/placeholder.png'; }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-orange-500" /> Flash Sales
          </h1>
          <p className="text-sm text-slate-500 mt-1">Gestionează ofertele cu timp limitat</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium text-sm transition-colors">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Anulează' : 'Adaugă Flash Sale'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Produs</label>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Caută produs..." className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm mb-2" />
              <select value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm">
                <option value="">Selectează produs</option>
                {filteredProducts.slice(0, 50).map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.price} MDL</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount (%)</label>
              <input type="number" min="1" max="90" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: Number(e.target.value) })} required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Începe la</label>
              <input type="datetime-local" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Se încheie la</label>
              <input type="datetime-local" value={form.endsAt} onChange={e => setForm({ ...form, endsAt: e.target.value })} required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm" />
            </div>
          </div>
          <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium text-sm transition-colors">
            <Save className="w-4 h-4" /> Creează Flash Sale
          </button>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="animate-pulse h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />)}</div>
      ) : sales.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Niciun flash sale creat</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sales.map(sale => {
            const now = new Date();
            const start = new Date(sale.startsAt);
            const end = new Date(sale.endsAt);
            const isLive = sale.isActive && start <= now && end >= now;
            const isExpired = end < now;
            const isUpcoming = start > now;

            return (
              <div key={sale.id} className={`flex items-center gap-4 p-4 rounded-xl border ${isLive ? 'border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                <img src={getImg(sale.product.images)} alt="" className="w-14 h-14 rounded-lg object-cover bg-slate-100" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-800 dark:text-white truncate">{sale.product.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-bold text-orange-600">-{sale.discountPercent}%</span>
                    <span className="text-xs text-slate-400">
                      {isLive && <span className="text-green-500 font-medium">🔴 LIVE</span>}
                      {isUpcoming && <span className="text-blue-500">⏳ Urmează</span>}
                      {isExpired && <span className="text-slate-400">⏹ Expirat</span>}
                    </span>
                    <span className="text-xs text-slate-400">{start.toLocaleDateString('ro')} — {end.toLocaleDateString('ro')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(sale)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sale.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    {sale.isActive ? 'Activ' : 'Inactiv'}
                  </button>
                  <button onClick={() => deleteSale(sale.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
