// src/components/home/RecentlyViewed.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Clock, X } from 'lucide-react';
import { formatPrice, getDiscount } from '@/lib/api';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { useLanguage } from '@/components/ui/LanguageProvider';

interface RecentProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  condition: string;
  images: string;
  category: { id: string; nameRo: string; slug: string };
  brand: { id: string; name: string; slug: string };
  specs: string | Record<string, string>;
  avgRating: number;
}

// Generate or retrieve a session ID stored in localStorage
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  const key = 'wi_session_id';
  let sid = localStorage.getItem(key);
  if (!sid) {
    sid = 'sess_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(key, sid);
  }
  return sid;
}

// Track a product view (call from product page)
export async function trackProductView(productId: string) {
  const sessionId = getSessionId();
  if (!sessionId || !productId) return;
  try {
    await fetch('/api/recent-views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, sessionId }),
    });
  } catch { /* silent */ }
}

export default function RecentlyViewed() {
  const { t, locale } = useLanguage();
  const [products, setProducts] = useState<RecentProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.addItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const removeWishlist = useWishlistStore((s) => s.removeItem);

  useEffect(() => {
    async function loadRecent() {
      const sessionId = getSessionId();
      if (!sessionId) { setLoading(false); return; }
      try {
        const res = await fetch(`/api/recent-views?sessionId=${sessionId}&limit=10`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.products) {
            setProducts(json.data.products);
          }
        }
      } catch { /* silent */ }
      setLoading(false);
    }
    loadRecent();
  }, []);

  // Don't render if no products
  if (!loading && products.length === 0) return null;

  return (
    <section className="py-8">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-5 h-5 text-slate-400" />
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{locale === 'ru' ? 'Недавно просмотренные' : 'Recent vizualizate'}</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 animate-pulse">
                <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-1.5 w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {products.map((product, index) => {
              const discount = product.oldPrice ? getDiscount(product.oldPrice, product.price) : null;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <Link href={`/product/${product.id}`}>
                    <div className="flex items-center justify-center h-24 mb-2 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                      {(() => {
                        let imgs: string[] = [];
                        if (typeof product.images === 'string') {
                          try {
                            const parsed = JSON.parse(product.images);
                            if (Array.isArray(parsed)) imgs = parsed;
                          } catch {
                            imgs = product.images.split(',').map(u => u.trim()).filter(u => u.startsWith('http') || u.startsWith('/'));
                          }
                        }
                        if (imgs.length === 0) {
                          return (
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center text-xs font-bold text-slate-400">
                              {product.brand?.name?.slice(0, 2).toUpperCase() || '?'}
                            </div>
                          );
                        }
                        return (
                          <img
                            src={imgs[0]}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        );
                      })()}
                    </div>
                  </Link>
                  <Link href={`/product/${product.id}`}>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-white line-clamp-2 leading-snug mb-1">
                      {product.name}
                    </h4>
                  </Link>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-sm font-bold text-primary-dark dark:text-primary">{formatPrice(product.price)}</span>
                    {product.oldPrice && (
                      <span className="text-[10px] text-slate-400 line-through">{formatPrice(product.oldPrice)}</span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => addToCart(product as any)}
                      className="flex-1 bg-primary text-white py-1.5 rounded-lg text-[11px] font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-1"
                    >
                      <ShoppingCart className="w-3 h-3" /> {locale === 'ru' ? 'Добавить' : 'Adaugă'}
                    </button>
                    <button
                      onClick={() => {
                        if (isInWishlist(product.id)) removeWishlist(product.id);
                        else toggleWishlist(product as any);
                      }}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isInWishlist(product.id)
                          ? 'border-accent text-accent'
                          : 'border-slate-200 dark:border-slate-600 text-slate-400 hover:text-accent'
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${isInWishlist(product.id) ? 'fill-accent' : ''}`} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
