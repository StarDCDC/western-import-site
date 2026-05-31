import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';
import { revalidate } from '@/lib/revalidate';

// GET /api/admin/banners — list all banners
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });

    return successResponse(banners);
  } catch {
    return serverErrorResponse();
  }
}

// POST /api/admin/banners — create banner
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const body = await request.json();
    const { title, subtitle, image, link, buttonText, position, order, isActive, startDate, endDate } = body;

    if (!title || !image) return errorResponse('Titlu și imagine sunt obligatorii');

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        image,
        link: link || null,
        buttonText: buttonText || null,
        position: position || 'HERO',
        order: order || 0,
        isActive: isActive !== false,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'CREATE',
        entity: 'Banner',
        entityId: banner.id,
        details: JSON.stringify({ title }),
      },
    });

    revalidate('banners');
    return successResponse(banner, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('obligatoriu')) return errorResponse(err.message);
    return serverErrorResponse();
  }
}
