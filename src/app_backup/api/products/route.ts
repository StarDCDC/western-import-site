import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, getAuthUser } from '@/lib/auth';
import { sanitizeInput, validateRequired, hasSQLInjection } from '@/lib/validators';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams, parseSort, getClientIp, rateLimitResponse, serverErrorResponse, rateLimitResponse as _rl } from '@/lib/utils';
import { rateLimit } from '@/lib/rateLimit';

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

    const allowedSortFields = ['price', 'createdAt', 'name', 'stock'];
    const { field, order } = parseSort(sort, allowedSortFields);

    const where: Record<string, unknown> = { isActive: true };

    if (search) {
      if (hasSQLInjection(search)) return errorResponse('Căutare invalidă');
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (condition) where.condition = condition;
    if (isFeatured === 'true') where.isFeatured = true;

    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
      };
    }

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
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate average rating
    const productsWithRating = products.map((p) => {
      const avgRating = p.reviews.length > 0
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
        : 0;
      const { reviews, ...rest } = p;
      return { ...rest, avgRating: Math.round(avgRating * 10) / 10, reviewCount: p._count.reviews };
    });

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
      },
      include: {
        category: true,
        brand: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'CREATE',
        entity: 'Product',
        entityId: product.id,
        details: JSON.stringify({ name: product.name }),
      },
    });

    return successResponse(product, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('obligatoriu')) return errorResponse(err.message);
    return serverErrorResponse();
  }
}
