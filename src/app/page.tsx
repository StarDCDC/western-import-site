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
import { getProductsData, getCategoriesData, getBannersData } from '@/lib/queries';

// ISR: revalidate every 30s, but admin writes call revalidateTag() for instant
// invalidation. This avoids per-request DB hits while keeping content fresh.
export const revalidate = 30;

export default async function HomePage() {
  // Fetch all homepage data in parallel on the server — zero client waterfalls.
  const [productsResult, categories, banners] = await Promise.all([
    getProductsData({ sort: 'newest', limit: 6 }).catch(() => ({ products: [], total: 0, page: 1, totalPages: 1 })),
    getCategoriesData().catch(() => []),
    getBannersData().catch(() => []),
  ]);
  const initialProducts = productsResult.products.slice(0, 6);

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50 dark:bg-[var(--color-dark-bg)] min-h-screen">
        <HeroSection initialBanners={banners} />
        <CategorySlider initialCategories={categories} />
        <FeaturesBar />
        <ProductGrid initialProducts={initialProducts} />
        <RecentlyViewed />
        <BrandCarousel />
      </main>
      <Footer />
    </>
  );
}
