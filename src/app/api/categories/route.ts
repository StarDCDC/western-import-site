import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { sanitizeInput, validateRequired, slugify } from '@/lib/validators';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';
import { translateToRu } from '@/lib/translate';

// GET /api/categories — tree structure (public)
// GET /api/categories?flat=true — flat list for admin dropdowns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flat = searchParams.get('flat') === 'true';

    if (flat) {
      const all = await prisma.category.findMany({
        select: { id: true, nameRo: true, nameRu: true, slug: true, parentId: true, order: true, image: true, isActive: true },
        orderBy: { order: 'asc' },
      });
      return successResponse(all);
    }

    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        _count: { select: { products: { where: { isActive: true } } } },
        children: {
          where: { isActive: true },
          include: { _count: { select: { products: { where: { isActive: true } } } } },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

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
    const nameRu = sanitized.nameRu as string
      ? (sanitized.nameRu as string)
      : await translateToRu(nameRo);

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

// PUT /api/categories?id= — update category
export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return errorResponse('ID lipsă', 400);

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.nameRo !== undefined) updateData.nameRo = body.nameRo;
    if (body.nameRu !== undefined) updateData.nameRu = body.nameRu;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.order !== undefined) updateData.order = body.order;

    // Auto-translate nameRu from nameRo if nameRu is not provided
    if (body.nameRo && !body.nameRu) {
      updateData.nameRu = await translateToRu(body.nameRo);
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return successResponse(category);
  } catch {
    return serverErrorResponse();
  }
}

// DELETE /api/categories?id= — delete category
export async function DELETE(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return errorResponse('ID lipsă', 400);

    // Check if category has products
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) return errorResponse(`Categoria are ${count} produse. Ștergeți produsele mai întâi.`);

    await prisma.category.delete({ where: { id } });
    return successResponse({ message: 'Categoria a fost ștearsă' });
  } catch {
    return serverErrorResponse();
  }
}
