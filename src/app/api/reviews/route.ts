import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { sanitizeInput, validateRating, hasSQLInjection } from '@/lib/validators';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams, serverErrorResponse } from '@/lib/utils';

// GET /api/reviews — reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const productId = searchParams.get('productId');

    if (!productId) return errorResponse('productId obligatoriu');

    const where = { productId, isApproved: true };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true } } },
      }),
      prisma.review.count({ where }),
    ]);

    return paginatedResponse(reviews, total, page, limit);
  } catch {
    return serverErrorResponse();
  }
}

// POST /api/reviews — create review (authenticated)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return errorResponse('Trebuie să fiți autentificat', 401);

    const body = await request.json();
    const sanitized = sanitizeInput(body) as Record<string, unknown>;

    const productId = sanitized.productId as string;
    if (!productId) return errorResponse('ID produs obligatoriu');

    let rating: number;
    try {
      rating = validateRating(sanitized.rating);
    } catch (err) {
      return errorResponse((err as Error).message);
    }

    const comment = sanitized.comment as string;
    if (comment && hasSQLInjection(comment)) return errorResponse('Comentariu invalid');

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return errorResponse('Produs negăsit');

    // Check if user already reviewed
    const existing = await prisma.review.findFirst({
      where: { userId: user.id, productId },
    });
    if (existing) return errorResponse('Ați deja lăsat o recenzie pentru acest produs');

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        productId,
        rating,
        comment: comment || null,
        isApproved: false, // Require admin approval
      },
      include: { user: { select: { id: true, name: true } } },
    });

    return successResponse(review, 201);
  } catch {
    return serverErrorResponse();
  }
}
