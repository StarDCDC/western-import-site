// src/components/home/BrandCarousel.tsx
'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/ui/LanguageProvider';

const BRANDS = [
  { name: 'DELL', slug: 'dell' },
  { name: 'Lenovo', slug: 'lenovo' },
  { name: 'HP', slug: 'hp' },
  { name: 'Apple', slug: 'apple' },
  { name: 'ASUS', slug: 'asus' },
  { name: 'Acer', slug: 'acer' },
  { name: 'Samsung', slug: 'samsung' },
  { name: 'MSI', slug: 'msi' },
  { name: 'Microsoft', slug: 'microsoft' },
  { name: 'Google', slug: 'google' },
  { name: 'Amazon', slug: 'amazon' },
  { name: 'Motorola', slug: 'motorola' },
];

export default function BrandCarousel() {
  const { locale } = useLanguage();
  const doubled = [...BRANDS, ...BRANDS];

  return (
    <section className="py-8 border-y border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[var(--color-dark-surface)] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-5 mb-5">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white text-center">
          {locale === 'ru' ? 'Бренды, которым доверяют' : 'Branduri de Încredere'}
        </h2>
      </div>
      <div className="animate-scroll-left flex hover:[animation-play-state:paused]">
        <div className="flex shrink-0">
          {doubled.map((brand, i) => (
            <Link
              key={`${brand.slug}-${i}`}
              href={`/catalog?brand=${brand.slug}`}
              title={brand.name}
              aria-label={brand.name}
              className="flex items-center justify-center min-w-[120px] sm:min-w-[180px] px-3 sm:px-6 py-3 sm:py-5"
            >
              <div
                className="flex items-center justify-center h-16 w-28 sm:h-20 sm:w-40 rounded-lg sm:rounded-xl bg-white shadow-sm border border-slate-100 px-3 sm:px-5 transition-all hover:scale-105 hover:shadow-md"
              >
                <img
                  src={`/brands/${brand.slug}.svg`}
                  alt={brand.name}
                  className="max-h-10 sm:max-h-12 max-w-full w-auto object-contain scale-110 sm:scale-100"
                  loading="lazy"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
