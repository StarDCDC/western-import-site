import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';

// GET /api/wishlist
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return errorResponse('Neautorizat', 401);

    const items = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            brand: { select: { name: true } },
            reviews: { select: { rating: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(items);
  } catch {
    return serverErrorResponse();
  }
}

// POST /api/wishlist — add to wishlist
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return errorResponse('Neautorizat', 401);

    const body = await request.json();
    const productId = body.productId;
    if (!productId) return errorResponse('ID produs obligatoriu');

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return errorResponse('Produs negăsit');

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });
    if (existing) return errorResponse('Produsul este deja în wishlist');

    const item = await prisma.wishlistItem.create({
      data: { userId: user.id, productId },
      include: { product: true },
    });

    return successResponse(item, 201);
  } catch {
    return serverErrorResponse();
  }
}

// DELETE /api/wishlist — remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return errorResponse('Neautorizat', 401);

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    if (!productId) return errorResponse('ID produs obligatoriu');

    await prisma.wishlistItem.deleteMany({
      where: { userId: user.id, productId },
    });

    return successResponse({ message: 'Eliminat din wishlist' });
  } catch {
    return serverErrorResponse();
  }
}
