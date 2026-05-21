// src/components/home/CategorySlider.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Laptop, Smartphone, Monitor, Tablet, Cpu, Plug, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCategories, type ApiCategory } from '@/lib/api';

const iconMap: Record<string, React.ReactNode> = {
  laptop: <Laptop className="w-7 h-7 text-primary" />,
  laptopuri: <Laptop className="w-7 h-7 text-primary" />,
  smartphone: <Smartphone className="w-7 h-7 text-primary" />,
  telefoane: <Smartphone className="w-7 h-7 text-primary" />,
  monitor: <Monitor className="w-7 h-7 text-primary" />,
  'pc-monitoare': <Monitor className="w-7 h-7 text-primary" />,
  tablet: <Tablet className="w-7 h-7 text-primary" />,
  tablete: <Tablet className="w-7 h-7 text-primary" />,
  cpu: <Cpu className="w-7 h-7 text-primary" />,
  componente: <Cpu className="w-7 h-7 text-primary" />,
  plug: <Plug className="w-7 h-7 text-primary" />,
  accesorii: <Plug className="w-7 h-7 text-primary" />,
};

const defaultIcon = <Laptop className="w-7 h-7 text-primary" />;

export default function CategorySlider() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch {
        // getCategories has fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <section className="py-3 pb-8">
        <div className="max-w-[1280px] mx-auto px-5">
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[200px] bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mx-auto mb-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-3 pb-8">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/catalog?category=${cat.slug}`}
                className="flex flex-col items-center gap-3 w-[200px] bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:-translate-y-1 hover:shadow-md hover:border-primary dark:hover:border-primary transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
                  {iconMap[cat.icon ?? ''] || iconMap[cat.slug ?? ''] || defaultIcon}
                </div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-white">{cat.nameRo}</h4>
                <span className="text-xs text-primary font-semibold hover:underline">Descoperă acum →</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
