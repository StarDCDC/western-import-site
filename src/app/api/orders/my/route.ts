import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { prisma } = await import('@/lib/prisma');
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { select: { name: true, quantity: true, price: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
        items: o.items,
      })),
    });
  } catch (error) {
    console.error('[MY ORDERS]', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}