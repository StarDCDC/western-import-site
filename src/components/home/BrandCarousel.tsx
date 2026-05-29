// src/components/home/BrandCarousel.tsx
'use client';

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
  const doubled = [...BRANDS, ...BRANDS];

  return (
    <section className="py-8 border-y border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-5 mb-5">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white text-center">Branduri de Încredere</h2>
      </div>
      <div className="animate-scroll-left flex">
        <div className="flex shrink-0">
          {doubled.map((brand, i) => (
            <div
              key={`${brand.slug}-${i}`}
              className="flex items-center justify-center min-w-[160px] px-6 py-4"
            >
              <span
                className="text-xl font-extrabold tracking-wider text-slate-400 dark:text-slate-500 transition-all cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 hover:scale-110"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
