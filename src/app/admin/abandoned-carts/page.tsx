'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Mail, RefreshCw, Clock } from 'lucide-react';

interface CartItem {
  id: string;
  quantity: number;
  product: { id: string; name: string; price: number; images: string };
}

interface AbandonedCart {
  id: string;
  user: { id: string; name: string; email: string; phone?: string };
  itemCount: number;
  total: number;
  lastActivity: string;
  items: CartItem[];
  sentReminder?: boolean;
}

export default function AbandonedCartsAdmin() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sending, setSending] = useState<string | null>(null);

  const fetchCarts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/abandoned-carts?page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setCarts(data.carts || []);
        setTotal(data.total || 0);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchCarts(); }, [fetchCarts]);

  const sendReminder = async (cartId: string) => {
    setSending(cartId);
    try {
      const res = await fetch('/api/admin/abandoned-carts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Email trimis către ${data.sentTo}`);
        fetchCarts();
      } else {
        alert('Eroare la trimiterea emailului');
      }
    } catch { alert('Eroare la trimitere'); }
    setSending(null);
  };

  const getImg = (images: string) => {
    try { return JSON.parse(images)[0] || '/placeholder.png'; } catch { return '/placeholder.png'; }
  };

  const pages = Math.ceil(total / 20);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-amber-500" /> Coșuri Abandonate
          </h1>
          <p className="text-sm text-slate-500 mt-1">{total} coșuri abandonate (&gt;24h fără activitate)</p>
        </div>
        <button onClick={fetchCarts} className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="animate-pulse h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />)}</div>
      ) : carts.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nicio coș abandonat</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {carts.map(cart => (
              <div key={cart.id} className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-xl border border-slate-200 dark:border-white/[0.06] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-800 dark:text-white">{cart.user.name || 'N/A'}</p>
                      <p className="text-xs text-slate-400">{cart.user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800 dark:text-white">{cart.total.toFixed(0)} MDL</p>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {new Date(cart.lastActivity).toLocaleDateString('ro')}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                  {cart.items.slice(0, 4).map(item => (
                    <div key={item.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 rounded-lg px-2 py-1 shrink-0">
                      <img src={getImg(item.product.images)} alt="" className="w-8 h-8 rounded object-cover" />
                      <div className="text-xs">
                        <p className="font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">{item.product.name}</p>
                        <p className="text-slate-400">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {cart.items.length > 4 && (
                    <div className="flex items-center px-2 text-xs text-slate-400">+{cart.items.length - 4} mai multe</div>
                  )}
                </div>

                <button
                  onClick={() => sendReminder(cart.id)}
                  disabled={sending === cart.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {sending === cart.id ? 'Se trimite...' : 'Trimite Reminder'}
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm disabled:opacity-50">← Anterior</button>
              <span className="text-sm text-slate-500">Pagina {page} / {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm disabled:opacity-50">Următor →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
