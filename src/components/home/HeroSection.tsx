'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getBanners, type Banner } from '@/lib/api';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { subscribeNewsletter } from '@/lib/api';

interface Slide {
  badge: string;
  title: string;
  subtitle: string;
  cta1: { text: string; href: string };
  cta2: { text: string; href: string };
  gradient: string;
}

function bannerToSlide(banner: Banner): Slide {
  return {
    badge: banner.badge || '🔥 Ofertă',
    title: banner.title,
    subtitle: banner.subtitle,
    cta1: { text: banner.buttonText || 'Vezi detalii', href: banner.link || '/catalog' },
    cta2: { text: 'Vezi catalog', href: '/catalog' },
    gradient: banner.gradient || 'from-[#0c3a8f] via-[#1a56db] to-[#2563eb]',
  };
}

export default function HeroSection() {
  const router = useRouter();
  const { t } = useLanguage();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subError, setSubError] = useState('');

  useEffect(() => {
    async function loadBanners() {
      try {
        const data = await getBanners();
        setBanners(data);
      } catch (e) {
        console.error('Failed to load banners:', e);
      }
    }
    loadBanners();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubError('');
    const ok = await subscribeNewsletter(email);
    if (ok) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    } else {
      setSubError(t('home.newsletter.error') || 'Nu am putut abona. Încearcă din nou.');
      setTimeout(() => setSubError(''), 3000);
    }
  };

  // Auto-slide logic
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length]);

  const displaySlides = banners.map(bannerToSlide);
  
  // Fallback when no banners
  if (banners.length === 0) {
    return (
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-dark to-primary">
        <div className="text-white text-center max-w-3xl mx-auto px-5">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{t('home.hero.title')}</h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">{t('home.hero.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/catalog?promo=true')}
              className="px-8 py-4 bg-white text-primary rounded-xl font-bold hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl"
            >
              🔥 {t('nav.promotions')}
            </button>
            <button
              onClick={() => router.push('/catalog')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-all"
            >
              💻 {t('catalog.title')}
            </button>
          </div>
        </div>
      </section>
    );
  }
  
  const slide = displaySlides[currentSlide];

  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} text-white`}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative max-w-[1280px] mx-auto px-5 h-full flex items-center justify-center text-center">
            <div className="max-w-3xl mx-auto">
              <div className="text-center">
                <div className="mb-6">{slide.badge}</div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">{slide.title}</h1>
                <p className="text-lg md:text-xl mb-10 opacity-90">{slide.subtitle}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push(slide.cta1.href)}
                    className="px-8 py-4 bg-white text-primary rounded-xl font-bold hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                  >
                    {slide.cta1.text}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => router.push(slide.cta2.href)}
                    className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
                  >
                    {slide.cta2.text}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {displaySlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === currentSlide ? 'bg-white w-7' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
}