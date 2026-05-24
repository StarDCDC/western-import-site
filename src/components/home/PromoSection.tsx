"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Flame, ArrowRight } from "lucide-react";

interface PromoDeal {
  id: string;
  title: string;
  originalPrice: number;
  salePrice: number;
  image: React.ReactNode;
  href: string;
  endsAt: Date;
}

const PROMO_DEALS: PromoDeal[] = [
  {
    id: "p1",
    title: "Lenovo ThinkPad X1 Carbon Gen 9",
    originalPrice: 12500,
    salePrice: 8990,
    href: "/catalog?category=laptopuri",
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000 + 30 * 60 * 1000),
    image: (
      <svg viewBox="0 0 180 120" fill="none" className="w-full">
        <rect x="15" y="10" width="150" height="85" rx="6" fill="#1a56db" opacity=".1" />
        <rect x="60" y="95" width="60" height="5" rx="2" fill="#cbd5e1" />
        <rect x="50" y="100" width="80" height="3" rx="1" fill="#e2e8f0" />
      </svg>
    ),
  },
  {
    id: "p2",
    title: "Samsung Galaxy S24 Ultra 256GB",
    originalPrice: 14900,
    salePrice: 11490,
    href: "/catalog?category=telefoane",
    endsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000),
    image: (
      <svg viewBox="0 0 120 140" fill="none" className="w-full max-h-[120px] mx-auto">
        <rect x="25" y="8" width="70" height="120" rx="12" fill="#1a56db" opacity=".1" />
        <circle cx="60" cy="122" r="4" fill="#cbd5e1" />
      </svg>
    ),
  },
  {
    id: "p3",
    title: "Monitor LG 27\" 4K IPS USB-C",
    originalPrice: 7500,
    salePrice: 5490,
    href: "/catalog?category=pc-monitoare",
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
    image: (
      <svg viewBox="0 0 180 120" fill="none" className="w-full">
        <rect x="10" y="8" width="160" height="85" rx="4" fill="#1a56db" opacity=".08" />
        <rect x="65" y="93" width="50" height="6" rx="2" fill="#cbd5e1" />
      </svg>
    ),
  },
];

function useCountdown(targetDate: Date) {
  const calcTimeLeft = useCallback(() => {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, [calcTimeLeft]);

  return timeLeft;
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white dark:bg-slate-700 text-primary-dark dark:text-blue-300 text-xl sm:text-2xl font-extrabold w-14 h-14 rounded-xl flex items-center justify-center shadow-sm">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[11px] text-white/70 mt-1">{label}</span>
    </div>
  );
}

export default function PromoSection() {
  const mainDeal = PROMO_DEALS[0];
  const timeLeft = useCountdown(mainDeal.endsAt);
  const discount = Math.round(
    ((mainDeal.originalPrice - mainDeal.salePrice) / mainDeal.originalPrice) * 100
  );

  return (
    <section className="py-10">
      <div className="max-w-[1280px] mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl overflow-hidden bg-gradient-to-r from-primary-dark via-primary to-blue-500 p-8 sm:p-10"
        >
          {/* Section header */}
          <div className="flex items-center gap-2 mb-6">
            <Flame size={20} className="text-accent" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">Promoții cu Timp Limitat</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
            {/* Deal info */}
            <div className="text-white">
              <div className="inline-flex items-center gap-1.5 bg-accent px-3 py-1 rounded-full text-xs font-bold mb-3">
                <Flame size={10} /> REDUCERE {discount}%
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">{mainDeal.title}</h3>
              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-3xl font-extrabold">
                  {mainDeal.salePrice.toLocaleString("ro-MD")} MDL
                </span>
                <span className="text-lg line-through opacity-60">
                  {mainDeal.originalPrice.toLocaleString("ro-MD")} MDL
                </span>
              </div>
              <Link
                href={mainDeal.href}
                className="inline-flex items-center gap-2 bg-white text-primary-dark px-6 py-2.5 rounded-xl font-semibold text-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
              >
                Cumpără acum <ArrowRight size={14} />
              </Link>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-white/60" />
              <span className="text-white/60 text-sm mr-2">Se încheie în:</span>
              <div className="flex gap-2">
                <CountdownBlock value={timeLeft.days} label="Zile" />
                <span className="text-white/40 text-2xl font-bold self-start mt-3">:</span>
                <CountdownBlock value={timeLeft.hours} label="Ore" />
                <span className="text-white/40 text-2xl font-bold self-start mt-3">:</span>
                <CountdownBlock value={timeLeft.minutes} label="Min" />
                <span className="text-white/40 text-2xl font-bold self-start mt-3">:</span>
                <CountdownBlock value={timeLeft.seconds} label="Sec" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
