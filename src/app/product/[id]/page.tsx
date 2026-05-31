// src/app/product/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getProduct, formatPrice, getDiscount, type CreditCalculation } from '@/lib/api';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, BarChart3, Star, CreditCard, Truck, Shield, ExternalLink, Loader2 } from 'lucide-react';
import type { Product } from '@/lib/data';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { AVAILABLE_MONTHS } from '@/lib/integrations/iuteCredit';
import { trackProductView } from '@/components/home/RecentlyViewed';

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [qty, setQty] = useState(1);
  const { locale, t } = useLanguage();
  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.addItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const removeWishlist = useWishlistStore((s) => s.removeItem);

  // IuteCredit state
  const [creditPlans, setCreditPlans] = useState<CreditCalculation[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<number>(12);
  const [creditLoading, setCreditLoading] = useState(true);

  // Load product
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await getProduct(productId);
        if (result) {
          setProduct(result.product);
          setSimilar(result.similar);
          // Track recent view
          trackProductView(productId);
        }
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    }
    if (productId) load();
  }, [productId]);

  // Load credit calculations
  // Credit calculations — skip API call, use local fallback for instant load
  // Remote IuteCredit call removed to prevent slow page loads

  // Local credit calculation fallback
  useEffect(() => {
    if (creditPlans.length === 0 && product && !creditLoading) {
      const INTEREST_RATES: Record<number, number> = { 3: 0, 6: 0, 9: 4.9, 12: 7.9, 18: 11.9, 24: 14.9 };
      const plans: CreditCalculation[] = AVAILABLE_MONTHS.map(months => {
        const rate = INTEREST_RATES[months] || 0;
        let monthlyPayment: number;
        if (rate === 0) {
          monthlyPayment = Math.ceil(product.price / months);
        } else {
          const monthlyRate = rate / 100 / 12;
          const factor = Math.pow(1 + monthlyRate, months);
          monthlyPayment = Math.ceil(product.price * (monthlyRate * factor) / (factor - 1));
        }
        const totalPayment = monthlyPayment * months;
        return {
          months,
          monthlyPayment,
          totalPayment,
          interestRate: rate,
          interestAmount: totalPayment - product.price,
        };
      });
      setCreditPlans(plans);
      const zeroPlan = plans.filter(p => p.interestRate === 0);
      if (zeroPlan.length > 0) {
        setSelectedMonths(zeroPlan[zeroPlan.length - 1].months);
      }
    }
  }, [product, creditPlans.length, creditLoading]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-screen">
          <div className="max-w-[1280px] mx-auto px-5 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 h-[400px] animate-pulse" />
              <div className="space-y-4">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse" />
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse" />
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Produsul nu a fost găsit</h1>
            <Link href="/catalog" className="text-primary font-semibold hover:underline">← Înapoi la catalog</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const discount = product.oldPrice ? getDiscount(product.oldPrice, product.price) : null;
  const isPhone = product.category === 'telefoane';
  const selectedPlan = creditPlans.find(p => p.months === selectedMonths);

  // Parse images from string or array
  const productImages: string[] = (() => {
    const rawImages = product.images as string | string[];
    if (Array.isArray(rawImages)) return rawImages;
    if (typeof rawImages === 'string' && rawImages.length > 0) {
      let s = rawImages.trim();
      if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
      s = s.replace(/\"/g, '"');
      if (s.startsWith('[')) {
        try { return JSON.parse(s); } catch { return []; }
      }
      return s.split(',').map((u: string) => u.trim()).filter((u: string) => u.startsWith('http') || u.startsWith('/'));
    }
    return [];
  })();
  const totalImages = productImages.length;
  const currentImage = totalImages > 0 ? productImages[selectedThumb] : null;

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-[1280px] mx-auto px-5 py-3 flex items-center gap-2 text-sm text-slate-500 flex-wrap">
            <Link href="/" className="hover:text-primary">{t('nav.home')}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/catalog" className="hover:text-primary">{t('nav.catalog')}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 dark:text-white font-medium">{product.name}</span>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-5 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gallery */}
            <div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-8 flex items-center justify-center min-h-[250px] sm:min-h-[400px] relative">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={`${product.name} - ${selectedThumb + 1}`}
                    className="max-h-[220px] sm:max-h-[360px] w-auto object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <svg viewBox={isPhone ? '0 0 200 300' : '0 0 400 280'} fill="none" className="w-full max-w-sm">
                    {isPhone ? (
                      <>
                        <rect x="40" y="10" width="120" height="260" rx="20" fill="#e2e8f0" />
                        <rect x="50" y="35" width="100" height="200" rx="5" fill="#1a56db" opacity=".08" />
                      </>
                    ) : (
                      <>
                        <rect x="30" y="20" width="340" height="190" rx="12" fill="#e2e8f0" />
                        <rect x="50" y="35" width="300" height="155" rx="4" fill="#1a56db" opacity=".06" />
                      </>
                    )}
                  </svg>
                )}
                {totalImages > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedThumb((prev) => (prev - 1 + totalImages) % totalImages)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-700/80 rounded-full p-2 shadow hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <button
                      onClick={() => setSelectedThumb((prev) => (prev + 1) % totalImages)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-700/80 rounded-full p-2 shadow hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                  </>
                )}
              </div>
              {totalImages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  {productImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedThumb(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        i === selectedThumb ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                      }`
                    }
                    />
                  ))}
                  <span className="text-xs text-slate-400 ml-2">{selectedThumb + 1} / {totalImages}</span>
                </div>
              )}

              {/* Description text under image */}
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-3 px-1">{(locale === 'ru' && product.descriptionRu) ? product.descriptionRu : product.description}</p>
            </div>

            {/* Details */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white ${
                  product.condition === 'nou' ? 'bg-success' : 'bg-info'
                }`}>
                  {product.condition === 'nou' ? t('product.nou') : t('product.refurbished')}
                </span>
                {discount && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-accent">-{discount}%</span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-2">{product.name}</h1>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                  ))}
                  <span className="text-sm text-slate-500 ml-1">({product.reviews.length} review-uri)</span>
                </div>
                <span className="text-xs text-slate-400">Cod: WI-{product.id.padStart(4, '0')}</span>
              </div>

              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-2xl sm:text-3xl font-extrabold text-primary-dark dark:text-primary">{formatPrice(product.price)}</span>
                {product.oldPrice && (
                  <span className="text-base sm:text-lg text-slate-400 line-through">{formatPrice(product.oldPrice)}</span>
                )}
              </div>

              {/* ─── IuteCredit Section ─────────────────────────────── */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl p-3 sm:p-5 mb-6 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-orange-600" />
                  <h3 className="font-bold text-sm text-orange-800 dark:text-orange-300">Cumpără în rate — IuteCredit</h3>
                  {selectedPlan?.interestRate === 0 && (
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full">0% DOBÂNDĂ</span>
                  )}
                </div>

                {creditPlans.length > 0 ? (
                  <>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-extrabold text-orange-700 dark:text-orange-300">
                        de la {formatPrice(creditPlans[0].monthlyPayment)}/lună
                      </span>
                    </div>

                    {/* Months selector */}
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {creditPlans.map((plan) => (
                        <button
                          key={plan.months}
                          onClick={() => setSelectedMonths(plan.months)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            selectedMonths === plan.months
                              ? 'bg-orange-600 text-white shadow-md'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-orange-400'
                          }`}
                        >
                          {plan.months} luni
                          {plan.interestRate === 0 && <span className="ml-1 text-green-600">✓</span>}
                        </button>
                      ))}
                    </div>

                    {/* Selected plan details */}
                    {selectedPlan && (
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-3 mb-3 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Rata lunară:</span>
                          <span className="font-bold text-slate-800 dark:text-white">{formatPrice(selectedPlan.monthlyPayment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Total de plată:</span>
                          <span className="font-bold text-slate-800 dark:text-white">{formatPrice(selectedPlan.totalPayment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Dobândă anuală:</span>
                          <span className={`font-bold ${selectedPlan.interestRate === 0 ? 'text-green-600' : 'text-slate-800 dark:text-white'}`}>
                            {selectedPlan.interestRate === 0 ? '0% (GRATUIT)' : `${selectedPlan.interestRate}%`}
                          </span>
                        </div>
                        {selectedPlan.interestAmount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Cost credit:</span>
                            <span className="text-orange-600 font-bold">+{formatPrice(selectedPlan.interestAmount)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/integrations/iute', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'checkout', productId: product.id, months: selectedMonths }),
                          });
                          const json = await res.json();
                          if (json.success && json.data?.checkoutUrl) {
                            window.open(json.data.checkoutUrl, '_blank');
                          } else if (json.success && json.data?.redirectUrl) {
                            window.open(json.data.redirectUrl, '_blank');
                          }
                        } catch {
                          window.open(`/api/integrations/iute?productId=${product.id}`, '_blank');
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" /> Aplică pentru credit
                    </button>
                    <p className="text-[10px] text-slate-500 mt-1.5 text-center">Credit oferit de IuteCredit Moldova. Termeni și condiții aplicabile.</p>
                  </>
                ) : creditLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> Se încarcă opțiunile de credit...
                  </div>
                ) : null}
              </div>

              {/* Specs Table */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-700 font-bold text-sm text-slate-800 dark:text-white">{locale === 'ru' ? 'Технические характеристики' : 'Specificații'}</div>
                {[
                  [(locale === 'ru' ? 'Производитель' : 'Producător'), product.specs?.producator],
                  [(locale === 'ru' ? 'Тип' : 'Tip'), product.specs?.tip],
                  [(locale === 'ru' ? 'Модель процессора' : 'Model Procesor'), product.specs?.cpuModel || product.specs.procesor],
                  [(locale === 'ru' ? 'Серия процессора' : 'Serie Procesor'), product.specs?.cpuSeries],
                  [(locale === 'ru' ? 'Дисплей' : 'Display'), product.specs?.display],
                  [(locale === 'ru' ? 'Разрешение' : 'Rezoluție'), product.specs?.resolution],
                  [(locale === 'ru' ? 'Частота экрана' : 'Frecvență ecran'), product.specs?.refreshRate],
                  [(locale === 'ru' ? 'Оперативная память' : 'Memorie RAM'), product.specs?.ram],
                  [(locale === 'ru' ? 'Хранилище' : 'Stocare'), product.specs?.storage],
                  [(locale === 'ru' ? 'Тип хранилища' : 'Tip Stocare'), product.specs?.storageType],
                  [(locale === 'ru' ? 'Модель видеокарты' : 'Model Placă Video'), product.specs?.gpuModel || product.specs.gpu],
                  [(locale === 'ru' ? 'Серия видеокарты' : 'Serie Placă Video'), product.specs?.gpuSeries],
                  [(locale === 'ru' ? 'Тип видеокарты' : 'Tip Placă Video'), product.specs?.gpuType],
                  [(locale === 'ru' ? 'Операционная система' : 'Sistem de Operare'), product.specs?.os],
                  [(locale === 'ru' ? 'Вес' : 'Greutate'), product.specs?.weight],
                  ...(product.specs?.extra ? [[(locale === 'ru' ? 'Дополнительно' : 'Extra'), product.specs?.extra]] : []),
                ]
                  .filter(([, value]) => value && String(value).trim() !== '')
                  .map(([label, value], i) => (
                    <div key={i} className={`flex text-sm ${i % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''}`}>
                      <div className="w-32 sm:w-40 shrink-0 py-2.5 px-3 sm:px-4 font-medium text-slate-500 dark:text-slate-400">{label}</div>
                      <div className="py-2.5 px-3 sm:px-4 text-slate-800 dark:text-white">{value}</div>
                    </div>
                  ))}
                {(() => {
                  const allSpecs = [
                    ['Producător', product.specs?.producator],
                    ['Tip', product.specs?.tip],
                    ['Model Procesor', product.specs?.cpuModel || product.specs.procesor],
                    ['Serie Procesor', product.specs?.cpuSeries],
                    ['Display', product.specs?.display],
                    ['Rezoluție', product.specs?.resolution],
                    ['Frecvență ecran', product.specs?.refreshRate],
                    ['Memorie RAM', product.specs?.ram],
                    ['Stocare', product.specs?.storage],
                    ['Tip Stocare', product.specs?.storageType],
                    ['Model Placă Video', product.specs?.gpuModel || product.specs.gpu],
                    ['Serie Placă Video', product.specs?.gpuSeries],
                    ['Tip Placă Video', product.specs?.gpuType],
                    ['Sistem de Operare', product.specs?.os],
                    ['Greutate', product.specs?.weight],
                    ...(product.specs?.extra ? [['Extra', product.specs?.extra]] : []),
                  ].filter(([, v]) => v && String(v).trim() !== '');
                  return allSpecs.length === 0 ? (
                    <div className="p-4 text-sm text-slate-400 text-center">{locale === 'ru' ? 'Нет доступных характеристик' : 'Nu sunt specificații disponibile'}</div>
                  ) : null;
                })()}
              </div>

              {/* Quantity + Actions */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">−</button>
                  <span className="px-4 py-2 text-sm font-semibold border-x border-slate-200 dark:border-slate-700">{qty}</span>
                  <button onClick={() => setQty(Math.min(99, qty + 1))} className="px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">+</button>
                </div>
                <button
                  onClick={() => { for (let i = 0; i < qty; i++) addToCart(product); }}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" /> {locale === 'ru' ? 'В корзину' : 'Adaugă în coș'}
                </button>
              </div>

              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => isInWishlist(product.id) ? removeWishlist(product.id) : toggleWishlist(product)}
                  className={`p-2.5 rounded-xl border transition-colors ${isInWishlist(product.id) ? 'border-accent text-accent' : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-accent hover:border-accent'}`}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-accent' : ''}`} />
                </button>
                <button className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary hover:border-primary transition-colors">
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="flex flex-col items-center text-center p-2 sm:p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-1" />
                  <span className="text-[10px] sm:text-[11px] text-slate-500">{locale === 'ru' ? 'Быстрая доставка' : 'Livrare rapidă'}</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 sm:p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-1" />
                  <span className="text-[10px] sm:text-[11px] text-slate-500">{locale === 'ru' ? 'Гарантия включена' : 'Garanție inclusă'}</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 sm:p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-1" />
                  <span className="text-[10px] sm:text-[11px] text-slate-500">Credit 0%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-8 sm:mt-12">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-5">Review-uri</h2>
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {review.author.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-white">{review.author}</div>
                        <div className="text-xs text-slate-400">{review.date}</div>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Buy Together (Cross-Sell) ─────────────────────── */}
          {similar.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{locale === 'ru' ? 'Купить вместе' : 'Cumpără împreună'}</h2>
                <span className="text-xs text-slate-500">{locale === 'ru' ? 'Рекомендуемые товары' : 'Produse recomandate'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {similar.slice(0, 4).map((sp, i) => (
                  <div key={`similar-${sp.id}-${i}`} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:-translate-y-1 hover:shadow-md transition-all relative">
                    {sp.oldPrice && (
                      <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">{locale === 'ru' ? 'СКИДКА' : 'REDUCERE'}</span>
                    )}
                    <Link href={`/product/${sp.id}`}>
                      <div className="flex items-center justify-center h-32 mb-3">
                        {(() => {
                          const imgUrl = Array.isArray(sp.images) ? sp.images[0] : ((typeof (sp.images as string | string[]) === 'string') && (sp.images as string).length > 0 ? (sp.images as string).split(',')[0] : null);
                          return imgUrl ? (
                            <img src={imgUrl} alt={sp.name} className="max-h-28 w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          ) : (
                            <svg viewBox="0 0 200 130" fill="none" className="max-h-24 w-auto"><rect x="15" y="10" width="170" height="95" rx="6" fill="#e2e8f0" /><rect x="25" y="18" width="150" height="78" rx="2" fill="#1a56db" opacity=".08" /></svg>
                          );
                        })()}
                      </div>
                    </Link>
                    <Link href={`/product/${sp.id}`}>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-1">{sp.name}</h4>
                    </Link>
                    <p className="text-xs text-slate-500 mt-1">{sp.specs.procesor}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="text-base font-extrabold text-primary-dark dark:text-primary">{formatPrice(sp.price)}</p>
                        {sp.oldPrice && <p className="text-xs text-slate-400 line-through">{formatPrice(sp.oldPrice)}</p>}
                      </div>
                      <button
                        onClick={() => addToCart(sp)}
                        className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                        title={t('product.addToCart')}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar Products */}
          {similar.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-5">{locale === 'ru' ? 'Похожие товары' : 'Produse Similare'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {similar.map((sp, i) => (
                  <Link key={`similar-${sp.id}-${i}`} href={`/product/${sp.id}`} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:-translate-y-1 hover:shadow-md transition-all">
                    <div className="flex items-center justify-center h-32 mb-3">
                      {(() => {
                        const imgUrl = Array.isArray(sp.images) ? sp.images[0] : ((typeof (sp.images as string | string[]) === 'string') && (sp.images as string).length > 0 ? (sp.images as string).split(',')[0] : null);
                        return imgUrl ? (
                          <img src={imgUrl} alt={sp.name} className="max-h-28 w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <svg viewBox="0 0 200 130" fill="none" className="max-h-24 w-auto"><rect x="15" y="10" width="170" height="95" rx="6" fill="#e2e8f0" /><rect x="25" y="18" width="150" height="78" rx="2" fill="#1a56db" opacity=".08" /></svg>
                        );
                      })()}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-1">{sp.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{sp.specs.procesor}</p>
                    <p className="text-base font-extrabold text-primary-dark dark:text-primary mt-2">{formatPrice(sp.price)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
