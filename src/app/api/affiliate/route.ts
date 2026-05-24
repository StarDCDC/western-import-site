import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET affiliate info
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const code = searchParams.get('code');

    if (userId) {
      // Get user's affiliate info
      const affiliate = await prisma.affiliate.findUnique({
        where: { userId },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      return NextResponse.json(affiliate);
    }

    if (code) {
      // Track click
      const affiliate = await prisma.affiliate.findUnique({ where: { code } });
      if (affiliate) {
        await prisma.affiliate.update({
          where: { code },
          data: { clicks: { increment: 1 } },
        });
      }
      return NextResponse.json({ valid: !!affiliate, affiliateId: affiliate?.id || null });
    }

    // List all affiliates (admin)
    const affiliates = await prisma.affiliate.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(affiliates);
  } catch (error) {
    console.error('Affiliate GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch affiliate data' }, { status: 500 });
  }
}

// POST - create affiliate or track conversion
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, action, affiliateId, orderId, amount } = body;

    if (action === 'create' && userId) {
      // Generate unique code
      const code = `WI${userId.substring(0, 4).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Check if already exists
      const existing = await prisma.affiliate.findUnique({ where: { userId } });
      if (existing) {
        return NextResponse.json(existing);
      }

      const affiliate = await prisma.affiliate.create({
        data: { userId, code },
        include: { user: { select: { id: true, name: true, email: true } } },
      });

      return NextResponse.json(affiliate, { status: 201 });
    }

    if (action === 'conversion' && affiliateId) {
      // Track conversion
      const commission = (amount || 0) * 0.05; // 5% commission
      const affiliate = await prisma.affiliate.update({
        where: { id: affiliateId },
        data: {
          conversions: { increment: 1 },
          earnings: { increment: commission },
        },
      });
      return NextResponse.json({ success: true, commission });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Affiliate POST error:', error);
    return NextResponse.json({ error: 'Failed to process affiliate action' }, { status: 500 });
  }
}
