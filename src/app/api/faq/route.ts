import prisma from '@/lib/prisma';
import { successResponse, serverErrorResponse } from '@/lib/utils';

// GET /api/faq — public FAQ list (active only)
export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return successResponse(faqs);
  } catch {
    return serverErrorResponse();
  }
}
