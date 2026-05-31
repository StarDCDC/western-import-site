import prisma from '@/lib/prisma';
import { successResponse, serverErrorResponse } from '@/lib/utils';

// GET /api/banners — public: active banners only
export async function GET() {
  try {
    const now = new Date();
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      orderBy: { order: 'asc' },
    });

    return successResponse(banners);
  } catch {
    return serverErrorResponse();
  }
}
