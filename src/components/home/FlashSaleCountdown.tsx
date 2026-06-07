'use client';

import { useState, useEffect, useCallback } from 'react';
import { Zap, Clock } from 'lucide-react';
import Link from 'next/link';

interface FlashSaleItem {
  id: string;
  productId: string;
  discountPercent: number;
  endsAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    oldPrice: number | null;
    images: string;
    stock: number;
  };
}

function CountdownTimer({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const calculateTime = useCallback(() => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [endsAt]);

  useEffect(() => {
    setTimeLeft(calculateTime());
    const timer = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(timer);
  }, [calculateTime]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5">
      <span className="bg-red-600 text-white px-2 py-1 rounded-md font-mono text-sm font-bold min-w-[36px] text-center">{pad(timeLeft.hours)}</span>
      <span className="text-red-500 font-bold">:</span>
      <span className="bg-red-600 text-white px-2 py-1 rounded-md font-mono text-sm font-bold min-w-[36px] text-center">{pad(timeLeft.minutes)}</span>
      <span className="text-red-500 font-bold">:</span>
      <span className="bg-red-600 text-white px-2 py-1 rounded-md font-mono text-sm font-bold min-w-[36px] text-center">{pad(timeLeft.seconds)}</span>
    </div>
  );
}

export default function FlashSaleCountdown() {
  const [sales, setSales] = useState<FlashSaleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = useCallback(async () => {
    try {
      const res = await fetch('/api/flash-sales');
      if (res.ok) {
        const data = await res.json();
        setSales(data);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSales();
    const interval = setInterval(fetchSales, 60000);
    return () => clearInterval(interval);
  }, [fetchSales]);

  if (loading) {
    return (
      <section className="py-10">
        <div className="max-w-[1280px] mx-auto px-5">
          <div className="animate-pulse h-40 bg-slate-200 dark:bg-[var(--color-dark-elevated)] rounded-2xl" />
        </div>
      </section>
    );
  }

  if (sales.length === 0) return null;

  const getImage = (images: string) => {
    try {
      const arr = JSON.parse(images);
      return arr[0] || '/placeholder.png';
    } catch { return '/placeholder.png'; }
  };

  return (
    <section className="py-10">
      <div className="max-w-[1280px] mx-auto px-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Flash Sale 🔥</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Oferte cu timp limitat!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-500" />
            <span className="text-sm text-slate-600 dark:text-slate-300">Se încheie în:</span>
            <CountdownTimer endsAt={sales[0].endsAt} />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sales.map((sale) => {
            const discountedPrice = sale.product.price * (1 - sale.discountPercent / 100);
            return (
              <Link
                key={sale.id}
                href={`/product/${sale.product.id}`}
                className="group relative bg-white dark:bg-[var(--color-dark-elevated)] rounded-2xl border border-slate-200 dark:border-white/[0.06] overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Badge */}
                <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                  <Zap className="w-3 h-3" />
                  FLASH SALE -{sale.discountPercent}%
                </div>

                {/* Image */}
                <div className="aspect-square overflow-hidden bg-slate-100 dark:bg-slate-700">
                  <img
                    src={getImage(sale.product.images)}
                    alt={sale.product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-white line-clamp-2 mb-2">{sale.product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">{discountedPrice.toFixed(0)} MDL</span>
                    <span className="text-sm text-slate-400 line-through">{sale.product.price.toFixed(0)} MDL</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
