// src/components/home/BrandCarousel.tsx
'use client';

import { brands } from '@/lib/data';

export default function BrandCarousel() {
  const doubled = [...brands, ...brands];

  return (
    <section className="py-8 border-y border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-5 mb-5">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white text-center">Branduri de Încredere</h2>
      </div>
      <div className="animate-scroll-left flex">
        <div className="flex shrink-0">
          {doubled.map((brand, i) => (
            <div
              key={`${brand.id}-${i}`}
              className="flex items-center justify-center min-w-[160px] px-6 py-4"
            >
              <span className="text-lg font-bold text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer whitespace-nowrap">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
