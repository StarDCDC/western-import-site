import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, serverErrorResponse, errorResponse } from '@/lib/utils';

// GET /api/recent-views?sessionId=... — get recently viewed products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = Math.min(20, Math.max(1, Number(searchParams.get('limit')) || 10));

    if (!sessionId) {
      return successResponse({ products: [] });
    }

    const recentViews = await prisma.recentView.findMany({
      where: { sessionId },
      orderBy: { viewedAt: 'desc' },
      take: limit,
      include: {
        product: {
          include: {
            category: { select: { id: true, nameRo: true, nameRu: true, slug: true } },
            brand: { select: { id: true, name: true, slug: true } },
            reviews: { select: { rating: true } },
          },
        },
      },
    });

    const products = recentViews
      .filter((rv) => rv.product && rv.product.isActive)
      .map((rv) => ({
        ...rv.product,
        avgRating: rv.product.reviews.length > 0
          ? Math.round((rv.product.reviews.reduce((s, r) => s + r.rating, 0) / rv.product.reviews.length) * 10) / 10
          : 0,
      }));

    return successResponse({ products });
  } catch {
    return serverErrorResponse();
  }
}

// POST /api/recent-views — track a product view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, sessionId } = body;

    if (!productId || !sessionId) {
      return errorResponse('productId și sessionId sunt obligatorii');
    }

    // Upsert: if same session + product, update viewedAt
    const existing = await prisma.recentView.findFirst({
      where: { sessionId, productId },
    });

    if (existing) {
      await prisma.recentView.update({
        where: { id: existing.id },
        data: { viewedAt: new Date() },
      });
    } else {
      await prisma.recentView.create({
        data: { sessionId, productId },
      });
    }

    // Keep only last 20 per session
    const allViews = await prisma.recentView.findMany({
      where: { sessionId },
      orderBy: { viewedAt: 'desc' },
      select: { id: true },
    });

    if (allViews.length > 20) {
      const toDelete = allViews.slice(20).map((v) => v.id);
      await prisma.recentView.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    return successResponse({ ok: true });
  } catch {
    return serverErrorResponse();
  }
}
