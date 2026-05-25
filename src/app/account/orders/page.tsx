'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Package, ChevronRight, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

const statusConfig: Record<string, { label: string; cls: string; icon: any }> = {
  PENDING: { label: 'În așteptare', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  CONFIRMED: { label: 'Confirmată', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: CheckCircle },
  PROCESSING: { label: 'Procesare', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Package },
  SHIPPED: { label: 'În livrare', cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', icon: Truck },
  DELIVERED: { label: 'Livrată', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  CANCELLED: { label: 'Anulată', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  RETURNED: { label: 'Returnată', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: XCircle },
  REFUNDED: { label: 'Rambursată', cls: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400', icon: XCircle },
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/account/orders');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/orders/my', { credentials: 'include' })
        .then(r => r.json())
        .then(d => { if (d.success) setOrders(d.data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" /></div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-[1280px] mx-auto px-5 py-8">
        <h1 className="text-2xl font-bold mb-6">Comenzile mele</h1>
        {orders.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nu ai nicio comandă încă.</p>
            <a href="/catalog" className="text-primary hover:underline mt-2 inline-block">Începe cumpărăturile →</a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const sc = statusConfig[order.status] || statusConfig.PENDING;
              const StatusIcon = sc.icon;
              return (
                <div key={order.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <StatusIcon className="w-4 h-4" />
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.cls}`}>{sc.label}</span>
                      <span className="text-sm text-slate-400">#{order.orderNumber}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">{order.total} MDL</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-2">{new Date(order.createdAt).toLocaleDateString('ro-MD')}</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {order.items?.slice(0, 3).map((item: any, idx: number) => (
                      <span key={idx} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">{item.name} × {item.quantity}</span>
                    ))}
                    {order.items?.length > 3 && <span className="text-xs text-slate-400">+{order.items.length - 3} produse</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}