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

    // Case-insensitive match (Postgres `contains` is case-sensitive by default).
    const ci = { contains: q, mode: 'insensitive' as const };
    const searchOR = [
      { name: ci },
      { descriptionRo: ci },
      { descriptionRu: ci },
      { sku: ci },
      { brand: { name: ci } },
      { category: { nameRo: ci } },
      { category: { nameRu: ci } },
    ];

    // Search in product name, description, brand name, category name, SKU
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: searchOR,
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
        OR: searchOR,
      },
    });

    return successResponse({ products, total });
  } catch {
    return serverErrorResponse();
  }
}
