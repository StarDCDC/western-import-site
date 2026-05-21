import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse, getPaginationParams, paginatedResponse } from '@/lib/utils';

// GET /api/admin/blog — list all blog posts
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const published = searchParams.get('published');

    const where = published === 'true' ? { isPublished: true } : published === 'false' ? { isPublished: false } : {};

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.blogPost.count({ where }),
    ]);

    return paginatedResponse(posts, total, page, limit);
  } catch {
    return serverErrorResponse();
  }
}

// POST /api/admin/blog — create blog post
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const body = await request.json();
    const { title, slug, content, excerpt, image, isPublished } = body;

    if (!title || !content) return errorResponse('Titlu și conținut sunt obligatorii');

    const slugToUse = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await prisma.blogPost.findUnique({ where: { slug: slugToUse } });
    if (existing) return errorResponse('Acest slug există deja');

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: slugToUse,
        content,
        excerpt: excerpt || null,
        image: image || null,
        isPublished: isPublished ?? false,
      },
    });

    return successResponse(post, 201);
  } catch {
    return serverErrorResponse();
  }
}

// PUT /api/admin/blog — update blog post
export async function PUT(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const body = await request.json();
    const { id, title, slug, content, excerpt, image, isPublished } = body;

    if (!id) return errorResponse('ID lipsă');

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return errorResponse('Articol negăsit');

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(content !== undefined && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(image !== undefined && { image }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    return successResponse(post);
  } catch {
    return serverErrorResponse();
  }
}

// DELETE /api/admin/blog — delete blog post
export async function DELETE(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return errorResponse('ID lipsă');

    await prisma.blogPost.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch {
    return serverErrorResponse();
  }
}
