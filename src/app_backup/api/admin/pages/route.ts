import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';

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

    if (!slug || !titleRo || !titleRu) return errorResponse('Slug, titlul RO și RU sunt obligatorii');

    const existing = await prisma.page.findFirst({ where: { slug } });
    if (existing) return errorResponse('Această pagină există deja');

    const page = await prisma.page.create({
      data: {
        slug,
        titleRo,
        titleRu,
        contentRo: contentRo || null,
        contentRu: contentRu || null,
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
