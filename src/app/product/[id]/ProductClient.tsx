// src/app/product/[id]/ProductClient.tsx
// Client UI for the product page. Data is provided by the Server Component
// (page.tsx) as props — no client fetch waterfall.
'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { formatPrice, getDiscount } from '@/lib/api';
import { useCartStore, useWishlistStore } from '@/lib/store';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, BarChart3, Star, CreditCard, Truck, Shield } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Product } from '@/lib/data';
import { useLanguage } from '@/components/ui/LanguageProvider';
import InstallmentCalculator from '@/components/product/InstallmentCalculator';
import { trackProductView } from '@/components/home/RecentlyViewed';

// ─── Share Buttons Component ────────────────────────────────────
function SharePopup({ productName, locale, onClose }: { productName: string; locale: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  if (typeof window === 'undefined') return null;

  const productUrl = window.location.href;
  const encodedUrl = encodeURIComponent(productUrl);
  const shareText = `${productName} — Western Import`;
  const fullText = `${shareText}\n${productUrl}`;

  const nativeShare = async (): Promise<boolean> => {
    if (navigator.share) {
      try { await navigator.share({ title: productName, text: shareText, url: productUrl }); return true; } catch {}
    }
    return false;
  };

  const networks = [
    { label: 'Facebook', color: '#1877F2', logo: '/social-facebook.svg', action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank') },
    { label: 'WhatsApp', color: '#25D366', logo: '/social-whatsapp.svg', action: () => window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank') },
    { label: 'Telegram', color: '#26A5E4', logo: '/social-telegram.svg', action: () => window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(shareText)}`, '_blank') },
    { label: 'Viber', color: '#7360F2', logo: '/social-viber.svg', action: () => window.open(`viber://forward?text=${encodeURIComponent(fullText)}`, '_blank') },
    { label: 'Instagram', color: '#E4405F', logo: '/social-instagram.svg', action: async () => { const ok = await nativeShare(); if (!ok) { await navigator.clipboard.writeText(fullText); window.open('https://www.instagram.com/direct/new/', '_blank'); } onClose(); } },
    { label: 'TikTok', color: '#000000', logo: '/social-tiktok.svg', action: async () => { const ok = await nativeShare(); if (!ok) { await navigator.clipboard.writeText(fullText); window.open('https://www.tiktok.com/', '_blank'); } onClose(); } },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-2xl p-6 w-[90vw] max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{locale === 'ru' ? 'Поделиться' : 'Distribuie'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {networks.map(n => (
            <button key={n.label} onClick={n.action} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: n.color }}>
                <img src={n.logo} alt={n.label} className="w-6 h-6" onError={(e) => { (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class=\"text-white text-lg font-bold\">${n.label[0]}</span>`; }} />
              </div>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{n.label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => { navigator.clipboard.writeText(productUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="w-full mt-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.06] text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          {copied ? '✅ Copiat!' : '📋 Copiază link'}
        </button>
      </div>
    </div>
  );
}

function ShareButtons({ productName, locale }: { productName: string; locale: string }) {
  const [showPopup, setShowPopup] = useState(false);
  return (
    <div className="mb-6">
      <button onClick={() => setShowPopup(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
        📤 {locale === 'ru' ? 'Поделиться' : 'Distribuie produsul'}
      </button>
      {showPopup && <SharePopup productName={productName} locale={locale} onClose={() => setShowPopup(false)} />}
    </div>
  );
}

function ReviewForm({ productId, locale }: { productId: string; locale: string }) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !text.trim()) return;
    setSubmitting(true);
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, author: name, rating, text }),
      });
      setSubmitted(true);
    } catch {} finally {
      setSubmitting(false);
    }
  };

  if (submitted) return <p className="text-sm text-emerald-600">{locale === 'ru' ? '✅ Спасибо за отзыв!' : '✅ Mulțumim pentru review!'}</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">{locale === 'ru' ? 'Оценка' : 'Rating'}:</span>
        {Array.from({ length: 5 }, (_, i) => (
          <button key={i} onClick={() => setRating(i + 1)} className="cursor-pointer">
            <Star className={`w-5 h-5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
          </button>
        ))}
      </div>
      <input value={name} onChange={e => setName(e.target.value)} placeholder={locale === 'ru' ? 'Ваше имя' : 'Numele tău'} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-primary" />
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder={locale === 'ru' ? 'Напишите отзыв...' : 'Scrie review-ul tău...'} rows={3} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-primary resize-none" />
      <button onClick={handleSubmit} disabled={submitting || !name.trim() || !text.trim()} className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-40">
        {submitting ? '...' : (locale === 'ru' ? 'Отправить' : 'Trimite')}
      </button>
    </div>
  );
}

export default function ProductClient({ product, similar }: { product: Product; similar: Product[] }) {
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [qty, setQty] = useState(1);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const { locale, t } = useLanguage();
  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.addItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const removeWishlist = useWishlistStore((s) => s.removeItem);

  // Track recent view once on mount.
  useEffect(() => {
    trackProductView(product.id);
  }, [product.id]);

  // Base description for the current locale (RU uses stored translation if present).
  const baseDescription = (locale === 'ru' && product.descriptionRu) ? product.descriptionRu : product.description;

  // On-demand RU translation when no stored `descriptionRu` exists.
  const [translatedDesc, setTranslatedDesc] = useState<string | null>(null);
  useEffect(() => {
    setTranslatedDesc(null);
    if (locale !== 'ru' || product.descriptionRu || !product.description) return;
    let active = true;
    fetch(`/api/translate?from=ro&to=ru&text=${encodeURIComponent(product.description)}`)
      .then((r) => r.json())
      .then((d) => { if (active && d?.text) setTranslatedDesc(d.text); })
      .catch(() => {});
    return () => { active = false; };
  }, [locale, product.description, product.descriptionRu]);
  const displayDescription = (locale === 'ru' && !product.descriptionRu && translatedDesc) ? translatedDesc : baseDescription;


  const discount = product.oldPrice ? getDiscount(product.oldPrice, product.price) : null;
  const isPhone = product.category === 'telefoane';

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
      <main className="flex-1 bg-slate-50 dark:bg-[var(--color-dark-bg)] min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-[var(--color-dark-surface)] border-b border-slate-200 dark:border-white/[0.06]">
          <div className="max-w-[1280px] mx-auto px-5 py-3 flex items-center gap-2 text-sm text-slate-500 flex-wrap">
            <Link href="/" className="hover:text-primary">{t('nav.home')}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/catalog" className="hover:text-primary">{t('nav.catalog')}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 dark:text-white font-medium">{product.name}</span>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-5 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-start">
            {/* Gallery */}
            <div>
              <div
                className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-2xl border border-slate-200 dark:border-white/[0.06] overflow-hidden relative aspect-[4/3] sm:aspect-[16/10] select-none"
                onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
                onTouchEnd={(e) => {
                  if (touchStart === null) return;
                  const diff = touchStart - e.changedTouches[0].clientX;
                  if (Math.abs(diff) > 50) {
                    if (diff > 0 && selectedThumb < totalImages - 1) setSelectedThumb(prev => prev + 1);
                    if (diff < 0 && selectedThumb > 0) setSelectedThumb(prev => prev - 1);
                  }
                  setTouchStart(null);
                }}
              >
                {currentImage ? (
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedThumb}
                      src={currentImage}
                      alt={`${product.name} - ${selectedThumb + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </AnimatePresence>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
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
                  </div>
                )}
                {totalImages > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedThumb((prev) => (prev - 1 + totalImages) % totalImages)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-2.5 transition-colors z-10"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => setSelectedThumb((prev) => (prev + 1) % totalImages)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-2.5 transition-colors z-10"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </>
                )}
                {totalImages > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full z-10">
                    <span className="text-xs text-white font-medium">{selectedThumb + 1} / {totalImages}</span>
                  </div>
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
                      }`}
                    />
                  ))}
                </div>
              )}

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
                  <span className="text-sm text-slate-500 ml-1">({product.reviews.length} {locale === 'ru' ? 'отзывов' : 'review-uri'})</span>
                </div>
                <span className="text-xs text-slate-400">Cod: WI-{product.id.padStart(4, '0')}</span>
              </div>

              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-2xl sm:text-3xl font-extrabold text-primary-dark dark:text-primary">{formatPrice(product.price)}</span>
                {product.oldPrice && (
                  <span className="text-base sm:text-lg text-slate-400 line-through">{formatPrice(product.oldPrice)}</span>
                )}
              </div>

              {/* Quantity + Cart + Favorite + Share — right under price */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center border border-slate-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">−</button>
                  <span className="px-4 py-2 text-sm font-semibold border-x border-slate-200 dark:border-white/[0.06]">{qty}</span>
                  <button onClick={() => setQty(Math.min(99, qty + 1))} className="px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">+</button>
                </div>
                <button
                  onClick={() => { for (let i = 0; i < qty; i++) addToCart(product); }}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" /> {locale === 'ru' ? 'В корзину' : 'Adaugă în coș'}
                </button>
                <button
                  onClick={() => isInWishlist(product.id) ? removeWishlist(product.id) : toggleWishlist(product)}
                  className={`p-2.5 rounded-xl border transition-colors ${isInWishlist(product.id) ? 'border-accent text-accent' : 'border-slate-200 dark:border-white/[0.06] text-slate-400 hover:text-accent hover:border-accent'}`}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-accent' : ''}`} />
                </button>
              </div>

              <ShareButtons productName={product.name} locale={locale} />

              {/* ─── IutePay — calculator rate ────── */}
              {product.price >= 1000 && (
                <InstallmentCalculator price={product.price} />
              )}

              {/* Specs Table */}
              <div className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-2xl border border-slate-200 dark:border-white/[0.06] overflow-hidden mb-6">
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
                    <div key={i} className={`flex text-sm ${i % 2 === 0 ? 'bg-slate-50/50 dark:bg-[var(--color-dark-elevated)]/50' : ''}`}>
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

              {/* Description */}
              {displayDescription && (
                <div className="mt-4 p-4 bg-white dark:bg-[var(--color-dark-elevated)] rounded-xl border border-slate-200 dark:border-white/[0.06]">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">{locale === 'ru' ? 'Описание' : 'Descriere'}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{displayDescription}</p>
                </div>
              )}

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="flex flex-col items-center text-center p-2 sm:p-3 bg-slate-50 dark:bg-[var(--color-dark-elevated)] rounded-xl">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-1" />
                  <span className="text-[10px] sm:text-[11px] text-slate-500">{locale === 'ru' ? 'Быстрая доставка' : 'Livrare rapidă'}</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 sm:p-3 bg-slate-50 dark:bg-[var(--color-dark-elevated)] rounded-xl">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-1" />
                  <span className="text-[10px] sm:text-[11px] text-slate-500">{locale === 'ru' ? 'Гарантия включена' : 'Garanție inclusă'}</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 sm:p-3 bg-slate-50 dark:bg-[var(--color-dark-elevated)] rounded-xl">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-1" />
                  <span className="text-[10px] sm:text-[11px] text-slate-500">Credit 0%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-8 sm:mt-12">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-5">{locale === 'ru' ? 'Отзывы' : 'Review-uri'}</h2>
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-2xl p-5 border border-slate-200 dark:border-white/[0.06]">
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

            {/* Add Review Form */}
            <div className="mt-6 bg-white dark:bg-[var(--color-dark-elevated)] rounded-2xl border border-slate-200 dark:border-white/[0.06] p-5">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">{locale === 'ru' ? 'Оставить отзыв' : 'Scrie un review'}</h3>
              <ReviewForm productId={product.id} locale={locale} />
            </div>
          </div>

          {/* ─── Buy Together (Cross-Sell) — Horizontal cards on mobile ── */}
          {similar.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{locale === 'ru' ? 'Купить вместе' : 'Cumpără împreună'}</h2>
                <span className="text-xs text-slate-500">{locale === 'ru' ? 'Рекомендуемые товары' : 'Produse recomandate'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {similar.slice(0, 4).map((sp, i) => {
                  const imgUrl = Array.isArray(sp.images) ? sp.images[0] : ((typeof (sp.images as string | string[]) === 'string') && (sp.images as string).length > 0 ? (sp.images as string).split(',')[0] : null);
                  return (
                    <div key={`bt-${sp.id}-${i}`} className="bg-white dark:bg-[var(--color-dark-elevated)] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-2 sm:p-4 hover:-translate-y-1 hover:shadow-md transition-all relative flex flex-row sm:flex-col gap-2 sm:gap-0">
                      {sp.oldPrice && (
                        <span className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 rounded-md">{locale === 'ru' ? 'СКИДКА' : 'REDUCERE'}</span>
                      )}
                      <Link href={`/product/${sp.id}`} prefetch={false} className="flex-shrink-0 w-[100px] sm:w-full">
                        {(() => {
                          const imgs = Array.isArray(sp.images) ? sp.images : ((typeof (sp.images as string | string[]) === 'string') && (sp.images as string).length > 0 ? (() => { let s = (sp.images as string).trim(); if (s.startsWith('[')) { try { return JSON.parse(s); } catch { return []; } } return s.split(',').map((u: string) => u.trim()).filter((u: string) => u.startsWith('http') || u.startsWith('/')); })() : []);
                          const hasSecond = Array.isArray(imgs) && imgs.length > 1;
                          return (
                            <div className="w-[100px] h-[100px] sm:w-full sm:h-40 overflow-hidden rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-700/50 group/img relative">
                              {imgUrl ? (
                                <>
                                  <img src={imgUrl} alt={sp.name} className="w-full h-full object-cover transition-opacity duration-300 group-hover/img:opacity-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                  {hasSecond && (
                                    <img src={imgs[1]} alt={`${sp.name} 2`} className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover/img:opacity-100" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                  )}
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                                  <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M20 5H4V19L13.292 9.706a1 1 0 011.414 0L20 15.01V5zM2 3.993A1 1 0 012.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 01-.992.993H2.992A.993.993 0 012 20.007V3.993zM8 11a2 2 0 110-4 2 2 0 010 4z"/></svg>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </Link>
                      <div className="flex flex-col flex-1 min-w-0 sm:mt-3">
                        <Link href={`/product/${sp.id}`}>
                          <h4 className="text-[11px] sm:text-sm font-semibold text-slate-800 dark:text-white line-clamp-2 sm:line-clamp-1">{sp.name}</h4>
                        </Link>
                        <p className="hidden sm:block text-xs text-slate-500 mt-1">{sp.specs?.procesor || ""}</p>
                        <div className="flex-1 min-h-1" />
                        <div className="flex items-center justify-between mt-1 sm:mt-3">
                          <div>
                            <p className="text-xs sm:text-base font-extrabold text-primary-dark dark:text-primary">{formatPrice(sp.price)}</p>
                            {sp.oldPrice && <p className="text-[10px] sm:text-xs text-slate-400 line-through">{formatPrice(sp.oldPrice)}</p>}
                          </div>
                          <button
                            onClick={() => addToCart(sp)}
                            className="p-1.5 sm:p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                            title={t('product.addToCart')}
                          >
                            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Similar Products — Horizontal cards on mobile */}
          {similar.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-5">{locale === 'ru' ? 'Похожие товары' : 'Produse Similare'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {similar.map((sp, i) => {
                  const imgUrl = Array.isArray(sp.images) ? sp.images[0] : ((typeof (sp.images as string | string[]) === 'string') && (sp.images as string).length > 0 ? (sp.images as string).split(',')[0] : null);
                  return (
                    <div key={`sim-${sp.id}-${i}`} className="bg-white dark:bg-[var(--color-dark-elevated)] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-2 sm:p-4 hover:-translate-y-1 hover:shadow-md transition-all flex flex-row sm:flex-col gap-2 sm:gap-0 relative">
                      <Link href={`/product/${sp.id}`} prefetch={false} className="flex-shrink-0 w-[100px] sm:w-full">
                        {(() => {
                          const imgs = Array.isArray(sp.images) ? sp.images : ((typeof (sp.images as string | string[]) === 'string') && (sp.images as string).length > 0 ? (() => { let s = (sp.images as string).trim(); if (s.startsWith('[')) { try { return JSON.parse(s); } catch { return []; } } return s.split(',').map((u: string) => u.trim()).filter((u: string) => u.startsWith('http') || u.startsWith('/')); })() : []);
                          const hasSecond = Array.isArray(imgs) && imgs.length > 1;
                          return (
                            <div className="w-[100px] h-[100px] sm:w-full sm:h-40 overflow-hidden rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-700/50 group/img relative sm:mb-3">
                              {imgUrl ? (
                                <>
                                  <img src={imgUrl} alt={sp.name} className="w-full h-full object-cover transition-opacity duration-300 group-hover/img:opacity-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                  {hasSecond && (
                                    <img src={imgs[1]} alt={`${sp.name} 2`} className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover/img:opacity-100" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                  )}
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                                  <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M20 5H4V19L13.292 9.706a1 1 0 011.414 0L20 15.01V5zM2 3.993A1 1 0 012.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 01-.992.993H2.992A.993.993 0 012 20.007V3.993zM8 11a2 2 0 110-4 2 2 0 010 4z"/></svg>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </Link>
                      <div className="flex flex-col flex-1 min-w-0">
                        <Link href={`/product/${sp.id}`} prefetch={false}><h4 className="text-[11px] sm:text-sm font-semibold text-slate-800 dark:text-white line-clamp-2 sm:line-clamp-1">{sp.name}</h4></Link>
                        <p className="hidden sm:block text-xs text-slate-500 mt-1">{sp.specs?.procesor || ""}</p>
                        <div className="flex-1 min-h-1" />
                        <div className="flex items-center justify-between mt-1 sm:mt-2">
                          <p className="text-xs sm:text-base font-extrabold text-primary-dark dark:text-primary">{formatPrice(sp.price)}</p>
                          <div className="flex gap-1">
                            <button onClick={() => addToCart(sp)} className="p-1.5 sm:p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors" title="Adaugă în coș"><ShoppingCart className="w-3.5 h-3.5" /></button>
                            <button onClick={() => isInWishlist(sp.id) ? removeWishlist(sp.id) : toggleWishlist(sp)} className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isInWishlist(sp.id) ? 'text-accent' : 'text-slate-400 hover:text-accent'}`} title="Favorite"><Heart className={`w-3.5 h-3.5 ${isInWishlist(sp.id) ? 'fill-accent' : ''}`} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
