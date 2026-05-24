import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';
import { translateToRu } from '@/lib/translate';

// GET /api/admin/pages — list all pages
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const pages = await prisma.page.findMany({
      orderBy: { slug: 'asc' },
    });

    return successResponse(pages);
  } catch {
    return serverErrorResponse();
  }
}

// POST /api/admin/pages — create page
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const body = await request.json();
    const { slug, titleRo, titleRu, contentRo, contentRu, isPublished } = body;

    if (!slug || !titleRo) return errorResponse('Slug și titlul RO sunt obligatorii');

    const existing = await prisma.page.findFirst({ where: { slug } });
    if (existing) return errorResponse('Această pagină există deja');

    // Auto-translate if RU not provided
    const resolvedTitleRu = titleRu || await translateToRu(titleRo);
    const resolvedContentRu = contentRu || (contentRo ? await translateToRu(contentRo) : null);

    const page = await prisma.page.create({
      data: {
        slug,
        titleRo,
        titleRu: resolvedTitleRu,
        contentRo: contentRo || null,
        contentRu: resolvedContentRu,
        isPublished: isPublished !== false,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'CREATE',
        entity: 'Page',
        entityId: page.id,
        details: JSON.stringify({ titleRo }),
      },
    });

    return successResponse(page, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('obligatoriu')) return errorResponse(err.message);
    return serverErrorResponse();
  }
}

// PUT /api/admin/pages — update page
export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const body = await request.json();
    const { id, titleRo, titleRu, contentRo, contentRu, metaTitle, metaDescription, isPublished } = body;

    if (!id) return errorResponse('ID lipsă');

    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) return errorResponse('Pagină negăsită', 404);

    const updateData: Record<string, unknown> = {};

    if (titleRo !== undefined) updateData.titleRo = titleRo;
    if (contentRo !== undefined) updateData.contentRo = contentRo;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    // Only set nameRu/contentRu if explicitly provided in the request
    if (titleRu !== undefined) updateData.titleRu = titleRu;
    if (contentRu !== undefined) updateData.contentRu = contentRu;

    // Auto-translate RU from RO if RO changed and RU not explicitly provided
    if (titleRo && !titleRu && existing.titleRu) {
      updateData.titleRu = await translateToRu(titleRo);
    }
    if (contentRo && !contentRu && existing.contentRu) {
      updateData.contentRu = await translateToRu(contentRo);
    }

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
        details: JSON.stringify({ titleRo }),
      },
    });

    return successResponse(page);
  } catch {
    return serverErrorResponse();
  }
}

// DELETE /api/admin/pages?id= — delete page
export async function DELETE(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return errorResponse('ID lipsă', 400);

    await prisma.page.delete({ where: { id } });
    return successResponse({ message: 'Pagină ștearsă' });
  } catch {
    return serverErrorResponse();
  }
}