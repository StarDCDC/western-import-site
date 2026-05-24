import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - count active online sessions (last 5 minutes)
export async function GET() {
  try {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Clean up stale sessions
    await prisma.onlineSession.deleteMany({
      where: { lastSeen: { lt: fiveMinAgo } },
    });

    // Count active
    const count = await prisma.onlineSession.count({
      where: { lastSeen: { gte: fiveMinAgo } },
    });

    return NextResponse.json({ online: count, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Online count error:', error);
    return NextResponse.json({ online: 0, error: 'Failed to count' }, { status: 500 });
  }
}

// POST - heartbeat / update session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, page } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    await prisma.onlineSession.upsert({
      where: { sessionId },
      create: { sessionId, page: page || null, lastSeen: new Date() },
      update: { lastSeen: new Date(), page: page || null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session heartbeat error:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
