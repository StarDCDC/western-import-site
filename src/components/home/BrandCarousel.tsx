// src/components/home/BrandCarousel.tsx
'use client';

const BRANDS = [
  { name: 'DELL', color: '#007DB8', slug: 'dell' },
  { name: 'Lenovo', color: '#E2231A', slug: 'lenovo' },
  { name: 'HP', color: '#0096D6', slug: 'hp' },
  { name: 'Apple', color: '#A2AAAD', slug: 'apple' },
  { name: 'ASUS', color: '#000000', slug: 'asus' },
  { name: 'Acer', color: '#83B81A', slug: 'acer' },
  { name: 'Samsung', color: '#1428A0', slug: 'samsung' },
  { name: 'MSI', color: '#FF0000', slug: 'msi' },
  { name: 'Microsoft', color: '#00A4EF', slug: 'microsoft' },
  { name: 'Google', color: '#4285F4', slug: 'google' },
  { name: 'Amazon', color: '#FF9900', slug: 'amazon' },
  { name: 'Motorola', color: '#5C2D91', slug: 'motorola' },
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
                className="text-xl font-extrabold tracking-wider transition-all cursor-pointer hover:scale-110"
                style={{ color: brand.color, fontFamily: 'system-ui, sans-serif' }}
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
