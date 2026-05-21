import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimit } from '@/lib/rateLimit';
import { getClientIp, errorResponse, rateLimitResponse, serverErrorResponse, successResponse } from '@/lib/utils';

// GET /api/search?q=... — instant search across products
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(ip, { windowMs: 60000, maxRequests: 120 });
    if (!rl.allowed) return rateLimitResponse(rl.resetTime);

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();

    if (q.length < 2) {
      return successResponse({ products: [], total: 0 });
    }

    // Search in product name, description, brand name, category name, SKU
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q } },
          { descriptionRo: { contains: q } },
          { descriptionRu: { contains: q } },
          { sku: { contains: q } },
          { brand: { name: { contains: q } } },
          { category: { nameRo: { contains: q } } },
          { category: { nameRu: { contains: q } } },
        ],
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        oldPrice: true,
        condition: true,
        images: true,
        category: { select: { id: true, nameRo: true, nameRu: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        specs: true,
      },
    });

    // Also count total
    const total = await prisma.product.count({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q } },
          { descriptionRo: { contains: q } },
          { descriptionRu: { contains: q } },
          { sku: { contains: q } },
          { brand: { name: { contains: q } } },
          { category: { nameRo: { contains: q } } },
          { category: { nameRu: { contains: q } } },
        ],
      },
    });

    return successResponse({ products, total });
  } catch {
    return serverErrorResponse();
  }
}
