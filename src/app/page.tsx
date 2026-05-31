// src/app/page.tsx — Server Component: fetches homepage products on the server
// so the HTML ships with content (no client fetch waterfall).
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategorySlider from '@/components/home/CategorySlider';
import ProductGrid from '@/components/home/ProductGrid';
import FeaturesBar from '@/components/home/FeaturesBar';
import BrandCarousel from '@/components/home/BrandCarousel';
import RecentlyViewed from '@/components/home/RecentlyViewed';
import { getProductsData } from '@/lib/queries';

// Render per-request so admin changes appear immediately (no stale cache).
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let initialProducts;
  try {
    const result = await getProductsData({ sort: 'newest', limit: 6 });
    initialProducts = result.products.slice(0, 6);
  } catch {
    initialProducts = undefined; // client will fetch as fallback
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <HeroSection />
        <CategorySlider />
        <FeaturesBar />
        <ProductGrid initialProducts={initialProducts} />
        <RecentlyViewed />
        <BrandCarousel />
      </main>
      <Footer />
    </>
  );
}
