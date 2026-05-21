import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';

// POST /api/coupons/validate — validate a coupon code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = (body.code as string)?.toUpperCase().trim();
    const cartSubtotal = Number(body.subtotal) || 0;

    if (!code) return errorResponse('Codul este obligatoriu');

    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon) return errorResponse('Codul promoțional nu există');
    if (!coupon.isActive) return errorResponse('Acest cod este dezactivat');

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return errorResponse('Acest cod a expirat');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return errorResponse('Acest cod a atins limita de utilizări');
    }

    if (coupon.minOrder && cartSubtotal < coupon.minOrder) {
      return errorResponse(`Comanda minimă: ${coupon.minOrder} MDL`);
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = Math.round(cartSubtotal * (coupon.value / 100));
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(coupon.value, cartSubtotal);
    }

    return successResponse({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      minOrder: coupon.minOrder,
      maxDiscount: coupon.maxDiscount,
      expiresAt: coupon.expiresAt,
    });
  } catch {
    return serverErrorResponse();
  }
}
