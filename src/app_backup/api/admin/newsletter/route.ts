import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse, getPaginationParams, paginatedResponse } from '@/lib/utils';

// GET /api/admin/newsletter — list subscribers
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    const [subscribers, total] = await Promise.all([
      prisma.newsletter.findMany({
        orderBy: { subscribedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.newsletter.count(),
    ]);

    return paginatedResponse(subscribers, total, page, limit);
  } catch {
    return serverErrorResponse();
  }
}

// POST /api/admin/newsletter/send — send newsletter to all active subscribers
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const body = await request.json();
    const { subject, content } = body;

    if (!subject || !content) return errorResponse('Subiect și conținut sunt obligatorii');

    const subscribers = await prisma.newsletter.findMany({
      where: { isActive: true },
      select: { email: true },
    });

    // In production, this would use a proper email service
    // For now, we log and return success
    console.log(`Newsletter "${subject}" would be sent to ${subscribers.length} subscribers`);

    return successResponse({
      sent: subscribers.length,
      subject,
    });
  } catch {
    return serverErrorResponse();
  }
}

// DELETE /api/admin/newsletter — remove subscriber
export async function DELETE(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return errorResponse('ID lipsă');

    await prisma.newsletter.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch {
    return serverErrorResponse();
  }
}
