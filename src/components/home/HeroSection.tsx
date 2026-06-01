'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';
import { formatPrice, type Banner } from '@/lib/api';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { useLanguage } from '@/components/ui/LanguageProvider';

interface PromoCard {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  price?: string;
  oldPrice?: string;
  link: string;
  cta: string;
  gradient: string;
}

// Fallback promos when no sidebar banners
const fallbackPromos: PromoCard[] = [
  {
    id: 'fallback-1',
    title: 'Laptopuri Gaming',
    subtitle: 'De la 2990 MDL',
    price: 'de la 2,990 MDL',
    link: '/catalog?category=laptopuri',
    cta: 'Vezi oferta',
    gradient: 'from-[#1a56db] to-[#0c3a8f]',
  },
  {
    id: 'fallback-2',
    title: 'iPhone Recondiționat',
    subtitle: 'Verificat și garanție 12 luni',
    price: 'de la 8,990 MDL',
    link: '/catalog?category=telefoane',
    cta: 'Descoperă',
    gradient: 'from-amber-500 to-orange-600',
  },
];

interface HeroSectionProps {
  initialBanners?: Banner[];
}

export default function HeroSection({ initialBanners }: HeroSectionProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [banners, setBanners] = useState<Banner[]>(initialBanners ?? []);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Compute sidebar banners from data
  const sidebarBanners: PromoCard[] = (banners)
    .filter((b) => b.position === 'SIDEBAR' || b.position === 'MIDDLE')
    .slice(0, 2)
    .map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle || '',
      image: b.image,
      link: b.link || '/catalog',
      cta: b.buttonText || 'Vezi detalii',
      gradient: b.gradient || 'from-[#1a56db] to-[#0c3a8f]',
    }));

  // Auto-slide
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Use sidebar banners from DB, fallback if fewer than 2
  const displayPromos: PromoCard[] = sidebarBanners.length >= 2
    ? sidebarBanners
    : sidebarBanners.length === 1
      ? [sidebarBanners[0], fallbackPromos.find(f => f.id !== sidebarBanners[0]?.id) || fallbackPromos[0]]
      : fallbackPromos;

  if (banners.length === 0) {
    // No banners — full-width hero with side promos
    return (
      <section className="max-w-[1280px] mx-auto px-5 pt-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Hero main */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary-dark to-primary min-h-[420px] flex items-center">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=1200&q=80')] bg-cover bg-center opacity-20" />
            <div className="relative z-10 p-8 md:p-12 text-white max-w-xl">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">{t('home.hero.badge')}</span>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                {t('home.hero.title')}
              </h1>
              <p className="text-base md:text-lg opacity-90 mb-8">
                {t('home.hero.subtitle')} — livrare în toată Moldova
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push('/catalog?promo=true')}
                  className="px-7 py-3.5 bg-white text-primary-dark rounded-xl font-bold hover:bg-slate-100 transition shadow-lg text-sm"
                >
                  🔥 {t('home.hero.ctaPromo')}
                </button>
                <button
                  onClick={() => router.push('/catalog')}
                  className="px-7 py-3.5 bg-transparent border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition text-sm"
                >
                  💻 {t('home.hero.ctaCatalog')}
                </button>
              </div>
            </div>
          </div>

          {/* Side promo cards */}
          <div className="flex flex-col gap-4">
            {fallbackPromos.map((promo, i) => (
              <div
                key={i}
                className={`flex-1 rounded-2xl bg-gradient-to-br ${promo.gradient} p-6 text-white flex flex-col justify-between min-h-[190px] cursor-pointer hover:scale-[1.02] transition-transform`}
                onClick={() => router.push(promo.link)}
              >
                <div>
                  <p className="text-sm font-medium opacity-80 mb-1">{promo.subtitle}</p>
                  <h3 className="text-lg font-bold leading-snug">{promo.title}</h3>
                </div>
                <div>
                  <p className="text-2xl font-extrabold mb-2">{promo.price}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 px-3 py-1.5 rounded-lg">
                    {promo.cta} →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const banner = banners[currentSlide];

  return (
    <section className="max-w-[1280px] mx-auto px-5 pt-6 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Left: Banner slider (60-70%) */}
        <div className="relative rounded-2xl overflow-hidden min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={`absolute inset-0 ${banner.image ? '' : `bg-gradient-to-br ${banner.gradient || 'from-[#0c3a8f] via-[#1a56db] to-[#2563eb]'}`}`}
            >
              <div className="absolute inset-0 bg-black/30" />
              {banner.image && (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${banner.image})` }}
                />
              )}
              <div className="relative z-10 h-full flex flex-col justify-center p-8 md:p-12 text-white">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4 w-fit shadow-lg">
                  {banner.badge || '🔥 Ofertă'}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight max-w-xl drop-shadow-lg">
                  {banner.title}
                </h1>
                <p className="text-base md:text-lg opacity-90 mb-8 max-w-md drop-shadow-md">
                  {banner.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => router.push(banner.link || '/catalog')}
                    className="px-7 py-3.5 bg-white text-primary rounded-xl font-bold hover:bg-slate-100 transition shadow-lg text-sm w-fit"
                  >
                    {banner.buttonText || 'Vezi detalii'}
                  </button>
                  <button
                    onClick={() => router.push('/catalog')}
                    className="px-7 py-3.5 bg-transparent border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition text-sm w-fit"
                  >
                    💻 Catalog
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={() => setCurrentSlide(prev => (prev - 1 + banners.length) % banners.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full flex items-center justify-center text-white transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentSlide(prev => (prev + 1) % banners.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full flex items-center justify-center text-white transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2 rounded-full transition-all ${i === currentSlide ? 'bg-white w-6' : 'bg-white/50 w-2'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: 2 stacked promo cards (30-40%) */}
        <div className="flex flex-col gap-4">
          {displayPromos.map((promo) => (
            <div
              key={promo.id}
              className="flex-1 rounded-2xl overflow-hidden relative min-h-[190px] cursor-pointer hover:scale-[1.02] transition-transform group"
              onClick={() => router.push(promo.link)}
            >
              {/* Background image or gradient */}
              {promo.image ? (
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${promo.image})` }} />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${promo.gradient}`} />
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30" />
              {/* Content */}
              <div className="relative z-10 h-full p-5 flex flex-col justify-between text-white">
                <div>
                  <p className="text-xs font-medium opacity-80 mb-1 drop-shadow-md">{promo.subtitle}</p>
                  <h3 className="text-base font-bold leading-snug line-clamp-2 drop-shadow-lg">{promo.title}</h3>
                </div>
                <div>
                  {promo.price && <p className="text-xl font-extrabold mb-1 drop-shadow-lg">{promo.price}</p>}
                  {promo.oldPrice && <p className="text-xs opacity-60 line-through mb-1">{promo.oldPrice}</p>}
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    {promo.cta} →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}