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
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-[200] backdrop-blur-[2px]"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-[var(--color-dark-surface)] z-[201] shadow-2xl flex flex-col border-l border-black/[0.04] dark:border-white/[0.06]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{txt.yourCart}</h2>
                  <span className="text-xs text-slate-400">({items.length} {txt.cartItems})</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">{txt.cartEmptyTitle}</p>
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
                      className="flex gap-3 p-3 bg-slate-50 dark:bg-[var(--color-dark-elevated)] rounded-xl border border-slate-100/60 dark:border-transparent"
                    >
                      <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0 border border-slate-100 dark:border-white/[0.06]">
                        <span className="text-xs font-bold text-slate-400">
                          {((item.product.brand as any)?.name || item.product.brand || 'WI').toString().slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-white truncate">{item.product.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{item.product.specs?.procesor || ''}</p>
                        <div className="flex items-center justify-between mt-2.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/[0.08] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center text-slate-800 dark:text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/[0.08] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-blue-300">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="self-start p-1.5 text-slate-300 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20"
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
              <div className="border-t border-slate-100 dark:border-white/[0.06] p-5 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Subtotal:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(getTotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Livrare:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">GRATUITĂ</span>
                </div>
                <div className="border-t border-slate-100 dark:border-white/[0.06] pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-slate-900 dark:text-white">{txt.total}:</span>
                    <span className="text-slate-900 dark:text-blue-300">{formatPrice(getTotal())}</span>
                  </div>
                </div>
                <Link
                  href={isRu ? "/ru/checkout" : "/checkout"}
                  onClick={onClose}
                  className="btn-accent-glow block w-full bg-accent hover:bg-red-700 text-white text-center py-3.5 rounded-xl font-bold text-base shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                >
                  {txt.checkout}
                </Link>
                <Link
                  href={isRu ? "/ru/cart" : "/cart"}
                  onClick={onClose}
                  className="block text-center py-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  {txt.viewCart}
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
