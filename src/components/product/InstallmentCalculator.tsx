// src/components/product/InstallmentCalculator.tsx
// Shows REAL IutePay plans fetched from API, with fallback to Smart 0%
'use client';

import { useState, useEffect, useMemo } from 'react';
import { formatPrice } from '@/lib/api';

interface RealPlan {
  productId: string;
  productName: string;
  months: number;
  monthly: number;
  total: number;
  isZeroPercent: boolean;
}

interface Props {
  price: number;
  minPrice?: number;
}

export default function InstallmentCalculator({ price, minPrice = 1000 }: Props) {
  const [plans, setPlans] = useState<RealPlan[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (price < minPrice) return;
    // Fetch real plans from IutePay API
    fetch('/api/iute/plans?amount=' + price)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.plans?.length > 0) {
          setPlans(data.plans);
        } else {
          // Fallback: Smart 0% / 4 luni
          setPlans([{
            productId: '',
            productName: 'Smart 0% (4 luni)',
            months: 4,
            monthly: Math.ceil(price / 4),
            total: price,
            isZeroPercent: true,
          }]);
        }
      })
      .catch(() => {
        setPlans([{
          productId: '',
          productName: 'Smart 0% (4 luni)',
          months: 4,
          monthly: Math.ceil(price / 4),
          total: price,
          isZeroPercent: true,
        }]);
      })
      .finally(() => setLoading(false));
  }, [price, minPrice]);

  if (price < minPrice) return null;
  if (loading) return <div className="mb-6 h-32 animate-pulse bg-slate-100 dark:bg-[var(--color-dark-elevated)] rounded-2xl" />;

  const active = plans[selected];
  if (!active) return null;

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 dark:border-white/[0.06] overflow-hidden bg-white dark:bg-[var(--color-dark-elevated)]">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        <span className="text-sm font-bold text-white tracking-wide">
          Cumpără în rate cu IutePay
        </span>
      </div>

      {/* Plan tabs — only show if multiple plans */}
      {plans.length > 1 && (
        <div className="flex overflow-x-auto gap-1.5 px-3 pt-3 pb-2 scrollbar-none">
          {plans.map((p, i) => (
            <button
              key={p.productId || i}
              onClick={() => setSelected(i)}
              className={`
                shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all
                ${selected === i
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-orange-900/40'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }
              `}
            >
              <span className="block text-sm">{p.months}</span>
              <span className={`block text-[10px] font-semibold ${selected === i ? 'text-orange-100' : 'text-slate-400'}`}>
                {p.isZeroPercent ? '0%' : `${Math.round((p.total / price - 1) * 100)}%`}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main display */}
      <div className="px-4 pb-4">
        {/* Monthly payment */}
        <div className="text-center py-4">
          <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-1">
            Plata lunară
          </p>
          <p className="text-4xl font-black text-slate-900 dark:text-white">
            {formatPrice(active.monthly)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            × {active.months} luni
          </p>
          <p className="text-[10px] text-orange-500 font-medium mt-1">{active.productName}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p className="text-[10px] text-slate-400 mb-0.5">Perioada</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{active.months} luni</p>
          </div>
          <div className="text-center p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p className="text-[10px] text-slate-400 mb-0.5">Supraplată</p>
            <p className={`text-sm font-bold ${active.isZeroPercent ? 'text-green-600' : 'text-slate-800 dark:text-white'}`}>
              {active.isZeroPercent ? '0' : formatPrice(active.total - price)}
            </p>
          </div>
          <div className="text-center p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p className="text-[10px] text-slate-400 mb-0.5">Total</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{formatPrice(active.total)}</p>
          </div>
        </div>

        {/* 0% badge */}
        {active.isZeroPercent && (
          <div className="flex items-center justify-center gap-1.5 py-2 px-3 mb-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span className="text-xs font-bold text-green-700 dark:text-green-400">
              0% — fără supraplată!
            </span>
          </div>
        )}

        {/* Payment schedule */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06]">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Grafic de plată</p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: active.months }, (_, i) => (
              <span
                key={i}
                className="inline-flex items-center justify-center min-w-[52px] px-2 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-[10px] font-semibold text-orange-700 dark:text-orange-300"
              >
                {formatPrice(active.monthly)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
