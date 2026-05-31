// src/components/product/IuteCreditWidget.tsx
'use client';

import { CreditCard, ExternalLink } from 'lucide-react';

interface IuteCreditWidgetProps {
  productId: string;
  price: number;
  productName: string;
  /** Minimum price to show the widget. Default: 1000 MDL */
  minPrice?: number;
}

export default function IuteCreditWidget({ price, minPrice = 1000 }: IuteCreditWidgetProps) {
  // Don't show for cheap products
  if (price < minPrice) return null;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl p-4 mb-2 border border-orange-200 dark:border-orange-800 text-center">
      <a
        href="https://iute.md"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg w-full"
      >
        <CreditCard className="w-5 h-5" />
        <span>Cumpără în rate cu IuteCredit</span>
        <ExternalLink className="w-4 h-4 opacity-70" />
      </a>
      <p className="text-[10px] text-slate-500 mt-2">
        Credit oferit de IuteCredit Moldova. Termeni și condiții aplicabile.
      </p>
    </div>
  );
}
