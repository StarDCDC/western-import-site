'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Package, CreditCard, Heart, Package as PackageIcon, Truck, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{ name: string; quantity: number }>;
}

export default function AccountPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<{ name: string; email: string; phone: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch('/api/auth/session');
        const session = await res.json();
        if (!session?.user) {
          redirect('/login');
          return;
        }

        const { user: sessionUser } = session;
        setUser({
          name: sessionUser.name || '',
          email: sessionUser.email,
          phone: sessionUser.phone,
        });

        const ordersRes = await fetch('/api/orders');
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setOrders(ordersData.data.slice(0, 5));
        }
      } catch {
        redirect('/login');
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, []);

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-purple-100 text-purple-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    PENDING: 'În așteptare',
    CONFIRMED: 'Confirmată',
    PROCESSING: 'În procesare',
    SHIPPED: 'Expediată',
    DELIVERED: 'Livrată',
    CANCELLED: 'Anulată',
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50 dark:bg-slate-950 py-8">
        <div className="max-w-6xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Contul meu</h1>
                <p className="text-sm text-slate-500">Gestionează contul și comenzile tale</p>
              </div>
              <button className="text-sm text-primary hover:underline">Editare profil</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <nav className="p-4 space-y-1">
                    <button
                      onClick={() => setActiveTab('info')}
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'info' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      Informații cont
                    </button>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'orders' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <PackageIcon className="w-4 h-4" />
                      Comenzile mele
                    </button>
                    <button
                      onClick={() => setActiveTab('payments')}
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'payments' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Metode de plată
                    </button>
                    <button
                      onClick={() => setActiveTab('wishlist')}
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'wishlist' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      Wishlist
                    </button>
                    <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Deconectare
                      </button>
                    </div>
                  </nav>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                {activeTab === 'info' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
                  >
                    <h2 className="text-lg font-semibold mb-4">Informații cont</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Nume complet</label>
                        <p className="font-medium">{user?.name || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Email</label>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Telefon</label>
                        <p className="font-medium">{user?.phone || '-'}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'orders' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Comenzile mele</h2>
                      <Link href="/orders" className="text-sm text-primary hover:underline">Vezi toate</Link>
                    </div>
                    {orders.length === 0 ? (
                      <p className="text-center text-slate-500 py-8">Nicio comandă efectuată</p>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((order) => (
                          <Link
                            key={order.id}
                            href={`/orders/${order.id}`}
                            className="block p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Comanda #{order.orderNumber}</p>
                                <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString('ro')}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{Number(order.total).toLocaleString()} MDL</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                                  {statusLabels[order.status]}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'payments' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
                  >
                    <h2 className="text-lg font-semibold mb-4">Metode de plată</h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Plată la livrare</p>
                            <p className="text-sm text-slate-500">Numerar/Card la curier</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">Activ</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Plată online</p>
                            <p className="text-sm text-slate-5">Card bancar / Google Pay</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">Activ</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'wishlist' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
                  >
                    <h2 className="text-lg font-semibold mb-4">Produse favorite</h2>
                    <p className="text-slate-500 text-center py-8">Funcționalitățile wishlist sunt implementate!</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
