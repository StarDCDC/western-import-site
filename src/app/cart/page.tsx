'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { formatPrice } from '@/lib/api';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag, Loader2, Truck } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/store';

interface CouponData {
  code: string;
  type: string;
  value: number;
  discount: number;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [coupon, setCoupon] = useState<CouponData | null>(null);

  const subtotal = getTotal();
  const shipping = 0;

  // Coupon discount
  const couponDiscount = coupon?.discount || 0;

  const totalDiscount = couponDiscount;
  const total = subtotal - totalDiscount + shipping;

  // Free shipping remaining
  const remainingForFreeShipping = 0;

  const handlePromo = async () => {
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    setPromoError('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, subtotal }),
      });
      const data = await res.json();

      if (data.success) {
        setCoupon(data.data);
        setPromoApplied(true);
      } else {
        setPromoError(data.error || 'Cod invalid');

      }
    } catch {
      setPromoError('Eroare la validare');
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setCoupon(null);
    setPromoApplied(false);
    setPromoCode('');
    setPromoError('');
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="max-w-[1280px] mx-auto px-5 py-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" /> Coșul de Cumpărături
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">Coșul este gol</h2>
              <p className="text-slate-500 mb-6">Adaugă produse pentru a începe cumpărăturile</p>
              <Link href="/catalog" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors">
                <ArrowLeft className="w-4 h-4" /> Continuă cumpărăturile
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
              {/* Items */}
              <div className="space-y-3">
                <AnimatePresence>
                  {items.map((item, index) => {
                    const hasDiscount = item.product.oldPrice && item.product.oldPrice > item.product.price;
                    return (
                      <motion.div
                        key={item.product?.id || index}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex gap-4"
                      >
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 relative">
                          {((item.product?.brand as any)?.name || item.product?.brand || 'WI').toString().slice(0, 2).toUpperCase()}
                          {hasDiscount && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">REDUCERE</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${item.product?.id}`} className="text-sm font-semibold text-slate-800 dark:text-white hover:text-primary line-clamp-1">
                            {item.product?.name || 'Produs'}
                          </Link>
                          <p className="text-xs text-slate-500 mt-0.5">{item.product?.specs?.procesor}, {item.product?.specs?.display}</p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.product?.id || '', item.quantity - 1)}
                                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product?.id || '', item.quantity + 1)}
                                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-primary-dark dark:text-primary">{formatPrice((item.product?.price || 0) * item.quantity)}</div>
                              {hasDiscount && (
                                <div className="text-[11px] text-slate-400 line-through">{formatPrice((item.product?.oldPrice || 0) * item.quantity)}</div>
                              )}
                              {item.quantity > 1 && <div className="text-[11px] text-slate-400">{formatPrice(item.product?.price || 0)} / buc</div>}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.product?.id || '')} className="self-start p-1.5 text-slate-400 hover:text-accent transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Upsell: Free shipping reminder */}
                {remainingForFreeShipping > 0 && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-800 flex items-center gap-3">
                    <Truck className="w-6 h-6 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                        Mai adaugă {formatPrice(remainingForFreeShipping)} pentru livrare gratuită!
                      </p>
                      <Link href="/catalog" className="text-xs text-amber-600 hover:underline">Vezi produse →</Link>
                    </div>
                  </div>
                )}


              </div>

              {/* Summary */}
              <div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 sticky top-24">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4">Sumar Comandă</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Subtotal ({getItemCount()} produse)</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>

                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Reducere cod ({coupon?.code})</span>
                        <span>-{formatPrice(couponDiscount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Transport</span>
                      <span>{shipping === 0 ? <span className="text-green-600 font-semibold">Gratuit</span> : formatPrice(shipping)}</span>
                    </div>

                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Total economie</span>
                        <span>-{formatPrice(totalDiscount)}</span>
                      </div>
                    )}

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between font-bold text-lg text-slate-800 dark:text-white">
                      <span>Total</span>
                      <span className="text-primary-dark dark:text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Promo */}
                  <div className="mt-4">
                    {coupon ? (
                      <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-700 dark:text-green-400">{coupon.code}</span>
                        </div>
                        <button onClick={removePromo} className="text-xs text-red-500 hover:underline">Elimină</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                            placeholder="Cod promoțional"
                            className="w-full py-2 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                          />
                        </div>
                        <button
                          onClick={handlePromo}
                          disabled={promoLoading || !promoCode.trim()}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                        >
                          {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplică'}
                        </button>
                      </div>
                    )}
                    {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
                    {promoApplied && !promoError && <p className="text-xs text-green-600 mt-1">✓ Cod aplicat! Reducere {coupon?.type === 'PERCENTAGE' ? `${coupon?.value}%` : formatPrice(coupon?.value || 0)}</p>}
                  </div>

                  <Link
                    href="/checkout"
                    className="block w-full bg-accent text-white text-center py-3 rounded-xl font-semibold mt-5 hover:bg-red-700 transition-colors"
                  >
                    Finalizează comanda — {formatPrice(total)}
                  </Link>
                  <Link
                    href="/catalog"
                    className="block w-full text-center py-2.5 rounded-xl font-medium mt-2 text-sm text-slate-500 hover:text-primary transition-colors"
                  >
                    ← Continuă cumpărăturile
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
