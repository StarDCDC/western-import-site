// src/app/page.tsx
'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategorySlider from '@/components/home/CategorySlider';
import ProductGrid from '@/components/home/ProductGrid';
import FeaturesBar from '@/components/home/FeaturesBar';

// Lazy load below-fold components
const BrandCarousel = dynamic(() => import('@/components/home/BrandCarousel'));
const RecentlyViewed = dynamic(() => import('@/components/home/RecentlyViewed'));

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
        <RecentlyViewed />
        <BrandCarousel />
      </main>
      <Footer />
    </>
  );
}