// src/components/cart/CartDrawer.tsx
'use client';

import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { getCartTexts } from '@/lib/i18n-cart';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { locale } = useLanguage();
  const isRu = locale === 'ru' || (typeof window !== 'undefined' && window.location.pathname.startsWith('/ru'));
  const txt = getCartTexts(isRu ? 'ru' : 'ro');
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[200]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-[var(--color-dark-surface)] z-[201] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">{txt.yourCart}</h2>
                <span className="text-sm text-slate-500">({items.length} {txt.cartItems})</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">{txt.cartEmptyTitle}</p>
                  <p className="text-slate-400 text-sm mt-1">{txt.cartEmptySubtitle}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="flex gap-3 p-3 bg-slate-50 dark:bg-[var(--color-dark-elevated)] rounded-xl"
                    >
                      <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                        {((item.product.brand as any)?.name || item.product.brand || 'WI').toString().slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-white truncate">{item.product.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{item.product.specs?.procesor || ''}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/[0.08] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/[0.08] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-primary-dark dark:text-primary">{formatPrice(item.product.price * item.quantity)}</div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="self-start p-1.5 text-slate-400 hover:text-accent transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-slate-200 dark:border-white/[0.06] p-4 space-y-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-slate-600 dark:text-slate-300">{txt.total}:</span>
                  <span className="text-primary-dark dark:text-primary">{formatPrice(getTotal())}</span>
                </div>
                <Link
                  href={isRu ? "/ru/cart" : "/cart"}
                  onClick={onClose}
                  className="block w-full bg-primary text-white text-center py-3 rounded-lg font-semibold hover:bg-primary-dark transition-all"
                >
                  {txt.viewCart}
                </Link>
                <Link
                  href={isRu ? "/ru/checkout" : "/checkout"}
                  onClick={onClose}
                  className="btn-accent-glow block w-full bg-accent text-white text-center py-3 rounded-lg font-semibold hover:bg-red-700 transition-all"
                >
                  {txt.checkout}
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
