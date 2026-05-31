// src/lib/queries.ts — Server-side data layer.
// These functions query Prisma directly and return data already mapped to the
// frontend shape. They are used by Server Components for SSR (no client fetch
// waterfall) and mirror the logic of the matching /api route handlers so the
// shape stays identical. Never import this from a Client Component (it pulls in Prisma).
import { unstable_cache } from 'next/cache';
import prisma from './prisma';
import { parseSort } from './utils';
import {
  mapDbProductToMock,
  type ProductsFilters,
  type ProductsResponse,
  type ApiCategory,
  type Banner,
  type ProductDetail,
} from './api';

// Cache tags — bumped (invalidated) by admin writes via revalidateTag (see lib/revalidate.ts).
export const CACHE_TAGS = {
  products: 'products',
  categories: 'categories',
  banners: 'banners',
  brands: 'brands',
} as const;

const SPEC_FIELDS = ['display', 'storage', 'weight', 'refreshRate', 'ram', 'gpuModel', 'cpuModel', 'resolution', 'gpuSeries', 'cpuSeries', 'os', 'storageType', 'gpuType'] as const;

const LIST_INCLUDE = {
  category: { select: { id: true, nameRo: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true } },
  reviews: { select: { rating: true } },
  _count: { select: { reviews: true } },
  spec: true,
} as const;

/** Shapes a raw product row into the API `data` item shape (avgRating + parsed images). */
function shapeRow(p: Record<string, unknown>): Record<string, unknown> {
  const reviews = (p.reviews as { rating: number }[]) || [];
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const count = (p._count as { reviews: number } | undefined)?.reviews ?? 0;
  const rest = { ...(p as Record<string, unknown>) };
  delete rest.reviews;
  delete rest._count;
  let images: string[] = [];
  if (typeof rest.images === 'string' && (rest.images as string).length > 0) {
    try { images = JSON.parse(rest.images as string); } catch { images = []; }
  } else if (Array.isArray(rest.images)) {
    images = rest.images as string[];
  }
  return { ...rest, images, avgRating: Math.round(avgRating * 10) / 10, reviewCount: count };
}

/**
 * Builds the Prisma `where` clause for a product list query.
 * Resolves category/brand id-or-slug in a single batched query each (no N+1).
 * Shared by SSR and the /api/products route handler.
 */
export async function resolveProductWhere(filters: ProductsFilters): Promise<Record<string, unknown>> {
  const where: Record<string, unknown> = { isActive: true };

  if (filters.search) {
    // Case-insensitive search. Postgres `contains` is case-sensitive by default,
    // so we must pass mode: 'insensitive' (do NOT pre-lowercase — that broke matching).
    const q = filters.search.trim();
    const ci = { contains: q, mode: 'insensitive' as const };
    where.OR = [
      { name: ci },
      { sku: ci },
      { brand: { name: ci } },
      { category: { nameRo: ci } },
      { category: { nameRu: ci } },
      { descriptionRo: ci },
      { descriptionRu: ci },
    ];
  }

  const categoryId = filters.categoryId || filters.category;
  if (categoryId) {
    const ids = String(categoryId).split(',').filter(Boolean);
    const found = await prisma.category.findMany({
      where: { OR: [{ id: { in: ids } }, { slug: { in: ids } }] },
      select: { id: true, slug: true },
    });
    const resolved = ids
      .map((token) => found.find((c) => c.id === token || c.slug === token)?.id)
      .filter((v): v is string => Boolean(v));
    if (resolved.length > 0) where.categoryId = { in: resolved };
    else where.categoryId = categoryId;
  }

  const brandId = filters.brandId || filters.brand;
  if (brandId) {
    const ids = String(brandId).split(',').filter(Boolean);
    const found = await prisma.brand.findMany({
      where: { OR: [{ id: { in: ids } }, { slug: { in: ids } }] },
      select: { id: true, slug: true },
    });
    const resolved = ids
      .map((token) => found.find((b) => b.id === token || b.slug === token)?.id)
      .filter((v): v is string => Boolean(v));
    if (resolved.length > 0) where.brandId = { in: resolved };
  }

  if (filters.condition) {
    const cond = String(filters.condition);
    if (cond.includes(',')) where.condition = { in: cond.split(',') };
    else where.condition = cond === 'nou' ? 'NEW' : cond === 'refurbished' ? 'REFURBISHED' : cond;
  }
  if (filters.featured) where.isFeatured = true;
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }

  const specEntries = SPEC_FIELDS
    .map((f) => [f, (filters as Record<string, unknown>)[f]] as const)
    .filter(([, v]) => Boolean(v));
  if (specEntries.length > 0) {
    where.spec = { AND: specEntries.map(([f, v]) => ({ [f]: { equals: v } })) };
  }

  return where;
}

const SORT_MAP: Record<string, string> = {
  popular: 'createdAt:desc',
  price_asc: 'price:asc',
  price_desc: 'price:desc',
  newest: 'createdAt:desc',
};

/** Server-side product list, mapped to the frontend shape. Mirrors GET /api/products. */
async function getProductsDataUncached(filters: ProductsFilters = {}): Promise<ProductsResponse> {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(100, Math.max(1, filters.limit || 20));
  const skip = (page - 1) * limit;
  const { field, order } = parseSort(filters.sort ? (SORT_MAP[filters.sort] || filters.sort) : null, ['price', 'createdAt', 'name', 'stock']);

  const where = await resolveProductWhere(filters);

  const [rows, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: limit, orderBy: { [field]: order }, include: LIST_INCLUDE }),
    prisma.product.count({ where }),
  ]);

  const products = rows.map((r) => mapDbProductToMock(shapeRow(r as unknown as Record<string, unknown>)));
  return { products, total, page, totalPages: Math.ceil(total / limit) };
}

/** Server-side single product + similar, mapped to the frontend shape. Mirrors GET /api/products/[id]. */
async function getProductDataUncached(id: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, nameRo: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true } },
      spec: true,
      reviews: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      _count: { select: { reviews: true } },
    },
  });
  if (!product || !product.isActive) return null;

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0;

  const similar = await prisma.product.findMany({
    where: { categoryId: product.categoryId, isActive: true, id: { not: product.id } },
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: LIST_INCLUDE,
  });

  const mapped = mapDbProductToMock(shapeRow(product as unknown as Record<string, unknown>));
  mapped.rating = Math.round(avgRating * 10) / 10;
  mapped.reviews = product.reviews.map((r) => ({
    id: r.id,
    author: r.user?.name || 'Anonim',
    rating: r.rating,
    date: r.createdAt.toISOString().slice(0, 10),
    text: r.comment || '',
  }));

  return {
    product: mapped,
    similar: similar.map((s) => mapDbProductToMock(shapeRow(s as unknown as Record<string, unknown>))),
  };
}

/** Server-side category tree mapped to the frontend ApiCategory shape. Mirrors GET /api/categories. */
async function getCategoriesDataUncached(): Promise<ApiCategory[]> {
  const tree = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
    orderBy: { order: 'asc' },
  });
  return tree.map((c) => ({
    id: c.id,
    nameRo: c.nameRo,
    nameRu: c.nameRu,
    slug: c.slug,
    icon: c.slug,
    count: c._count.products,
  }));
}

/** Server-side brands list (id, name, slug). Mirrors the brands used by the catalog filters. */
async function getBrandsDataUncached() {
  const brands = await prisma.brand.findMany({
    select: { id: true, name: true, slug: true, logo: true, description: true },
    orderBy: { name: 'asc' },
  });
  return brands.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    logo: b.logo || undefined,
    description: b.description || undefined,
  }));
}

/** Server-side active banners. Mirrors GET /api/banners. */
async function getBannersDataUncached(): Promise<Banner[]> {
  const now = new Date();
  const banners = await prisma.banner.findMany({
    where: {
      isActive: true,
      OR: [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: { gte: now } },
      ],
    },
    orderBy: { order: 'asc' },
  });
  return banners.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle || '',
    image: b.image || '',
    link: b.link || '',
    buttonText: b.buttonText || '',
    position: b.position,
    order: b.order,
    isActive: b.isActive,
  }));
}

// ─── Cached public wrappers ──────────────────────────────────────────
// Reads are cached and tagged so they're instant after the first hit, even on a
// slow DB. Admin writes call revalidateTag(...) (see lib/revalidate.ts) to drop
// the relevant cache so changes appear immediately. `revalidate: 30` is a safety
// net (max staleness if a tag is ever missed).

/** Cached product list. Cache key includes the filters. Tag: products. */
export function getProductsData(filters: ProductsFilters = {}): Promise<ProductsResponse> {
  return unstable_cache(
    () => getProductsDataUncached(filters),
    ['products-list', JSON.stringify(filters)],
    { tags: [CACHE_TAGS.products], revalidate: 30 },
  )();
}

/** Cached single product + similar. Tag: products. */
export function getProductData(id: string): Promise<ProductDetail | null> {
  return unstable_cache(
    () => getProductDataUncached(id),
    ['product', id],
    { tags: [CACHE_TAGS.products], revalidate: 30 },
  )();
}

/** Cached category tree. Tag: categories (+ products, since counts depend on products). */
export function getCategoriesData(): Promise<ApiCategory[]> {
  return unstable_cache(
    () => getCategoriesDataUncached(),
    ['categories-tree'],
    { tags: [CACHE_TAGS.categories, CACHE_TAGS.products], revalidate: 60 },
  )();
}

/** Cached brands. Tag: brands. */
export function getBrandsData(): ReturnType<typeof getBrandsDataUncached> {
  return unstable_cache(
    () => getBrandsDataUncached(),
    ['brands-list'],
    { tags: [CACHE_TAGS.brands], revalidate: 60 },
  )();
}

/** Cached active banners. Tag: banners. revalidate short because of time-window banners. */
export function getBannersData(): Promise<Banner[]> {
  return unstable_cache(
    () => getBannersDataUncached(),
    ['banners-active'],
    { tags: [CACHE_TAGS.banners], revalidate: 60 },
  )();
}
