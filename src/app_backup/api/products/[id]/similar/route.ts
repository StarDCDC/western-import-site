import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/utils';

// GET /api/products/[id]/similar — get similar products
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: { categoryId: true, brandId: true },
    });

    if (!product) return notFoundResponse('Produs negăsit');

    // Similar: same category OR same brand, excluding the current product
    const similar = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: id },
        OR: [
          { categoryId: product.categoryId },
          { brandId: product.brandId },
        ],
      },
      take: 8,
      orderBy: [
        { categoryId: 'asc' }, // prioritize same category
        { createdAt: 'desc' },
      ],
      include: {
        category: { select: { id: true, nameRo: true, nameRu: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        reviews: { select: { rating: true } },
      },
    });

    const result = similar.map((p) => ({
      ...p,
      avgRating: p.reviews.length > 0
        ? Math.round((p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length) * 10) / 10
        : 0,
    }));

    return successResponse(result);
  } catch {
    return serverErrorResponse();
  }
}
