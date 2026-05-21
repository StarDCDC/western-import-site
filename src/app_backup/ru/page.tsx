'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/ui/LanguageProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategorySlider from '@/components/home/CategorySlider';
import ProductGrid from '@/components/home/ProductGrid';
import BrandCarousel from '@/components/home/BrandCarousel';
import RecentlyViewed from '@/components/home/RecentlyViewed';
import FlashSaleCountdown from '@/components/home/FlashSaleCountdown';

export default function HomePage() {
  const router = useRouter();
  const { locale, setLocale } = useLanguage();

  // Asigurăm suntem pe ru dacă necesar
  useEffect(() => {
    if (locale === 'ro') {
      setLocale('ru');
    }
  }, [locale, setLocale]);

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <HeroSection />
        <CategorySlider />
        <ProductGrid />
        <FlashSaleCountdown />
        <RecentlyViewed />
        <BrandCarousel />
      </main>
      <Footer />
    </>
  );
}