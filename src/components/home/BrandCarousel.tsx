// src/components/home/BrandCarousel.tsx
'use client';

import { useLanguage } from '@/components/ui/LanguageProvider';

const BRANDS = [
  { name: 'DELL', slug: 'dell', url: 'https://www.dell.com' },
  { name: 'Lenovo', slug: 'lenovo', url: 'https://www.lenovo.com' },
  { name: 'HP', slug: 'hp', url: 'https://www.hp.com' },
  { name: 'Apple', slug: 'apple', url: 'https://www.apple.com' },
  { name: 'ASUS', slug: 'asus', url: 'https://www.asus.com' },
  { name: 'Acer', slug: 'acer', url: 'https://www.acer.com' },
  { name: 'Samsung', slug: 'samsung', url: 'https://www.samsung.com' },
  { name: 'MSI', slug: 'msi', url: 'https://www.msi.com' },
  { name: 'Microsoft', slug: 'microsoft', url: 'https://www.microsoft.com' },
  { name: 'Google', slug: 'google', url: 'https://store.google.com' },
  { name: 'Amazon', slug: 'amazon', url: 'https://www.amazon.com' },
  { name: 'Motorola', slug: 'motorola', url: 'https://www.motorola.com' },
];

export default function BrandCarousel() {
  const { locale } = useLanguage();
  const doubled = [...BRANDS, ...BRANDS];

  return (
    <section className="py-8 border-y border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-5 mb-5">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white text-center">
          {locale === 'ru' ? 'Бренды, которым доверяют' : 'Branduri de Încredere'}
        </h2>
      </div>
      <div className="animate-scroll-left flex hover:[animation-play-state:paused]">
        <div className="flex shrink-0">
          {doubled.map((brand, i) => (
            <a
              key={`${brand.slug}-${i}`}
              href={brand.url}
              target="_blank"
              rel="noopener noreferrer"
              title={brand.name}
              aria-label={brand.name}
              className="flex items-center justify-center min-w-[180px] px-6 py-5"
            >
              <div className="flex items-center justify-center h-20 w-40 rounded-xl bg-white shadow-sm border border-slate-100 px-5 transition-all hover:scale-105 hover:shadow-md">
                <img
                  src={`/brands/${brand.slug}.svg`}
                  alt={brand.name}
                  className="max-h-12 max-w-full w-auto object-contain"
                  loading="lazy"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
