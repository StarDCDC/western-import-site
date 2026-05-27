import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils';

// GET /api/pages?slug=about — get public page content
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  
  if (!slug) return errorResponse('Slug required', 400);
  
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || !page.isPublished) return errorResponse('Page not found', 404);
  
  return successResponse(page);
}
