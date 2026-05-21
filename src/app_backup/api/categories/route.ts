import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { sanitizeInput, validateRequired, slugify } from '@/lib/validators';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';

// GET /api/categories — tree structure
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        _count: { select: { products: { where: { isActive: true } } } },
        children: {
          where: { isActive: true },
          include: {
            _count: { select: { products: { where: { isActive: true } } } },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Also get all categories flat for dropdowns
    const allCategories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, nameRo: true, nameRu: true, slug: true, parentId: true, order: true },
      orderBy: { order: 'asc' },
    });

    return successResponse({ tree: categories, flat: allCategories });
  } catch {
    return serverErrorResponse();
  }
}

// POST /api/categories — create category (admin)
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const body = await request.json();
    const sanitized = sanitizeInput(body) as Record<string, unknown>;

    const nameRo = validateRequired(sanitized.nameRo, 'Nume (RO)');
    const nameRu = validateRequired(sanitized.nameRu, 'Nume (RU)');

    const slug = sanitized.slug ? String(sanitized.slug) : slugify(nameRo);

    const existing = await prisma.category.findFirst({
      where: { OR: [{ slug }, { nameRo }] },
    });
    if (existing) return errorResponse('Categoria există deja');

    const category = await prisma.category.create({
      data: {
        nameRo,
        nameRu,
        slug,
        description: sanitized.description as string || null,
        image: sanitized.image as string || null,
        parentId: sanitized.parentId as string || null,
        order: Number(sanitized.order) || 0,
        isActive: sanitized.isActive !== false,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'CREATE',
        entity: 'Category',
        entityId: category.id,
        details: JSON.stringify({ nameRo }),
      },
    });

    return successResponse(category, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('obligatoriu')) return errorResponse(err.message);
    return serverErrorResponse();
  }
}
