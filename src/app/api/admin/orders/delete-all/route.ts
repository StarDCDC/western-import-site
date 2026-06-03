import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return NextResponse.json({ success: false, error: 'Neautorizat' }, { status: 401 });
    if (error === 'forbidden') return NextResponse.json({ success: false, error: 'Acces refuzat' }, { status: 403 });

    const items = await prisma.orderItem.deleteMany({});
    const orders = await prisma.order.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Șterse ${orders.count} comenzi și ${items.count} order items`,
    });
  } catch (error) {
    console.error('Delete orders error:', error);
    return NextResponse.json({ success: false, error: 'Eroare la ștergere' }, { status: 500 });
  }
}
