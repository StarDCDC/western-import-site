import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all flash sales
export async function GET() {
  try {
    const sales = await prisma.flashSale.findMany({
      include: { product: { select: { id: true, name: true, price: true, images: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(sales);
  } catch (error) {
    console.error('Flash sales GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch flash sales' }, { status: 500 });
  }
}

// POST create flash sale
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, discountPercent, startsAt, endsAt, isActive } = body;

    if (!productId || !discountPercent || !startsAt || !endsAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sale = await prisma.flashSale.create({
      data: {
        productId,
        discountPercent: Number(discountPercent),
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      include: { product: { select: { id: true, name: true, price: true, images: true, slug: true } } },
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error('Flash sale POST error:', error);
    return NextResponse.json({ error: 'Failed to create flash sale' }, { status: 500 });
  }
}

// PUT update flash sale
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const updateData: Record<string, unknown> = {};
    if (data.productId !== undefined) updateData.productId = data.productId;
    if (data.discountPercent !== undefined) updateData.discountPercent = Number(data.discountPercent);
    if (data.startsAt !== undefined) updateData.startsAt = new Date(data.startsAt);
    if (data.endsAt !== undefined) updateData.endsAt = new Date(data.endsAt);
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);

    const sale = await prisma.flashSale.update({
      where: { id },
      data: updateData,
      include: { product: { select: { id: true, name: true, price: true, images: true, slug: true } } },
    });

    return NextResponse.json(sale);
  } catch (error) {
    console.error('Flash sale PUT error:', error);
    return NextResponse.json({ error: 'Failed to update flash sale' }, { status: 500 });
  }
}

// DELETE flash sale
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await prisma.flashSale.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Flash sale DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete flash sale' }, { status: 500 });
  }
}
