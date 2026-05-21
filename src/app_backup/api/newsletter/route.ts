import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { validateEmail, hasSQLInjection } from '@/lib/validators';
import { successResponse, errorResponse, serverErrorResponse, getClientIp, rateLimitResponse } from '@/lib/utils';
import { rateLimit } from '@/lib/rateLimit';

// POST /api/newsletter — subscribe
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(ip, { windowMs: 60000, maxRequests: 3 });
    if (!rl.allowed) return rateLimitResponse(rl.resetTime);

    const body = await request.json();
    const email = (body.email as string || '').trim().toLowerCase();

    if (!email) return errorResponse('Email obligatoriu');
    if (!validateEmail(email)) return errorResponse('Email invalid');
    if (hasSQLInjection(email)) return errorResponse('Input invalid');

    const existing = await prisma.newsletter.findUnique({ where: { email } });
    if (existing) {
      if (!existing.isActive) {
        await prisma.newsletter.update({
          where: { email },
          data: { isActive: true },
        });
        return successResponse({ message: 'Abonat cu succes!' });
      }
      return errorResponse('Acest email este deja abonat');
    }

    await prisma.newsletter.create({ data: { email } });

    return successResponse({ message: 'Abonat cu succes!' }, 201);
  } catch {
    return serverErrorResponse();
  }
}

// DELETE /api/newsletter — unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = (searchParams.get('email') || '').trim().toLowerCase();

    if (!email) return errorResponse('Email obligatoriu');

    const existing = await prisma.newsletter.findUnique({ where: { email } });
    if (!existing) return errorResponse('Email negăsit');

    await prisma.newsletter.update({
      where: { email },
      data: { isActive: false },
    });

    return successResponse({ message: 'Dezabonat cu succes!' });
  } catch {
    return serverErrorResponse();
  }
}
