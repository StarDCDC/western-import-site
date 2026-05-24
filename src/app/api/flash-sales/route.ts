import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET active flash sales (public)
export async function GET() {
  try {
    const now = new Date();
    const sales = await prisma.flashSale.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
        product: { isActive: true, stock: { gt: 0 } },
      },
      include: {
        product: {
          select: {
            id: true, name: true, slug: true, price: true, oldPrice: true,
            images: true, stock: true,
          },
        },
      },
      orderBy: { discountPercent: 'desc' },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error('Active flash sales GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch flash sales' }, { status: 500 });
  }
}
