import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';

// GET /api/admin/users — list all users
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
    });

    return successResponse(users);
  } catch {
    return serverErrorResponse();
  }
}

// PUT /api/admin/users — update user role (id in body)
export async function PUT(
  request: NextRequest
) {
  try {
    const { user, error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const body = await request.json();
    const { id, role: newRole } = body;
    if (!id) return errorResponse('ID utilizator lipsă');
    const validRoles = ['CUSTOMER', 'MODERATOR', 'ADMIN'];
    if (!validRoles.includes(newRole)) {
      return errorResponse('Rol invalid');
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return errorResponse('Utilizator negăsit');

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: newRole },
      select: { id: true, name: true, email: true, role: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'UPDATE_ROLE',
        entity: 'User',
        entityId: id,
        details: JSON.stringify({ oldRole: existing.role, newRole }),
      },
    });

    return successResponse(updatedUser);
  } catch {
    return serverErrorResponse();
  }
}
