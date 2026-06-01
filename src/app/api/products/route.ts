import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { sanitizeInput, validateRequired, hasSQLInjection } from '@/lib/validators';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams, parseSort, getClientIp, rateLimitResponse, serverErrorResponse } from '@/lib/utils';
import { rateLimit } from '@/lib/rateLimit';
import { resolveProductWhere, CACHE_TAGS } from '@/lib/queries';
import { revalidate } from '@/lib/revalidate';
import { unstable_cache } from 'next/cache';
import type { ProductsFilters } from '@/lib/api';

// Spec field names
const SPEC_FIELDS = ['display', 'storage', 'weight', 'refreshRate', 'ram', 'gpuModel', 'cpuModel', 'resolution', 'gpuSeries', 'cpuSeries', 'os', 'storageType', 'gpuType'] as const;
type SpecField = typeof SPEC_FIELDS[number];

// The raw DB read + shaping, cached and tagged so identical requests are instant
// even on a slow DB. Admin writes call revalidate('products') to drop this cache,
// so changes still appear immediately. `revalidate: 30` is a max-staleness safety
// net. Without this the route hit the DB on every call (~2s each on Railway free).
function fetchProductsList(args: {
  filters: ProductsFilters; skip: number; limit: number; field: string; order: 'asc' | 'desc';
}) {
  return unstable_cache(
    async () => {
      const { filters, skip, limit, field, order } = args;
      const where = await resolveProductWhere(filters);
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [field]: order },
          include: {
            category: { select: { id: true, nameRo: true, slug: true } },
            brand: { select: { id: true, name: true, slug: true } },
            reviews: { select: { rating: true } },
            _count: { select: { reviews: true } },
            spec: true,
          },
        }),
        prisma.product.count({ where }),
      ]);

      const productsWithRating = products.map((p) => {
        const avgRating = p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0;
        const { reviews, ...rest } = p;
        let parsedImages: string[] = [];
        if (typeof rest.images === 'string' && rest.images.length > 0) {
          try { parsedImages = JSON.parse(rest.images); } catch { parsedImages = []; }
        } else if (Array.isArray(rest.images)) {
          parsedImages = rest.images as unknown as string[];
        }
        return { ...rest, images: parsedImages, avgRating: Math.round(avgRating * 10) / 10, reviewCount: p._count.reviews };
      });

      return { productsWithRating, total };
    },
    ['api-products', JSON.stringify(args)],
    { tags: [CACHE_TAGS.products], revalidate: 30 },
  )();
}

// GET /api/products — list with filters, pagination, search
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(ip, { windowMs: 60000, maxRequests: 60 });
    if (!rl.allowed) return rateLimitResponse(rl.resetTime);

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const brandId = searchParams.get('brandId') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const condition = searchParams.get('condition');
    const isFeatured = searchParams.get('featured');
    const sort = searchParams.get('sort');

    // Collect spec filters
    const specFilters: Partial<Record<SpecField, string>> = {};
    for (const field of SPEC_FIELDS) {
      const val = searchParams.get(field);
      if (val) specFilters[field] = val;
    }

    const allowedSortFields = ['price', 'createdAt', 'name', 'stock'];
    const { field, order } = parseSort(sort, allowedSortFields);

    if (search && hasSQLInjection(search)) return errorResponse('Căutare invalidă');

    // Build the where clause via the shared resolver (also used for SSR).
    const filters: ProductsFilters = {
      search: search || undefined,
      categoryId: categoryId || undefined,
      brandId: brandId || undefined,
      condition: condition || undefined,
      featured: isFeatured === 'true' || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      ...specFilters,
    };
    const { productsWithRating, total } = await fetchProductsList({ filters, skip, limit, field, order });

    return paginatedResponse(productsWithRating, total, page, limit);
  } catch {
    return serverErrorResponse();
  }
}

// POST /api/products — create product (admin only)
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const body = await request.json();
    const sanitized = sanitizeInput(body) as Record<string, unknown>;

    const name = validateRequired(sanitized.name, 'Nume');
    const price = parseFloat(String(sanitized.price));
    const categoryId = validateRequired(sanitized.categoryId, 'Categorie');
    const brandId = validateRequired(sanitized.brandId, 'Brand');

    if (isNaN(price) || price <= 0) return errorResponse('Preț invalid');

    const slug = String(sanitized.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));

    const existing = await prisma.product.findFirst({
      where: { OR: [{ slug }, { sku: sanitized.sku as string }].filter(Boolean) },
    });
    if (existing) return errorResponse('Produsul există deja');

    // Extract spec fields
    const specData = {
      display: sanitized.display as string | undefined,
      storage: sanitized.storage as string | undefined,
      weight: sanitized.weight as string | undefined,
      refreshRate: sanitized.refreshRate as string | undefined,
      ram: sanitized.ram as string | undefined,
      gpuModel: sanitized.gpuModel as string | undefined,
      cpuModel: sanitized.cpuModel as string | undefined,
      resolution: sanitized.resolution as string | undefined,
      gpuSeries: sanitized.gpuSeries as string | undefined,
      cpuSeries: sanitized.cpuSeries as string | undefined,
      os: sanitized.os as string | undefined,
      storageType: sanitized.storageType as string | undefined,
      gpuType: sanitized.gpuType as string | undefined,
    };

    const hasSpecData = Object.values(specData).some(Boolean);

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        descriptionRo: sanitized.descriptionRo as string || null,
        descriptionRu: sanitized.descriptionRu as string || null,
        price,
        oldPrice: sanitized.oldPrice ? parseFloat(String(sanitized.oldPrice)) : null,
        stock: Number(sanitized.stock) || 0,
        sku: sanitized.sku as string || null,
        condition: ((sanitized.condition as string) || 'NEW') as any,
        images: Array.isArray(sanitized.images) ? JSON.stringify(sanitized.images) : "[]",
        specs: sanitized.specs ? sanitized.specs as any : undefined,
        isActive: sanitized.isActive !== false,
        isFeatured: sanitized.isFeatured === true,
        categoryId,
        brandId,
        ...(hasSpecData ? {
          spec: {
            create: specData,
          },
        } : {}),
      },
      include: {
        category: true,
        brand: true,
        spec: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'CREATE',
        entity: 'Product',
        entityId: product.id,
        details: JSON.stringify({ name: product.name }),
      },
    });

    revalidate('products', 'categories');
    return successResponse(product, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('obligatoriu')) return errorResponse(err.message);
    return serverErrorResponse();
  }
}