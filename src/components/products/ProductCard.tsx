"use client";

import { Heart, ShoppingCart } from "lucide-react";

export type ProductBadge = "sale" | "new" | "refurb" | null;

export interface Product {
  id: string;
  title: string;
  specs: string;
  price: number;
  oldPrice?: number;
  badge?: {
    type: "sale" | "new" | "refurb";
    label?: string;
  };
  image: React.ReactNode;
  href: string;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

const BADGE_STYLES = {
  sale: "bg-rose-500",
  new: "bg-emerald-500",
  refurb: "bg-indigo-500",
};

const BADGE_LABELS = {
  sale: (label?: string) => label ?? "-%",
  new: () => "Nou",
  refurb: () => "Refurb",
};

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <div
      className="group card-premium rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
    >
      {/* Badge */}
      {product.badge && (
        <span
          className={`absolute top-3.5 left-3.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold text-white ${
            BADGE_STYLES[product.badge.type]
          }`}
        >
          {product.badge.type === "sale" && discount
            ? `-${discount}%`
            : BADGE_LABELS[product.badge.type](product.badge.label)}
        </span>
      )}

      {/* Image */}
      <div className="flex items-center justify-center h-[160px] mb-3.5 p-2.5">
        <div className="transition-transform duration-300 group-hover:scale-105 [&_svg]:max-h-[120px] [&_svg]:w-auto">
          {product.image}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1 leading-snug">
        {product.title}
      </h3>

      {/* Specs */}
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
        {product.specs}
      </p>

      {/* Price */}
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-lg font-extrabold text-slate-900 dark:text-blue-300">
          {product.price.toLocaleString("ro-MD")} MDL
        </span>
        {product.oldPrice && (
          <>
            <span className="text-[13px] text-slate-400 line-through">
              {product.oldPrice.toLocaleString("ro-MD")} MDL
            </span>
            {discount && (
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded">
                -{discount}%
              </span>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3.5">
        <button className="btn-glow flex-1 flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 active:scale-[0.97] shadow-sm hover:shadow-md">
          <ShoppingCart size={15} /> Adaugă
        </button>
        <button className="p-2.5 rounded-xl border border-slate-100 dark:border-white/[0.08] text-slate-400 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all duration-200">
          <Heart size={15} />
        </button>
      </div>
    </div>
  );
}
