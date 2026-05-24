// src/app/page.tsx
'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategorySlider from '@/components/home/CategorySlider';
import ProductGrid from '@/components/home/ProductGrid';
import BrandCarousel from '@/components/home/BrandCarousel';
import RecentlyViewed from '@/components/home/RecentlyViewed';
import FlashSaleCountdown from '@/components/home/FlashSaleCountdown';
import FeaturesBar from '@/components/home/FeaturesBar';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/ui/LanguageProvider';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <HeroSection />
        <CategorySlider />
        <FeaturesBar />
        <ProductGrid />
        <FlashSaleCountdown />
        <RecentlyViewed />
        <BrandCarousel />
      </main>
      <Footer />
    </>
  );
}