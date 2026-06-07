'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type Banner } from '@/lib/api';
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

const fallbackPromos: PromoCard[] = [
  { id: 'fallback-1', title: 'Laptopuri Gaming', subtitle: 'De la 2990 MDL', price: 'de la 2,990 MDL', link: '/catalog?category=laptopuri', cta: 'Vezi oferta', gradient: 'from-[#1a56db] to-[#0c3a8f]' },
  { id: 'fallback-2', title: 'iPhone Recondiționat', subtitle: 'Verificat și garanție 12 luni', price: 'de la 8,990 MDL', link: '/catalog?category=telefoane', cta: 'Descoperă', gradient: 'from-amber-500 to-orange-600' },
];

interface HeroSectionProps { initialBanners?: Banner[]; }

export default function HeroSection({ initialBanners }: HeroSectionProps) {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Separate banners: HERO for slider, SIDEBAR for side cards
  const allBanners = initialBanners ?? [];
  const heroBanners = allBanners.filter((b) => b.position !== 'SIDEBAR' && b.position !== 'MIDDLE');
  const sidebarBanners = allBanners.filter((b) => b.position === 'SIDEBAR' || b.position === 'MIDDLE');

  const sidebarPromos: PromoCard[] = sidebarBanners.slice(0, 2).map((b) => ({
    id: b.id,
    title: (locale === 'ru' && b.titleRu) ? b.titleRu : b.title,
    subtitle: (locale === 'ru' && b.subtitleRu) ? (b.subtitleRu || '') : (b.subtitle || ''),
    image: b.image,
    link: b.link || '/catalog',
    cta: (locale === 'ru' && b.buttonTextRu) ? b.buttonTextRu : (b.buttonText || 'Vezi detalii'),
    gradient: b.gradient || 'from-[#1a56db] to-[#0c3a8f]',
  }));

  const displayPromos: PromoCard[] = sidebarPromos.length >= 2
    ? sidebarPromos
    : sidebarPromos.length === 1
      ? [sidebarPromos[0], fallbackPromos[0]]
      : fallbackPromos;

  // Auto-slide only hero banners
  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroBanners.length]);

  // No banners at all — fallback hero
  if (allBanners.length === 0) {
    return (
      <section className="max-w-[1280px] mx-auto px-5 pt-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary-dark to-primary aspect-[16/9] sm:min-h-[420px] flex items-center">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=1200&q=80')] bg-cover bg-center opacity-20" />
            <div className="relative z-10 p-6 sm:p-8 md:p-12 text-white max-w-xl">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">{t('home.hero.badge')}</span>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 leading-tight">{t('home.hero.title')}</h1>
              <p className="text-sm sm:text-base md:text-lg opacity-90 mb-6 sm:mb-8">{t('home.hero.subtitle')}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => router.push('/catalog?promo=true')} className="px-4 py-2 sm:px-7 sm:py-3.5 bg-white text-primary-dark rounded-lg sm:rounded-xl font-bold hover:bg-slate-100 transition shadow-lg text-xs sm:text-sm">🔥 {t('home.hero.ctaPromo')}</button>
                <button onClick={() => router.push('/catalog')} className="px-4 py-2 sm:px-7 sm:py-3.5 bg-transparent border-2 border-white text-white rounded-lg sm:rounded-xl font-bold hover:bg-white/10 transition text-xs sm:text-sm">💻 {t('home.hero.ctaCatalog')}</button>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex flex-col gap-4">
            {fallbackPromos.map((promo, i) => (
              <div key={i} className={`flex-1 rounded-2xl bg-gradient-to-br ${promo.gradient} p-6 text-white flex flex-col justify-between min-h-[190px] cursor-pointer hover:scale-[1.02] transition-transform`} onClick={() => router.push(promo.link)}>
                <div>
                  <p className="text-sm font-medium opacity-80 mb-1">{promo.subtitle}</p>
                  <h3 className="text-lg font-bold leading-snug">{promo.title}</h3>
                </div>
                <div>
                  <p className="text-2xl font-extrabold mb-2">{promo.price}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 px-3 py-1.5 rounded-lg">{promo.cta} →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // No hero banners but have sidebar — show fallback hero
  if (heroBanners.length === 0) {
    return (
      <section className="max-w-[1280px] mx-auto px-5 pt-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary-dark to-primary aspect-[16/9] sm:min-h-[420px] flex items-center">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=1200&q=80')] bg-cover bg-center opacity-20" />
            <div className="relative z-10 p-6 sm:p-8 md:p-12 text-white max-w-xl">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">{t('home.hero.badge')}</span>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 leading-tight">{t('home.hero.title')}</h1>
              <p className="text-sm sm:text-base md:text-lg opacity-90 mb-6 sm:mb-8">{t('home.hero.subtitle')}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => router.push('/catalog?promo=true')} className="px-4 py-2 sm:px-7 sm:py-3.5 bg-white text-primary-dark rounded-lg sm:rounded-xl font-bold hover:bg-slate-100 transition shadow-lg text-xs sm:text-sm">🔥 {t('home.hero.ctaPromo')}</button>
                <button onClick={() => router.push('/catalog')} className="px-4 py-2 sm:px-7 sm:py-3.5 bg-transparent border-2 border-white text-white rounded-lg sm:rounded-xl font-bold hover:bg-white/10 transition text-xs sm:text-sm">💻 {t('home.hero.ctaCatalog')}</button>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex flex-col gap-4">
            {displayPromos.map((promo) => (
              <div key={promo.id} className="flex-1 rounded-2xl overflow-hidden relative min-h-[190px] cursor-pointer hover:scale-[1.02] transition-transform group" onClick={() => router.push(promo.link)}>
                {promo.image ? <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${promo.image})` }} /> : <div className={`absolute inset-0 bg-gradient-to-br ${promo.gradient}`} />}
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 h-full p-5 flex flex-col justify-between text-white">
                  <div><p className="text-xs font-medium opacity-80 mb-1 drop-shadow-md">{promo.subtitle}</p><h3 className="text-base font-bold leading-snug line-clamp-2 drop-shadow-lg">{promo.title}</h3></div>
                  <div>
                    {promo.price && <p className="text-xl font-extrabold mb-1 drop-shadow-lg">{promo.price}</p>}
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">{promo.cta} →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const banner = heroBanners[currentSlide];

  return (
    <section className="max-w-[1280px] mx-auto px-5 pt-6 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Left: Hero banner slider */}
        <div
          className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-auto sm:min-h-[420px] select-none"
          onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStart === null || heroBanners.length <= 1) return;
            const diff = touchStart - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
              if (diff > 0) setCurrentSlide(prev => (prev + 1) % heroBanners.length);
              else setCurrentSlide(prev => (prev - 1 + heroBanners.length) % heroBanners.length);
            }
            setTouchStart(null);
          }}
        >
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
              {banner.image && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${banner.image})` }} />}
              <div className="relative z-10 h-full flex flex-col justify-center p-6 sm:p-8 md:p-12 text-white">
                {banner.badge && (
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4 w-fit shadow-lg">{banner.badge}</span>
                )}
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 leading-tight max-w-xl drop-shadow-lg">
                  {(locale === 'ru' && banner.titleRu) ? banner.titleRu : banner.title}
                </h1>
                <p className="text-sm sm:text-base md:text-lg opacity-90 mb-6 sm:mb-8 max-w-md drop-shadow-md">
                  {(locale === 'ru' && banner.subtitleRu) ? banner.subtitleRu : banner.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => router.push(banner.link || '/catalog')} className="px-4 py-2 sm:px-7 sm:py-3.5 bg-white text-primary rounded-lg sm:rounded-xl font-bold hover:bg-slate-100 transition shadow-lg text-xs sm:text-sm w-fit">
                    {(locale === 'ru' && banner.buttonTextRu) ? banner.buttonTextRu : (banner.buttonText || 'Vezi detalii')}
                  </button>
                  <button onClick={() => router.push('/catalog')} className="px-4 py-2 sm:px-7 sm:py-3.5 bg-transparent border-2 border-white text-white rounded-lg sm:rounded-xl font-bold hover:bg-white/10 transition text-xs sm:text-sm w-fit">
                    💻 {locale === 'ru' ? 'Каталог' : 'Catalog'}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {heroBanners.length > 1 && (
            <>
              <button onClick={() => setCurrentSlide(prev => (prev - 1 + heroBanners.length) % heroBanners.length)} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/10 hover:bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-white/60 hover:text-white transition"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setCurrentSlide(prev => (prev + 1) % heroBanners.length)} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/10 hover:bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-white/60 hover:text-white transition"><ChevronRight className="w-4 h-4" /></button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {heroBanners.map((_, i) => (
                  <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'bg-white w-6' : 'bg-white/50 w-2'}`} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: Sidebar promo cards (SIDEBAR position only) */}
        <div className="hidden lg:flex flex-col gap-4">
          {displayPromos.map((promo) => (
            <div key={promo.id} className="flex-1 rounded-2xl overflow-hidden relative min-h-[190px] cursor-pointer hover:scale-[1.02] transition-transform group" onClick={() => router.push(promo.link)}>
              {promo.image ? <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${promo.image})` }} /> : <div className={`absolute inset-0 bg-gradient-to-br ${promo.gradient}`} />}
              <div className="absolute inset-0 bg-black/30" />
              <div className="relative z-10 h-full p-5 flex flex-col justify-between text-white">
                <div><p className="text-xs font-medium opacity-80 mb-1 drop-shadow-md">{promo.subtitle}</p><h3 className="text-base font-bold leading-snug line-clamp-2 drop-shadow-lg">{promo.title}</h3></div>
                <div>
                  {promo.price && <p className="text-xl font-extrabold mb-1 drop-shadow-lg">{promo.price}</p>}
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">{promo.cta} →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
