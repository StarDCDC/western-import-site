import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/flash-sales — active flash sales with their product.
// Returns a plain array (the FlashSaleCountdown component consumes it directly).
export async function GET() {
  try {
    const now = new Date();
    const sales = await prisma.flashSale.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
        product: { isActive: true },
      },
      orderBy: { endsAt: 'asc' },
      include: {
        product: {
          select: { id: true, name: true, slug: true, price: true, oldPrice: true, images: true, stock: true },
        },
      },
    });

    return NextResponse.json(
      sales.map((s) => ({
        id: s.id,
        productId: s.productId,
        discountPercent: s.discountPercent,
        endsAt: s.endsAt.toISOString(),
        product: s.product,
      })),
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } },
    );
  } catch {
    // Never break the homepage over flash sales — return empty on error.
    return NextResponse.json([]);
  }
}
