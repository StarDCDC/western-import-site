// src/components/home/ProductGrid.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';
import { getProducts, formatPrice, getDiscount } from '@/lib/api';
import { useCartStore, useWishlistStore } from '@/lib/store';
import type { Product } from '@/lib/api';

function ProductCard({ product, index }: { product: Product; index: number }) {
  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.addItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const removeWishlist = useWishlistStore((s) => s.removeItem);
  const discount = product.oldPrice ? getDiscount(product.oldPrice, product.price) : null;

  const badgeText = product.condition === 'nou'
    ? 'Nou'
    : discount
    ? `REDUCERE -${discount}%`
    : 'Refurb';

  const badgeClass = product.condition === 'nou'
    ? 'bg-success'
    : discount
    ? 'bg-accent'
    : 'bg-info';

  const isPhone = product.category === 'telefoane';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-md hover:border-transparent dark:hover:border-transparent transition-all relative overflow-hidden"
    >
      <span className={`absolute top-3.5 left-3.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white ${badgeClass}`}>
        {badgeText}
      </span>

      <Link href={`/product/${product.id}`}>
        <div className="flex items-center justify-center h-40 mb-3.5 p-2">
          <svg
            viewBox={isPhone ? '0 0 120 160' : '0 0 200 130'}
            fill="none"
            className="max-h-32 w-auto group-hover:scale-105 transition-transform"
          >
            {isPhone ? (
              <>
                <rect x="25" y="8" width="70" height="130" rx="12" fill="#e2e8f0" className="dark:fill-slate-600" />
                <rect x="30" y="20" width="60" height="98" rx="3" fill="#1a56db" opacity=".08" />
                <circle cx="60" cy="128" r="4" fill="#cbd5e1" />
                <rect x="42" y="40" width="36" height="22" rx="8" fill="#1a56db" opacity=".12" />
                <circle cx="60" cy="75" r="8" fill="#1a56db" opacity=".15" />
                <rect x="44" y="92" width="32" height="4" rx="2" fill="#1a56db" opacity=".08" />
              </>
            ) : (
              <>
                <rect x="15" y="10" width="170" height="95" rx="6" fill="#e2e8f0" className="dark:fill-slate-600" />
                <rect x="25" y="18" width="150" height="78" rx="2" fill="#1a56db" opacity=".08" />
                <rect x="60" y="105" width="80" height="5" rx="2" fill="#cbd5e1" />
                <rect x="50" y="110" width="100" height="3" rx="1" fill="#e2e8f0" className="dark:fill-slate-600" />
                <circle cx="100" cy="13" r="1.5" fill="#94a3b8" />
              </>
            )}
          </svg>
        </div>
      </Link>

      <Link href={`/product/${product.id}`}>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white leading-snug mb-1 line-clamp-2">{product.name}</h3>
      </Link>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed line-clamp-2">
        {product.specs.procesor}, {product.specs.ram}, {product.specs.stocare}{product.specs.gpu ? `, ${product.specs.gpu}` : ''}, {product.specs.display}
      </p>

      <div className="flex items-baseline gap-2 mb-3.5">
        <span className="text-lg font-extrabold text-primary-dark dark:text-primary">{formatPrice(product.price)}</span>
        {product.oldPrice && (
          <span className="text-xs text-slate-400 line-through">{formatPrice(product.oldPrice)}</span>
        )}
        {discount && (
          <span className="text-[11px] text-accent font-bold bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
            -{discount}%
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => addToCart(product)}
          className="flex-1 bg-primary text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5"
        >
          <ShoppingCart className="w-3.5 h-3.5" /> Adaugă
        </button>
        <button
          onClick={() => {
            if (isInWishlist(product.id)) removeWishlist(product.id);
            else toggleWishlist(product);
          }}
          className={`p-2.5 rounded-xl border transition-colors ${
            isInWishlist(product.id)
              ? 'border-accent text-accent'
              : 'border-slate-200 dark:border-slate-600 text-slate-400 hover:text-accent hover:border-accent'
          }`}
        >
          <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-accent' : ''}`} />
        </button>
      </div>
    </motion.div>
  );
}

export default function ProductGrid() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getProducts({ sort: 'popular', limit: 12 });
        setProductList(result.products);
      } catch {
        // Fallback is handled inside getProducts
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
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-5">Recomandate</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 animate-pulse">
                <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
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
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Recomandate</h2>
          <Link href="/catalog" className="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
            Vezi toate <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {productList.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
