// src/components/home/CategorySlider.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Laptop, Smartphone, Monitor, Tablet } from 'lucide-react';
import { getCategories, type ApiCategory } from '@/lib/api';
import { useLanguage } from '@/components/ui/LanguageProvider';

const iconMap: Record<string, React.ReactNode> = {
  laptop: <Laptop className="w-7 h-7 text-primary" />,
  laptopuri: <Laptop className="w-7 h-7 text-primary" />,
  smartphone: <Smartphone className="w-7 h-7 text-primary" />,
  telefoane: <Smartphone className="w-7 h-7 text-primary" />,
  monitor: <Monitor className="w-7 h-7 text-primary" />,
  'pc-monitoare': <Monitor className="w-7 h-7 text-primary" />,
  'mini-pc': <Monitor className="w-7 h-7 text-primary" />,
  tablet: <Tablet className="w-7 h-7 text-primary" />,
  tablete: <Tablet className="w-7 h-7 text-primary" />,
};

const defaultIcon = <Laptop className="w-7 h-7 text-primary" />;

interface CategorySliderProps {
  initialCategories?: ApiCategory[];
}

export default function CategorySlider({ initialCategories }: CategorySliderProps) {
  const { locale, t } = useLanguage();
  const [categories, setCategories] = useState<ApiCategory[]>(initialCategories ?? []);

  // Fallback: fetch client-side only if server didn't provide data.
  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) return;
    async function load() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch { /* silently fail */ }
    }
    load();
  }, [initialCategories]);

  if (categories.length === 0) return null;

  return (
    <section className="py-3 pb-8">
      <div className="max-w-[1280px] mx-auto px-5">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-5">
          {locale === 'ru' ? 'Популярные категории' : 'Categorii Populare'}
        </h2>
        <div
          className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory lg:flex-wrap lg:justify-center lg:overflow-x-visible"
          style={{ scrollPaddingLeft: '1rem' }}
        >
          {categories.map((cat) => {
            const name = locale === 'ru' && cat.nameRu ? cat.nameRu : cat.nameRo;
            const icon = iconMap[cat.slug] || iconMap[cat.icon ?? ''] || defaultIcon;

            return (
              <div
                key={cat.id}
                className="snap-start flex-shrink-0 lg:flex-shrink"
              >
                <Link
                  href={`/catalog?category=${cat.slug}`}
                  className="flex flex-col items-center gap-3 w-[170px] bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:-translate-y-1 hover:shadow-md hover:border-primary dark:hover:border-primary transition-all"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
                    {icon}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-white text-center leading-snug">
                    {name}
                  </h4>
                  <span className="text-xs text-primary font-semibold">
                    {cat.count} {locale === 'ru' ? (cat.count === 1 ? 'товар' : cat.count < 5 ? 'товара' : 'товаров') : (cat.count === 1 ? 'produs' : cat.count < 5 || cat.count === 0 ? 'produse' : 'produse')} →
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
