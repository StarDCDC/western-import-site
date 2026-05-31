import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse, getClientIp, rateLimitResponse } from '@/lib/utils';
import { rateLimit } from '@/lib/rateLimit';

function getSessionId(request: NextRequest): string {
  return request.headers.get('x-session-id') || 'guest-' + getClientIp(request);
}

async function getOrCreateCart(userId: string | null, sessionId: string) {
  if (userId) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      });
    }
    return cart;
  }

  let cart = await prisma.cart.findFirst({
    where: { sessionId },
    include: { items: { include: { product: true } } },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId },
      include: { items: { include: { product: true } } },
    });
  }
  return cart;
}

// GET /api/cart
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const sessionId = getSessionId(request);
    const cart = await getOrCreateCart(user?.id || null, sessionId);

    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

    return successResponse({
      ...cart,
      subtotal,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch {
    return serverErrorResponse();
  }
}

// POST /api/cart — add item
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(ip, { windowMs: 60000, maxRequests: 30 });
    if (!rl.allowed) return rateLimitResponse(rl.resetTime);

    const user = await getAuthUser(request);
    const sessionId = getSessionId(request);
    const body = await request.json();

    const productId = body.productId;
    const quantity = Math.max(1, Math.min(99, Number(body.quantity) || 1));

    if (!productId) return errorResponse('ID produs obligatoriu');

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) return errorResponse('Produs negăsit');
    // Stock check — allow ordering even with 0 stock (import business)
    // if (product.stock < quantity) return errorResponse('Stoc insuficient');

    const cart = await getOrCreateCart(user?.id || null, sessionId);

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      // Stock check removed — allow ordering (import business)
      // if (newQty > product.stock) return errorResponse('Stoc insuficient');

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } },
    });

    return successResponse(updatedCart);
  } catch {
    return serverErrorResponse();
  }
}

// PUT /api/cart — update quantity
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const sessionId = getSessionId(request);
    const body = await request.json();

    const { itemId, quantity } = body;
    if (!itemId || !quantity) return errorResponse('Parametri lipsă');

    const cart = await getOrCreateCart(user?.id || null, sessionId);
    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });
    if (!cartItem) return errorResponse('Articol negăsit');

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: Math.min(99, quantity) },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } },
    });

    return successResponse(updatedCart);
  } catch {
    return serverErrorResponse();
  }
}

// DELETE /api/cart — clear cart or remove item
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const sessionId = getSessionId(request);
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    const cart = await getOrCreateCart(user?.id || null, sessionId);

    if (itemId) {
      await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
    } else {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } },
    });

    return successResponse(updatedCart);
  } catch {
    return serverErrorResponse();
  }
}
