import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET loyalty points for user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const transactions = await prisma.loyaltyPoint.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const totalPoints = transactions.reduce((sum, t) => {
      if (t.reason === 'EARN' || t.reason === 'BONUS') return sum + t.points;
      return sum - t.points; // REDEEM, ADJUSTMENT
    }, 0);

    return NextResponse.json({ totalPoints, transactions });
  } catch (error) {
    console.error('Loyalty GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch loyalty points' }, { status: 500 });
  }
}

// POST - earn or redeem points
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, points, reason, orderId } = body;

    if (!userId || !points || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If redeeming, check balance
    if (reason === 'REDEEM') {
      const transactions = await prisma.loyaltyPoint.findMany({ where: { userId } });
      const balance = transactions.reduce((sum, t) =>
        (t.reason === 'EARN' || t.reason === 'BONUS') ? sum + t.points : sum - t.points, 0
      );
      if (balance < points) {
        return NextResponse.json({ error: 'Insufficient points', balance }, { status: 400 });
      }
    }

    const transaction = await prisma.loyaltyPoint.create({
      data: {
        userId,
        points: Math.abs(points),
        reason,
        orderId: orderId || null,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Loyalty POST error:', error);
    return NextResponse.json({ error: 'Failed to process loyalty points' }, { status: 500 });
  }
}
