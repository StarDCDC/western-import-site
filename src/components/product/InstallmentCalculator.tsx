// src/components/product/InstallmentCalculator.tsx
// Calculator rate IutePay — 4/0% 6/6% 8/8% 10/10% 12/12% 24/24% 36/36%
'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { formatPrice } from '@/lib/api';

interface InstallmentPlan {
  months: number;
  interestPercent: number;
}

const PLANS: InstallmentPlan[] = [
  { months: 4,  interestPercent: 0  },
  { months: 6,  interestPercent: 6  },
  { months: 8,  interestPercent: 8  },
  { months: 10, interestPercent: 10 },
  { months: 12, interestPercent: 12 },
  { months: 24, interestPercent: 24 },
  { months: 36, interestPercent: 36 },
];

interface Props {
  price: number;
  minPrice?: number;
}

export default function InstallmentCalculator({ price, minPrice = 1000 }: Props) {
  const { locale } = useLanguage();
  const [selected, setSelected] = useState(0);
  const ru = locale === 'ru';

  if (price < minPrice) return null;

  const calcs = useMemo(() => PLANS.map(p => {
    const total = price * (1 + p.interestPercent / 100);
    const monthly = Math.ceil(total / p.months);
    const finalTotal = monthly * p.months;
    return { ...p, monthly, finalTotal, over: finalTotal - price };
  }), [price]);

  const a = calcs[selected];

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        <span className="text-sm font-bold text-white tracking-wide">
          {ru ? 'Рассрочка с IutePay' : 'Cumpără în rate cu IutePay'}
        </span>
      </div>

      {/* Plan tabs */}
      <div className="flex overflow-x-auto gap-1 px-3 pt-3 pb-2 scrollbar-none">
        {calcs.map((c, i) => (
          <button
            key={c.months}
            onClick={() => setSelected(i)}
            className={`
              shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all
              ${selected === i
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-orange-900/40'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
              }
            `}
          >
            <span className="block text-sm">{c.months}</span>
            <span className={`block text-[10px] font-semibold ${selected === i ? 'text-orange-100' : 'text-slate-400'}`}>
              {c.interestPercent}%
            </span>
          </button>
        ))}
      </div>

      {/* Main display */}
      <div className="px-4 pb-4">
        {/* Monthly payment */}
        <div className="text-center py-4">
          <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-1">
            {ru ? 'Ежемесячный платёж' : 'Plata lunară'}
          </p>
          <p className="text-4xl font-black text-slate-900 dark:text-white">
            {formatPrice(a.monthly)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            × {a.months} {ru ? 'месяцев' : 'luni'}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p className="text-[10px] text-slate-400 mb-0.5">{ru ? 'Ставка' : 'Dobânda'}</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{a.interestPercent}%</p>
          </div>
          <div className="text-center p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p className="text-[10px] text-slate-400 mb-0.5">{ru ? 'Переплата' : 'Supraplată'}</p>
            <p className={`text-sm font-bold ${a.over === 0 ? 'text-green-600' : 'text-slate-800 dark:text-white'}`}>
              {a.over === 0 ? '0' : formatPrice(a.over)}
            </p>
          </div>
          <div className="text-center p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p className="text-[10px] text-slate-400 mb-0.5">{ru ? 'Итого' : 'Total'}</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{formatPrice(a.finalTotal)}</p>
          </div>
        </div>

        {/* 0% badge */}
        {a.interestPercent === 0 && (
          <div className="flex items-center justify-center gap-1.5 py-2 px-3 mb-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span className="text-xs font-bold text-green-700 dark:text-green-400">
              {ru ? '0% — без переплаты!' : '0% — fără supraplată!'}
            </span>
          </div>
        )}

        {/* Payment schedule */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">
            {ru ? 'График платежей' : 'Grafic de plată'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: a.months }, (_, i) => (
              <span
                key={i}
                className="inline-flex items-center justify-center min-w-[52px] px-2 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-[10px] font-semibold text-orange-700 dark:text-orange-300"
              >
                {formatPrice(a.monthly)}
              </span>
            ))}
          </div>
        </div>

        {/* IutePay SDK promo widget */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <div
            className="iute-as-low-as"
            data-amount={String(price)}
            data-page-type="product"
            data-sku={String(price)}
            data-learnmore-show="true"
          />
        </div>
      </div>
    </div>
  );
}
