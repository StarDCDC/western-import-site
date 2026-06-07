// src/app/wishlist/page.tsx
'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useWishlistStore, useCartStore } from '@/lib/store';
import { formatPrice, getDiscount } from '@/lib/api';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50 dark:bg-[var(--color-dark-bg)] min-h-screen">
        <div className="max-w-[1280px] mx-auto px-5 py-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Heart className="w-6 h-6 text-accent" /> Favorite ({items.length})
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">Lista de favorite este goală</h2>
              <p className="text-slate-500 mb-6">Adaugă produse la favorite pentru a le găsi ușor mai târziu</p>
              <Link href="/catalog" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors">
                Vezi catalogul
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {items.map((product) => {
                  const discount = product.oldPrice ? getDiscount(product.oldPrice, product.price) : null;
                  const isPhone = product.category === 'telefoane';

                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white dark:bg-[var(--color-dark-elevated)] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-4 relative"
                    >
                      <button
                        onClick={() => removeItem(product.id)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-accent hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors z-10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <Link href={`/product/${product.id}`}>
                        <div className="flex items-center justify-center h-36 mb-3">
                          <svg viewBox={isPhone ? '0 0 120 160' : '0 0 200 130'} fill="none" className="max-h-28 w-auto">
                            {isPhone ? (
                              <>
                                <rect x="25" y="8" width="70" height="130" rx="12" fill="#e2e8f0" />
                                <rect x="30" y="20" width="60" height="98" rx="3" fill="#1a56db" opacity=".08" />
                                <circle cx="60" cy="128" r="4" fill="#cbd5e1" />
                              </>
                            ) : (
                              <>
                                <rect x="15" y="10" width="170" height="95" rx="6" fill="#e2e8f0" />
                                <rect x="25" y="18" width="150" height="78" rx="2" fill="#1a56db" opacity=".08" />
                                <rect x="60" y="105" width="80" height="5" rx="2" fill="#cbd5e1" />
                              </>
                            )}
                          </svg>
                        </div>
                      </Link>
                      <Link href={`/product/${product.id}`}>
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-white leading-snug mb-1">{product.name}</h3>
                      </Link>
                      <p className="text-xs text-slate-500 mb-2">{product.specs?.procesor || ""}{product.specs?.display ? `, ${product.specs.display}` : ""}</p>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg font-extrabold text-primary-dark dark:text-primary">{formatPrice(product.price)}</span>
                        {product.oldPrice && <span className="text-xs text-slate-400 line-through">{formatPrice(product.oldPrice)}</span>}
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full bg-primary text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Adaugă în coș
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
