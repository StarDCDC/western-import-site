import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse, paginatedResponse, getPaginationParams } from '@/lib/utils';

// GET /api/admin/coupons — list all coupons
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      return errorResponse('Neautorizat', 401);
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      prisma.coupon.count(),
    ]);

    return paginatedResponse(coupons, total, page, limit);
  } catch {
    return serverErrorResponse();
  }
}

// POST /api/admin/coupons — create coupon
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      return errorResponse('Neautorizat', 401);
    }

    const body = await request.json();

    const code = (body.code as string)?.toUpperCase().trim();
    if (!code) return errorResponse('Codul este obligatoriu');

    const type = body.type as string;
    if (!type || !['PERCENTAGE', 'FIXED'].includes(type)) {
      return errorResponse('Tip invalid (PERCENTAGE sau FIXED)');
    }

    const value = Number(body.value);
    if (!value || value <= 0) return errorResponse('Valoarea trebuie să fie mai mare decât 0');

    // Check unique code
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) return errorResponse('Acest cod există deja');

    const coupon = await prisma.coupon.create({
      data: {
        code,
        type,
        value,
        minOrder: body.minOrder ? Number(body.minOrder) : null,
        maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : null,
        usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
        usedCount: 0,
        isActive: body.isActive !== false,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });

    return successResponse(coupon, 201);
  } catch {
    return serverErrorResponse();
  }
}
