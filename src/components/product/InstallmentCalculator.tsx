// src/components/product/InstallmentCalculator.tsx
// Calculator rate IutePay — 4/0% 6/6% 8/8% 10/10% 12/12% 24/24% 36/36%
'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { formatPrice } from '@/lib/api';

interface InstallmentPlan {
  months: number;
  interestPercent: number;
  label: string;
}

const PLANS: InstallmentPlan[] = [
  { months: 4,  interestPercent: 0,  label: 'Smart' },
  { months: 6,  interestPercent: 6,  label: 'Flex 6' },
  { months: 8,  interestPercent: 8,  label: 'Flex 8' },
  { months: 10, interestPercent: 10, label: 'Flex 10' },
  { months: 12, interestPercent: 12, label: 'Flex 12' },
  { months: 24, interestPercent: 24, label: 'Standard 24' },
  { months: 36, interestPercent: 36, label: 'Long 36' },
];

interface InstallmentCalculatorProps {
  price: number;
  minPrice?: number;
}

export default function InstallmentCalculator({ price, minPrice = 1000 }: InstallmentCalculatorProps) {
  const { locale } = useLanguage();
  const [selected, setSelected] = useState(0);
  const isRu = locale === 'ru';

  if (price < minPrice) return null;

  const calculations = useMemo(() => {
    return PLANS.map((plan) => {
      const totalInterest = price * (plan.interestPercent / 100);
      const total = price + totalInterest;
      const monthly = Math.ceil(total / plan.months);
      const finalTotal = monthly * plan.months; // adjust for rounding
      const overpayment = finalTotal - price;

      return {
        ...plan,
        totalInterest,
        monthly,
        finalTotal,
        overpayment,
      };
    });
  }, [price]);

  const active = calculations[selected];

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
          {isRu ? 'Рассрочка с IutePay' : 'Cumpără în rate cu IutePay'}
        </h3>
      </div>

      {/* Plan selector tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {calculations.map((plan, i) => (
          <button
            key={plan.months}
            onClick={() => setSelected(i)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
              ${selected === i
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-orange-300 hover:text-orange-600'
              }
            `}
          >
            {plan.months}/{plan.interestPercent}%
          </button>
        ))}
      </div>

      {/* Selected plan details */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 border border-orange-100 dark:border-orange-800/30">
        {/* Monthly payment - big number */}
        <div className="text-center mb-3 pb-3 border-b border-orange-100 dark:border-orange-800/30">
          <p className="text-xs text-orange-600/70 font-medium mb-1">
            {isRu ? 'Ежемесячный платёж' : 'Plata lunară'}
          </p>
          <p className="text-3xl font-extrabold text-orange-600">
            {formatPrice(active.monthly)}
            <span className="text-sm font-medium text-orange-400 ml-1">/ {isRu ? 'мес.' : 'lună'}</span>
          </p>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-orange-600/60 text-xs">{isRu ? 'Срок' : 'Perioada'}</p>
            <p className="font-bold text-slate-800 dark:text-white">{active.months} {isRu ? 'месяцев' : 'luni'}</p>
          </div>
          <div>
            <p className="text-orange-600/60 text-xs">{isRu ? 'Ставка' : 'Dobânda'}</p>
            <p className="font-bold text-slate-800 dark:text-white">{active.interestPercent}%</p>
          </div>
          <div>
            <p className="text-orange-600/60 text-xs">{isRu ? 'Переплата' : 'Supraplată'}</p>
            <p className="font-bold text-slate-800 dark:text-white">{formatPrice(active.overpayment)}</p>
          </div>
          <div>
            <p className="text-orange-600/60 text-xs">{isRu ? 'Итого' : 'Total final'}</p>
            <p className="font-bold text-slate-800 dark:text-white">{formatPrice(active.finalTotal)}</p>
          </div>
        </div>

        {/* Zero interest badge */}
        {active.interestPercent === 0 && (
          <div className="mt-3 text-center">
            <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full">
              ✓ 0% {isRu ? '— без переплаты!' : '— fără supraplată!'}
            </span>
          </div>
        )}

        {/* Payment schedule preview */}
        <div className="mt-3 pt-3 border-t border-orange-100 dark:border-orange-800/30">
          <p className="text-xs text-orange-600/60 mb-2">
            {isRu ? 'График платежей' : 'Grafic de plată'} ({active.months} {isRu ? 'мес.' : 'luni'}):
          </p>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: active.months }, (_, i) => (
              <span
                key={i}
                className="inline-flex items-center justify-center bg-white dark:bg-slate-700 rounded-md px-2 py-1 text-[10px] font-medium text-slate-600 dark:text-slate-300 border border-orange-100 dark:border-slate-600"
              >
                {formatPrice(active.monthly)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* IutePay widget — SDK promo messaging */}
      <div className="mt-2">
        <IuteCreditWidgetInline price={price} productId={String(price)} />
      </div>
    </div>
  );
}

/**
 * Minimal inline wrapper — loads IutePay SDK promo for this price
 */
function IuteCreditWidgetInline({ price, productId }: { price: number; productId: string }) {
  return (
    <div
      className="iute-as-low-as"
      data-amount={String(price)}
      data-page-type="product"
      data-sku={productId}
      data-learnmore-show="true"
    />
  )
}
