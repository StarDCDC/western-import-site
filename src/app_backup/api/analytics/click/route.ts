import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST - store a click
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { page, x, y, width, userAgent } = body;

    if (!page || x === undefined || y === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.heatmapClick.create({
      data: {
        page,
        x: Number(x),
        y: Number(y),
        width: Number(width) || 0,
        userAgent: userAgent || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Heatmap click POST error:', error);
    return NextResponse.json({ error: 'Failed to store click' }, { status: 500 });
  }
}

// GET - retrieve heatmap data for a page
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || '/';
    const days = parseInt(searchParams.get('days') || '7');

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const clicks = await prisma.heatmapClick.findMany({
      where: {
        page,
        createdAt: { gte: since },
      },
      select: { x: true, y: true, width: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });

    const pages = await prisma.heatmapClick.groupBy({
      by: ['page'],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 50,
    });

    return NextResponse.json({
      page,
      clicks,
      pages: pages.map(p => ({ page: p.page, count: p._count.id })),
      totalClicks: clicks.length,
    });
  } catch (error) {
    console.error('Heatmap GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch heatmap data' }, { status: 500 });
  }
}
