import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { sanitizeInput } from '@/lib/validators';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/utils';
import { revalidate } from '@/lib/revalidate';

// GET /api/products/[id] — single product with reviews and similar
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { include: { children: true } },
        brand: true,
        spec: true,
        attributes: true,
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: { select: { reviews: true, wishlistItems: true } },
      },
    });

    if (!product || !product.isActive) return notFoundResponse('Produs negăsit');

    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

    // Get similar products from same category
    const similar = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        id: { not: product.id },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        brand: { select: { name: true } },
        reviews: { select: { rating: true } },
      },
    });

    // Parse specs and images JSON strings
    const productData = {
      ...product,
      specs: typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs,
      images: (() => {
        if (Array.isArray(product.images)) return product.images;
        if (typeof product.images === 'string' && product.images.length > 0) {
          try { return JSON.parse(product.images); } catch { return []; }
        }
        return [];
      })(),
    };

    return successResponse({
      ...productData,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: product._count.reviews,
      wishlistCount: product._count.wishlistItems,
      similar: similar.map((p) => ({
        ...p,
        specs: typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs,
        images: (() => {
          if (Array.isArray(p.images)) return p.images;
          if (typeof p.images === 'string' && p.images.length > 0) {
            try { return JSON.parse(p.images); } catch { return []; }
          }
          return [];
        })(),
        avgRating: p.reviews.length > 0
          ? Math.round((p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length) * 10) / 10
          : 0,
      })),
    });
  } catch {
    return serverErrorResponse();
  }
}

// PUT /api/products/[id] — update product (admin)
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
    const sanitized = sanitizeInput(body) as Record<string, unknown>;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return notFoundResponse('Produs negăsit');

    const updateData: Record<string, unknown> = {};
    if (sanitized.name !== undefined) updateData.name = sanitized.name;
    if (sanitized.descriptionRo !== undefined) updateData.descriptionRo = sanitized.descriptionRo;
    if (sanitized.descriptionRu !== undefined) updateData.descriptionRu = sanitized.descriptionRu;
    if (sanitized.price !== undefined) updateData.price = parseFloat(String(sanitized.price));
    if (sanitized.oldPrice !== undefined) updateData.oldPrice = sanitized.oldPrice ? parseFloat(String(sanitized.oldPrice)) : null;
    if (sanitized.stock !== undefined) updateData.stock = Number(sanitized.stock);
    if (sanitized.sku !== undefined) updateData.sku = sanitized.sku;
    if (sanitized.condition !== undefined) updateData.condition = sanitized.condition;
    if (sanitized.images !== undefined) updateData.images = sanitized.images;
    if (sanitized.specs !== undefined) updateData.specs = sanitized.specs;
    if (sanitized.isActive !== undefined) updateData.isActive = sanitized.isActive;
    if (sanitized.isFeatured !== undefined) updateData.isFeatured = sanitized.isFeatured;
    if (sanitized.categoryId !== undefined) updateData.categoryId = sanitized.categoryId;
    if (sanitized.brandId !== undefined) updateData.brandId = sanitized.brandId;
    if (sanitized.slug !== undefined) updateData.slug = sanitized.slug;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true, brand: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'UPDATE',
        entity: 'Product',
        entityId: id,
        details: JSON.stringify({ updatedFields: Object.keys(updateData) }),
      },
    });

    revalidate('products', 'categories');
    return successResponse(product);
  } catch {
    return serverErrorResponse();
  }
}

// DELETE /api/products/[id] — soft delete (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const { id } = await params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return notFoundResponse('Produs negăsit');

    // Soft delete
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'DELETE',
        entity: 'Product',
        entityId: id,
        details: JSON.stringify({ name: existing.name }),
      },
    });

    revalidate('products', 'categories');
    return successResponse({ message: 'Produs șters cu succes' });
  } catch {
    return serverErrorResponse();
  }
}
