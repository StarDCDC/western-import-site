// src/components/home/ProductGrid.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import Link from 'next/link';
import { getProducts, formatPrice, getDiscount } from '@/lib/api';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { useLanguage } from '@/components/ui/LanguageProvider';

import type { Product } from '@/lib/api';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3 h-3 ${star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
        />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { t } = useLanguage();
  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.addItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const removeWishlist = useWishlistStore((s) => s.removeItem);

  const discount = product.oldPrice ? getDiscount(product.oldPrice, product.price) : null;

  const badgeText = product.condition === 'nou'
    ? t('product.nou')
    : discount
    ? `-${discount}%`
    : t('product.refurbished');

  const badgeClass = product.condition === 'nou'
    ? 'bg-emerald-500'
    : discount
    ? 'bg-amber-500'
    : 'bg-blue-500';

  const getImages = (): string[] => {
    const raw = product.images;
    if (Array.isArray(raw)) return raw as string[];
    if (typeof raw === 'string' && raw.length > 0) {
      let s = raw.trim();
      if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
      if (s.startsWith('[')) { try { return JSON.parse(s); } catch { return []; } }
      return s.split(',').map(x => x.trim()).filter(Boolean);
    }
    return [];
  };
  const images = getImages();
  const imageUrl = images[0] || undefined;
  const image2Url = images[1] || undefined;

  return (
    <div
      /* Mobile: horizontal card (image left, text right). No entrance animation —
         content must be visible from the SSR HTML before JS hydrates (perceived speed). */
      className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 sm:p-4 hover:-translate-y-1 hover:shadow-lg hover:border-transparent dark:hover:border-transparent transition-all relative overflow-hidden
        flex flex-row sm:flex-col gap-2 sm:gap-0"
    >
      {/* Badge — hidden on mobile to save space */}
      <span className={`hidden sm:block absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white ${badgeClass}`}>
        {badgeText}
      </span>
      {/* Mobile badge — smaller, inline */}
      <span className={`sm:hidden absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded text-[9px] font-bold text-white ${badgeClass}`}>
        {badgeText}
      </span>

      {/* Wishlist — hidden on mobile inline */}
      <button
        onClick={(e) => {
          e.preventDefault();
          if (isInWishlist(product.id)) removeWishlist(product.id);
          else toggleWishlist(product);
        }}
        className={`hidden sm:block absolute top-3 right-3 z-10 p-1.5 rounded-lg transition-colors ${
          isInWishlist(product.id)
            ? 'bg-red-50 dark:bg-red-900/30 text-red-500'
            : 'bg-white/80 dark:bg-slate-700/80 text-slate-400 hover:text-red-500'
        }`}
      >
        <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-500' : ''}`} />
      </button>

      {/* Image */}
      <Link href={`/product/${product.id}`} className="flex-shrink-0 w-[110px] sm:w-full">
        {/* Mobile: fixed width square, Desktop: full width aspect ratio */}
        <div className="relative w-[110px] h-[110px] sm:w-full sm:aspect-[4/3] sm:h-auto overflow-hidden rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-700/50">
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              {image2Url && (
                <img
                  src={image2Url}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-600">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M20 5H4V19L13.292 9.706a1 1 0 011.414 0L20 15.01V5zM2 3.993A1 1 0 012.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 01-.992.993H2.992A.993.993 0 012 20.007V3.993zM8 11a2 2 0 110-4 2 2 0 010 4z"/></svg>
            </div>
          )}
        </div>
      </Link>

      {/* Content — right side on mobile, below on desktop */}
      <div className="flex flex-col flex-1 min-w-0 sm:mt-3">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-[11px] sm:text-sm font-semibold text-slate-800 dark:text-white leading-snug mb-0.5 sm:mb-1 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="hidden sm:block text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-1 sm:mb-2 leading-relaxed line-clamp-2">
          {product.specs?.procesor}, {product.specs?.ram}, {product.specs?.stocare}
          {product.specs?.gpu ? `, ${product.specs.gpu}` : ''}
          {product.specs?.display ? `, ${product.specs.display}` : ''}
        </p>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="hidden sm:block mb-1">
            <StarRating rating={product.rating} />
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1 min-h-1" />

        {/* Price */}
        <div className="flex items-baseline gap-1 sm:gap-2 mb-1.5 sm:mb-3">
          <span className="text-xs sm:text-lg font-extrabold text-primary-dark dark:text-blue-400">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-[10px] sm:text-xs text-slate-400 line-through">{formatPrice(product.oldPrice)}</span>
          )}
          {discount && (
            <span className="text-[9px] sm:text-[11px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-900/20 px-1 py-0.5 rounded">
              -{discount}%
            </span>
          )}
        </div>

        {/* Actions — below content */}

        <div className="flex gap-1.5 sm:gap-2">
          <button
            onClick={() => addToCart(product)}
            className="flex-1 bg-primary hover:bg-primary-dark text-white py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold transition-colors flex items-center justify-center gap-1"
          >
            <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {t('product.addToCart')}
          </button>
          <button
            onClick={() => {
              if (isInWishlist(product.id)) removeWishlist(product.id);
              else toggleWishlist(product);
            }}
            className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border transition-colors ${
              isInWishlist(product.id)
                ? 'border-red-300 text-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-slate-200 dark:border-slate-600 text-slate-400 hover:text-red-500 hover:border-red-300'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isInWishlist(product.id) ? 'fill-red-500' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ initialProducts }: { initialProducts?: Product[] }) {
  const { t } = useLanguage();
  const [productList, setProductList] = useState<Product[]>(initialProducts ?? []);
  // When the server already provided products (SSR), skip the initial client fetch.
  const [loading, setLoading] = useState(!initialProducts);
  const hasInitial = useRef(Boolean(initialProducts && initialProducts.length > 0));

  useEffect(() => {
    if (hasInitial.current) return;
    async function load() {
      try {
        const result = await getProducts({ sort: 'newest', limit: 6 });
        setProductList(result.products.slice(0, 6));
      } catch {
        // fallback to empty
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <section className="py-5 pb-10">
        <div className="max-w-[1280px] mx-auto px-5">
          <div className="flex justify-between items-center mb-5">
            <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 sm:p-4 animate-pulse flex flex-row sm:flex-col gap-2 sm:gap-0">
                <div className="w-[110px] h-[110px] sm:w-full sm:h-36 bg-slate-200 dark:bg-slate-700 rounded-lg sm:rounded-xl sm:mb-3" />
                <div className="flex-1">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-1.5 w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-1.5 w-1/2" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5 pb-10">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
            {t('home.products.title')}
          </h2>
          <Link
            href="/catalog"
            className="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            {t('home.products.seeAll')} <span>→</span>
          </Link>
        </div>

        {/* Mobile: single column (horizontal cards), Desktop: 3 columns (vertical cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {productList.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
