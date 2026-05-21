import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';

// GET /api/admin/faq — list all FAQs
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const faqs = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } });
    return successResponse(faqs);
  } catch {
    return serverErrorResponse();
  }
}

// POST /api/admin/faq — create FAQ
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const body = await request.json();
    const { question, answer, order, isActive } = body;

    if (!question || !answer) return errorResponse('Întrebare și răspuns sunt obligatorii');

    const faq = await prisma.fAQ.create({
      data: { question, answer, order: order ?? 0, isActive: isActive ?? true },
    });

    return successResponse(faq, 201);
  } catch {
    return serverErrorResponse();
  }
}

// PUT /api/admin/faq — update FAQ
export async function PUT(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const body = await request.json();
    const { id, question, answer, order, isActive } = body;

    if (!id) return errorResponse('ID lipsă');

    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        ...(question !== undefined && { question }),
        ...(answer !== undefined && { answer }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return successResponse(faq);
  } catch {
    return serverErrorResponse();
  }
}

// DELETE /api/admin/faq — delete FAQ
export async function DELETE(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return errorResponse('ID lipsă');

    await prisma.fAQ.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch {
    return serverErrorResponse();
  }
}
