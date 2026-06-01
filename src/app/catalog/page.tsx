// src/app/catalog/page.tsx — Server Component: fetches the initial product list,
// categories and brands matching the URL filters so the catalog paints with
// content on first load (no client fetch waterfall).
import { getProductsData, getCategoriesData, getBrandsData } from '@/lib/queries';
import CatalogClient, { type CatalogInitial } from './CatalogClient';

// ISR with 30s revalidation. Admin writes trigger revalidateTag() for instant updates.
export const revalidate = 30;

const PER_PAGE = 12;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const category = first(sp.category);
  const brand = first(sp.brand);
  const condition = first(sp.condition);
  const minPrice = first(sp.minPrice);
  const maxPrice = first(sp.maxPrice);
  const sort = first(sp.sort);
  const page = Number(first(sp.page)) || 1;
  const search = first(sp.search);

  let initial: CatalogInitial;
  try {
    const [products, categories, brands] = await Promise.all([
      getProductsData({
        category: category || undefined,
        brand: brand || undefined,
        condition: condition || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sort: sort || 'popular',
        page,
        limit: PER_PAGE,
        search: search || undefined,
      }),
      getCategoriesData(),
      getBrandsData(),
    ]);
    initial = {
      products: products.products,
      total: products.total,
      totalPages: products.totalPages,
      categories,
      brands,
    };
  } catch {
    // DB unavailable at build/render — client will fetch as fallback.
    initial = { products: [], total: 0, totalPages: 1, categories: [], brands: [] };
  }

  return <CatalogClient initial={initial} />;
}
