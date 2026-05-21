import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST - subscribe to push notifications
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint, keys, userId } = body;

    if (!endpoint || !keys) {
      return NextResponse.json({ error: 'Missing endpoint or keys' }, { status: 400 });
    }

    // Upsert subscription
    const existing = await prisma.pushSubscription.findUnique({ where: { endpoint } });

    if (existing) {
      await prisma.pushSubscription.update({
        where: { endpoint },
        data: {
          keys: typeof keys === 'string' ? keys : JSON.stringify(keys),
          userId: userId || null,
        },
      });
    } else {
      await prisma.pushSubscription.create({
        data: {
          endpoint,
          keys: typeof keys === 'string' ? keys : JSON.stringify(keys),
          userId: userId || null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

// DELETE - unsubscribe
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
    }

    await prisma.pushSubscription.deleteMany({ where: { endpoint } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
