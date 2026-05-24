import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';

// GET /api/admin/coupons/[id] — get single coupon
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(_request);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      return errorResponse('Neautorizat', 401);
    }

    const { id } = await params;
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) return errorResponse('Cupon negăsit', 404);

    return successResponse(coupon);
  } catch {
    return serverErrorResponse();
  }
}

// PUT /api/admin/coupons/[id] — update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      return errorResponse('Neautorizat', 401);
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) return errorResponse('Cupon negăsit', 404);

    // If changing code, check uniqueness
    if (body.code && body.code.toUpperCase() !== existing.code) {
      const dup = await prisma.coupon.findUnique({ where: { code: body.code.toUpperCase() } });
      if (dup) return errorResponse('Acest cod există deja');
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(body.code ? { code: body.code.toUpperCase().trim() } : {}),
        ...(body.type ? { type: body.type } : {}),
        ...(body.value !== undefined ? { value: Number(body.value) } : {}),
        ...(body.minOrder !== undefined ? { minOrder: body.minOrder ? Number(body.minOrder) : null } : {}),
        ...(body.maxDiscount !== undefined ? { maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : null } : {}),
        ...(body.usageLimit !== undefined ? { usageLimit: body.usageLimit ? Number(body.usageLimit) : null } : {}),
        ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
        ...(body.expiresAt !== undefined ? { expiresAt: body.expiresAt ? new Date(body.expiresAt) : null } : {}),
      },
    });

    return successResponse(coupon);
  } catch {
    return serverErrorResponse();
  }
}

// DELETE /api/admin/coupons/[id] — delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'ADMIN') {
      return errorResponse('Neautorizat', 401);
    }

    const { id } = await params;
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) return errorResponse('Cupon negăsit', 404);

    await prisma.coupon.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch {
    return serverErrorResponse();
  }
}
