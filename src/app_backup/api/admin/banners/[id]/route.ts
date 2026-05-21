import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/utils';

// PUT /api/admin/banners/[id] — update banner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) return notFoundResponse('Banner negăsit');

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.link !== undefined) updateData.link = body.link;
    if (body.buttonText !== undefined) updateData.buttonText = body.buttonText;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null;

    const banner = await prisma.banner.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'UPDATE',
        entity: 'Banner',
        entityId: id,
        details: JSON.stringify({ updatedFields: Object.keys(updateData) }),
      },
    });

    return successResponse(banner);
  } catch {
    return serverErrorResponse();
  }
}

// DELETE /api/admin/banners/[id] — delete banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const { id } = await params;

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) return notFoundResponse('Banner negăsit');

    await prisma.banner.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'DELETE',
        entity: 'Banner',
        entityId: id,
        details: JSON.stringify({ title: existing.title }),
      },
    });

    return successResponse({ message: 'Banner șters cu succes' });
  } catch {
    return serverErrorResponse();
  }
}
