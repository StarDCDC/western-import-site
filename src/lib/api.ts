// src/lib/api.ts — API fetch functions with mock data fallback
// When DB is not configured (local dev), all calls gracefully fall back to mock data.

import {
  products as mockProducts,
  categories as mockCategories,
  brands as mockBrands,
  subcategories as mockSubcategories,
  getProductById as mockGetProductById,
  getSimilarProducts as mockGetSimilarProducts,
  formatPrice,
  getDiscount,
  type Product as MockProduct,
  type Category as MockCategory,
  type Brand,
  type Review,
} from './data';

// ─── Generic fetch helpers ────────────────────────────────────────
async function apiFetch<T>(url: string, options?: RequestInit): Promise<{ data: T; raw: unknown } | null> {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success) return { data: json.data as T, raw: json };
    return null;
  } catch {
    return null;
  }
}

// ─── Products ─────────────────────────────────────────────────────
export interface ProductsFilters {
  category?: string;
  categoryId?: string;
  brand?: string;
  brandId?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
  search?: string;
  featured?: boolean;
  // Spec filters
  display?: string;
  storage?: string;
  weight?: string;
  refreshRate?: string;
  ram?: string;
  gpuModel?: string;
  cpuModel?: string;
  resolution?: string;
  gpuSeries?: string;
  cpuSeries?: string;
  os?: string;
  storageType?: string;
  gpuType?: string;
}

export interface ProductsResponse {
  products: MockProduct[];
  total: number;
  page: number;
  totalPages: number;
}

/** Maps a DB product row back to the frontend MockProduct shape */
function mapDbProductToMock(p: Record<string, unknown>): MockProduct {
  // Support both old JSON specs column and new ProductSpec relation
  // Parse specs from JSON string if needed
  const rawSpecs = p.specs;
  const legacySpecs: Record<string, string> =
    typeof rawSpecs === 'string'
      ? (() => { try { return JSON.parse(rawSpecs); } catch { return {}; } })()
      : (rawSpecs as Record<string, string>) || {};
  const specRelation = p.spec as Record<string, string | null> | null;
  const brand = p.brand as Record<string, string> | null;
  const category = p.category as Record<string, string> | null;

  // Parse images from string (comma-separated) or JSON array
  let images: string[] = [];
  const rawImages = p.images;
  if (typeof rawImages === 'string') {
    let s = rawImages.trim();
    if (s.startsWith('"') && s.endsWith('"')) {
      // Double-encoded: "["..."]" -> strip outer quotes
      s = s.slice(1, -1);
    }
    // Unescape escaped quotes inside (e.g., " → ")
    s = s.replace(/\"/g, '"');
    if (s.startsWith('[')) {
      // JSON array string: ["url1","url2"] or ["url1","url2"]
      try { images = JSON.parse(s); } catch { images = []; }
    } else if (s.startsWith('http')) {
      // Single URL
      images = [s];
    } else if (s.includes(',')) {
      // Comma-separated URLs
      images = s.split(',').map(u => u.trim()).filter(u => u.startsWith('http') || u.startsWith('/'));
    } else if (s.startsWith('/')) {
      // Local file path: /uploads/xxx
      images = [s];
    } else {
      images = [];
    }
  } else if (Array.isArray(rawImages)) {
    images = rawImages as string[];
  }

  const specs = {
    procesor: legacySpecs.procesor || legacySpecs.cpu || specRelation?.cpuModel || specRelation?.cpuSeries || '',
    display: legacySpecs.display || specRelation?.display || '',
    ram: legacySpecs.ram || specRelation?.ram || '',
    stocare: legacySpecs.stocare || legacySpecs.storage || specRelation?.storage || '',
    gpu: legacySpecs.gpu || specRelation?.gpuModel || undefined,
    os: legacySpecs.os || specRelation?.os || undefined,
    tip: legacySpecs.tip || specRelation?.gpuType || undefined,
    producator: legacySpecs.producator || brand?.name || undefined,
    extra: legacySpecs.extra || undefined,
    weight: legacySpecs.weight || specRelation?.weight || undefined,
    refreshRate: legacySpecs.refreshRate || specRelation?.refreshRate || undefined,
    gpuModel: legacySpecs.gpuModel || specRelation?.gpuModel || undefined,
    cpuModel: legacySpecs.cpuModel || specRelation?.cpuModel || undefined,
    resolution: legacySpecs.resolution || specRelation?.resolution || undefined,
    gpuSeries: legacySpecs.gpuSeries || specRelation?.gpuSeries || undefined,
    cpuSeries: legacySpecs.cpuSeries || specRelation?.cpuSeries || undefined,
    storageType: legacySpecs.storageType || specRelation?.storageType || undefined,
    gpuType: legacySpecs.gpuType || specRelation?.gpuType || undefined,
  };

  return {
    id: p.id as string,
    name: p.name as string,
    brand: brand?.name || '',
    category: category?.slug || (p.categoryId as string) || '',
    condition: (p.condition as string === 'NEW' ? 'nou' : 'refurbished') as MockProduct['condition'],
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
    specs: {
      procesor: legacySpecs.procesor || legacySpecs.cpu || specRelation?.cpuModel || specRelation?.cpuSeries || '',
      display: legacySpecs.display || specRelation?.display || '',
      ram: legacySpecs.ram || specRelation?.ram || '',
      stocare: legacySpecs.stocare || legacySpecs.storage || specRelation?.storage || '',
      gpu: legacySpecs.gpu || specRelation?.gpuModel || undefined,
      os: legacySpecs.os || specRelation?.os || undefined,
      tip: legacySpecs.tip || specRelation?.gpuType || undefined,
      producator: legacySpecs.producator || brand?.name || undefined,
      extra: legacySpecs.extra || undefined,
      weight: legacySpecs.weight || specRelation?.weight || undefined,
      refreshRate: legacySpecs.refreshRate || specRelation?.refreshRate || undefined,
      gpuModel: legacySpecs.gpuModel || specRelation?.gpuModel || undefined,
      cpuModel: legacySpecs.cpuModel || specRelation?.cpuModel || undefined,
      resolution: legacySpecs.resolution || specRelation?.resolution || undefined,
      gpuSeries: legacySpecs.gpuSeries || specRelation?.gpuSeries || undefined,
      cpuSeries: legacySpecs.cpuSeries || specRelation?.cpuSeries || undefined,
      storageType: legacySpecs.storageType || specRelation?.storageType || undefined,
      gpuType: legacySpecs.gpuType || specRelation?.gpuType || undefined,
    },
    description: (p.descriptionRo as string) || '',
    descriptionRu: (p.descriptionRu as string) || undefined,
    images: images,
    reviews: [],
    rating: (p.avgRating as number) || 0,
    inStock: (p.stock as number) > 0,
  };
}

export async function getProducts(filters?: ProductsFilters): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  if (filters?.categoryId) params.set('categoryId', filters.categoryId);
  else if (filters?.category) params.set('categoryId', filters.category);
  if (filters?.brandId) params.set('brandId', filters.brandId);
  else if (filters?.brand) params.set('brandId', filters.brand);
  if (filters?.condition) {
    // Support comma-separated conditions or single condition
    const cond = filters.condition;
    if (cond.includes(',')) {
      params.set('condition', cond);
    } else {
      params.set('condition', cond === 'nou' ? 'NEW' : 'REFURBISHED');
    }
  }
  if (filters?.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
  if (filters?.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
  if (filters?.sort) {
    // Map frontend sort values to API sort format "field:order"
    const sortMap: Record<string, string> = {
      popular: 'createdAt:desc',
      price_asc: 'price:asc',
      price_desc: 'price:desc',
      newest: 'createdAt:desc',
    };
    params.set('sort', sortMap[filters.sort] || filters.sort);
  }
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.search) params.set('search', filters.search);
  if (filters?.featured) params.set('featured', 'true');

  const specFields = ['display', 'storage', 'weight', 'refreshRate', 'ram', 'gpuModel', 'cpuModel', 'resolution', 'gpuSeries', 'cpuSeries', 'os', 'storageType', 'gpuType'] as const;
  for (const field of specFields) {
    if (filters && (filters as any)[field]) {
      params.set(field, (filters as any)[field]);
    }
  }

  const url = `/api/products?${params.toString()}`;
  const result = await apiFetch<unknown[]>(url);

  if (result) {
    const raw = result.raw as Record<string, unknown>;
    const pagination = raw.pagination as { page: number; limit: number; total: number; totalPages: number } | undefined;
    const products = (Array.isArray(result.data) ? result.data : []).map((p) => mapDbProductToMock(p as Record<string, unknown>));
    return {
      products,
      total: pagination?.total ?? products.length,
      page: pagination?.page ?? 1,
      totalPages: pagination?.totalPages ?? 1,
    };
  }

  // Fallback to mock data
  let resultProducts = [...mockProducts];

  if (filters?.category) resultProducts = resultProducts.filter((p) => p.category === filters.category);
  if (filters?.brand) resultProducts = resultProducts.filter((p) => p.brand.toLowerCase() === filters.brand!.toLowerCase());
  if (filters?.condition) resultProducts = resultProducts.filter((p) => p.condition === filters.condition);
  if (filters?.minPrice !== undefined) resultProducts = resultProducts.filter((p) => p.price >= filters.minPrice!);
  if (filters?.maxPrice !== undefined) resultProducts = resultProducts.filter((p) => p.price <= filters.maxPrice!);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    resultProducts = resultProducts.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    );
  }
  if (filters?.featured) resultProducts = resultProducts.filter((p) => p.rating >= 4.5);

  if (filters?.sort === 'price_asc') resultProducts.sort((a, b) => a.price - b.price);
  else if (filters?.sort === 'price_desc') resultProducts.sort((a, b) => b.price - a.price);
  else resultProducts.sort((a, b) => b.rating - a.rating);

  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const total = resultProducts.length;
  const totalPages = Math.ceil(total / limit);
  const paginated = resultProducts.slice((page - 1) * limit, page * limit);

  return { products: paginated, total, page, totalPages };
}

// ─── Single Product ───────────────────────────────────────────────
export interface ProductDetail {
  product: MockProduct;
  similar: MockProduct[];
}

export async function getProduct(id: string): Promise<ProductDetail | null> {
  const result = await apiFetch<Record<string, unknown>>(`/api/products/${id}`);

  if (result) {
    const dbProduct = result.data;
    const similarDb = (dbProduct.similar as Record<string, unknown>[]) || [];
    // Remove similar from product data before mapping
    const { similar: _sim, avgRating, reviewCount, wishlistCount, ...productData } = dbProduct;
    const product = mapDbProductToMock(productData);
    product.rating = (avgRating as number) || 0;
    return {
      product,
      similar: similarDb.map(mapDbProductToMock),
    };
  }

  // Fallback
  const product = mockGetProductById(id);
  if (!product) return null;
  const similar = mockGetSimilarProducts(id);
  return { product, similar };
}

// ─── Categories ───────────────────────────────────────────────────
export interface ApiCategory {
  id: string;
  nameRo: string;
  nameRu: string;
  slug: string;
  icon?: string;
  count: number;
  children?: ApiCategory[];
}

export async function getCategories(): Promise<ApiCategory[]> {
  const result = await apiFetch<{ tree: Record<string, unknown>[]; flat: Record<string, unknown>[] }>('/api/categories');

  if (result?.data) {
    const flat = result.data.flat || [];
    const tree = result.data.tree || [];
    // Build count lookup from tree data (which has _count)
    const countMap: Record<string, number> = {};
    for (const node of tree) {
      const count = (node as any)._count?.products ?? 0;
      countMap[node.id as string] = count;
    }
    return flat.map((c) => ({
      id: c.id as string,
      nameRo: c.nameRo as string,
      nameRu: c.nameRu as string,
      slug: c.slug as string,
      icon: (c.slug as string) || '',
      count: countMap[c.id as string] ?? 0,
    }));
  }

  // Fallback to mock
  return mockCategories.map((c) => ({
    id: c.id,
    nameRo: c.name,
    nameRu: c.name,
    slug: c.id,
    icon: c.icon,
    count: c.count,
  }));
}

// ─── Banners ──────────────────────────────────────────────────────
export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link?: string;
  buttonText?: string;
  position: string;
  order: number;
  isActive: boolean;
  gradient?: string;
  badge?: string;
}

export async function getBanners(): Promise<Banner[]> {
  const result = await apiFetch<Record<string, unknown>[]>('/api/admin/banners');

  if (result?.data && Array.isArray(result.data)) {
    return result.data
      .filter((b) => b.isActive)
      .map((b) => ({
        id: b.id as string,
        title: b.title as string,
        subtitle: b.subtitle as string || '',
        image: b.image as string || '',
        link: b.link as string || '',
        buttonText: b.buttonText as string || '',
        position: b.position as string,
        order: b.order as number,
        isActive: b.isActive as boolean,
        gradient: b.gradient as string || undefined,
        badge: b.badge as string || undefined,
      }));
  }

  // No banners API or no data — return empty (component will use fallback)
  return [];
}

// ─── Brands ───────────────────────────────────────────────────────
export async function getBrands(): Promise<Brand[]> {
  try {
    const res = await fetch('/api/admin/brands');
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) return json.data;
  } catch {}
  return mockBrands;
}

// ─── Subcategories ────────────────────────────────────────────────
export async function getSubcategories(): Promise<Record<string, string[]>> {
  return mockSubcategories;
}

// ─── Cart API ─────────────────────────────────────────────────────
export interface CartItemAPI {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export async function getCart(): Promise<CartItemAPI[] | null> {
  const result = await apiFetch<CartItemAPI[]>('/api/cart');
  return result?.data ?? null;
}

export async function addToCartAPI(productId: string, quantity: number = 1): Promise<CartItemAPI[] | null> {
  const result = await apiFetch<CartItemAPI[]>('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
  return result?.data ?? null;
}

export async function updateCartItemAPI(productId: string, quantity: number): Promise<CartItemAPI[] | null> {
  const result = await apiFetch<CartItemAPI[]>('/api/cart', {
    method: 'PUT',
    body: JSON.stringify({ productId, quantity }),
  });
  return result?.data ?? null;
}

export async function removeFromCartAPI(productId: string): Promise<CartItemAPI[] | null> {
  const result = await apiFetch<CartItemAPI[]>('/api/cart', {
    method: 'DELETE',
    body: JSON.stringify({ productId }),
  });
  return result?.data ?? null;
}

// ─── Reviews ──────────────────────────────────────────────────────
export async function submitReview(productId: string, review: { rating: number; text: string; author: string }): Promise<Review | null> {
  const result = await apiFetch<Review>('/api/reviews', {
    method: 'POST',
    body: JSON.stringify({ productId, ...review }),
  });
  return result?.data ?? null;
}

// ─── Newsletter ───────────────────────────────────────────────────
export async function subscribeNewsletter(email: string): Promise<boolean> {
  try {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    return json.success === true;
  } catch {
    return false;
  }
}

// ─── IuteCredit ───────────────────────────────────────────────────
export interface CreditCalculation {
  months: number;
  monthlyPayment: number;
  totalPayment: number;
  interestRate: number;
  interestAmount: number;
}

export async function getCreditCalculations(productId: string): Promise<CreditCalculation[] | null> {
  const result = await apiFetch<{ plans: CreditCalculation[] }>(`/api/integrations/iute?productId=${productId}`);
  return result?.data?.plans ?? null;
}

export async function applyForCredit(productId: string, months: number, customerData: { name: string; phone: string; email: string }): Promise<{ applicationId: string; redirectUrl: string } | null> {
  const result = await apiFetch<{ applicationId: string; redirectUrl: string }>('/api/integrations/iute', {
    method: 'POST',
    body: JSON.stringify({ productId, months, ...customerData }),
  });
  return result?.data ?? null;
}

// ─── 999.md Integration ───────────────────────────────────────────
export async function sync999Md(action: 'sync' | 'upload' | 'delete', productId?: string): Promise<{ success: boolean; message: string } | null> {
  const result = await apiFetch<{ success: boolean; message: string }>('/api/integrations/999', {
    method: 'POST',
    body: JSON.stringify({ action, productId }),
  });
  return result?.data ?? null;
}

// ─── Admin Settings ───────────────────────────────────────────────
export interface AdminSettings {
  siteName: string;
  phone: string;
  email: string;
  address: string;
  schedule: string;
  metaTitle: string;
  metaDescription: string;
  gaId: string;
  facebook: string;
  instagram: string;
  telegram: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  nineNineMdApiKey: string;
  nineNineMdEndpoint: string;
  nineNineMdActive: boolean;
  iuteCreditApiKey: string;
  iuteCreditPartnerId: string;
  iuteCreditEndpoint: string;
  iuteCreditActive: boolean;
  elfsightWidgetId: string;
  elfsightActive: boolean;
}

export async function getAdminSettings(): Promise<AdminSettings | null> {
  const result = await apiFetch<AdminSettings>('/api/admin/settings');
  return result?.data ?? null;
}

export async function saveAdminSettings(settings: Partial<AdminSettings>): Promise<AdminSettings | null> {
  const result = await apiFetch<AdminSettings>('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
  return result?.data ?? null;
}

// ─── Site Settings (public) ───────────────────────────────────────
export async function getSettings(): Promise<Record<string, unknown> | null> {
  const result = await apiFetch<Record<string, unknown>>('/api/settings');
  return result?.data ?? null;
}

// Re-export types for convenience
export type { Product, Category as MockCategory, Brand, Review } from './data';

// Re-export utilities
export { formatPrice, getDiscount };
