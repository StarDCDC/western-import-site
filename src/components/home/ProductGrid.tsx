// src/components/home/ProductGrid.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
        />
      ))}
      {rating > 0 && (
        <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1">({rating.toFixed(1)})</span>
      )}
    </div>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
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

  const hasImages = product.images && product.images.length > 0;
  
  // Parse images - could be JSON string, comma-separated string, or array
  const getImageUrl = (): string | undefined => {
    if (Array.isArray(product.images)) return product.images[0];
    if (typeof product.images === 'string') {
      const s = product.images.trim();
      if (s.startsWith('[')) {
        try {
          const parsed = JSON.parse(s);
          return Array.isArray(parsed) ? parsed[0] : undefined;
        } catch { return undefined; }
      }
      return s.split(',')[0]?.trim();
    }
    return undefined;
  };
  const imageUrl = getImageUrl();
  const isPhone = product.category === 'telefoane';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:-translate-y-1 hover:shadow-lg hover:border-transparent dark:hover:border-transparent transition-all relative overflow-hidden flex flex-col"
    >
      {/* Badge */}
      <span className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white ${badgeClass}`}>
        {badgeText}
      </span>

      {/* Wishlist button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          if (isInWishlist(product.id)) removeWishlist(product.id);
          else toggleWishlist(product);
        }}
        className={`absolute top-3 right-3 z-10 p-1.5 rounded-lg transition-colors ${
          isInWishlist(product.id)
            ? 'bg-red-50 dark:bg-red-900/30 text-red-500'
            : 'bg-white/80 dark:bg-slate-700/80 text-slate-400 hover:text-red-500'
        }`}
      >
        <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-500' : ''}`} />
      </button>

      {/* Image */}
      <Link href={`/product/${product.id}`} className="block">
        <div className="flex items-center justify-center h-36 mb-3 p-2">
          {hasImages ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="max-h-28 w-auto object-contain group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <svg
              viewBox={isPhone ? '0 0 120 160' : '0 0 200 130'}
              fill="none"
              className="max-h-24 w-auto group-hover:scale-105 transition-transform"
            >
              {isPhone ? (
                <>
                  <rect x="25" y="8" width="70" height="130" rx="12" fill="#e2e8f0" className="dark:fill-slate-600" />
                  <rect x="30" y="20" width="60" height="98" rx="3" fill="#1a56db" opacity=".08" />
                  <circle cx="60" cy="128" r="4" fill="#cbd5e1" />
                  <rect x="42" y="40" width="36" height="22" rx="8" fill="#1a56db" opacity=".12" />
                  <circle cx="60" cy="75" r="8" fill="#1a56db" opacity=".15" />
                </>
              ) : (
                <>
                  <rect x="15" y="10" width="170" height="95" rx="6" fill="#e2e8f0" className="dark:fill-slate-600" />
                  <rect x="25" y="18" width="150" height="78" rx="2" fill="#1a56db" opacity=".08" />
                  <rect x="60" y="105" width="80" height="5" rx="2" fill="#cbd5e1" />
                  <rect x="50" y="110" width="100" height="3" rx="1" fill="#e2e8f0" className="dark:fill-slate-600" />
                </>
              )}
            </svg>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white leading-snug mb-1 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed line-clamp-2">
          {product.specs.procesor}, {product.specs.ram}, {product.specs.stocare}
          {product.specs.gpu ? `, ${product.specs.gpu}` : ''}
          {product.specs.display ? `, ${product.specs.display}` : ''}
        </p>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="mb-2">
            <StarRating rating={product.rating} />
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-extrabold text-primary-dark dark:text-blue-400">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-xs text-slate-400 line-through">{formatPrice(product.oldPrice)}</span>
          )}
          {discount && (
            <span className="text-[11px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
              -{discount}%
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => addToCart(product)}
            className="flex-1 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> {t('product.addToCart')}
          </button>
          <button
            onClick={() => {
              if (isInWishlist(product.id)) removeWishlist(product.id);
              else toggleWishlist(product);
            }}
            className={`p-2.5 rounded-xl border transition-colors ${
              isInWishlist(product.id)
                ? 'border-red-300 text-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-slate-200 dark:border-slate-600 text-slate-400 hover:text-red-500 hover:border-red-300'
            }`}
          >
            <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-500' : ''}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductGrid() {
  const { t } = useLanguage();
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 animate-pulse">
                <div className="h-36 bg-slate-200 dark:bg-slate-700 rounded-xl mb-3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-3 w-1/2" />
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {productList.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}