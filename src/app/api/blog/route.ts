import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse, getPaginationParams, paginatedResponse } from '@/lib/utils';
import { NextRequest } from 'next/server';

// GET /api/blog — public blog list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const slug = searchParams.get('slug');

    if (slug) {
      const post = await prisma.blogPost.findUnique({
        where: { slug, isPublished: true },
      });
      if (!post) return errorResponse('Articol negăsit', 404);
      return successResponse(post);
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where: { isPublished: true } }),
    ]);

    return paginatedResponse(posts, total, page, limit);
  } catch {
    return serverErrorResponse();
  }
}
