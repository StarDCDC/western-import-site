import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/utils';

// PUT /api/admin/pages/[id] — update page
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

    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) return notFoundResponse('Pagină negăsită');

    const updateData: Record<string, unknown> = {};
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.titleRo !== undefined) updateData.titleRo = body.titleRo;
    if (body.titleRu !== undefined) updateData.titleRu = body.titleRu;
    if (body.contentRo !== undefined) updateData.contentRo = body.contentRo;
    if (body.contentRu !== undefined) updateData.contentRu = body.contentRu;
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;

    const page = await prisma.page.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'UPDATE',
        entity: 'Page',
        entityId: id,
        details: JSON.stringify({ updatedFields: Object.keys(updateData) }),
      },
    });

    return successResponse(page);
  } catch {
    return serverErrorResponse();
  }
}

// DELETE /api/admin/pages/[id] — delete page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const { id } = await params;

    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) return notFoundResponse('Pagină negăsită');

    await prisma.page.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'DELETE',
        entity: 'Page',
        entityId: id,
        details: JSON.stringify({ titleRo: existing.titleRo }),
      },
    });

    return successResponse({ message: 'Pagină ștearsă cu succes' });
  } catch {
    return serverErrorResponse();
  }
}
