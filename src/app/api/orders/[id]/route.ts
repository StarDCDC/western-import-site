import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';
import { sendEmail, orderShippedHtml, orderDeliveredHtml } from '@/lib/email';

// GET /api/orders/[id] — get single order
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(_request);
    if (!user) return errorResponse('Neautorizat', 401);

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) return errorResponse('Comandă negăsită', 404);

    // Only admin or the order owner can see it
    const isAdmin = user.role === 'ADMIN' || user.role === 'MODERATOR';
    if (!isAdmin && order.userId !== user.id) {
      return errorResponse('Neautorizat', 401);
    }

    return successResponse(order);
  } catch {
    return serverErrorResponse();
  }
}

// PATCH /api/orders/[id] — update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return errorResponse('Neautorizat', 401);
    const isAdmin = user.role === 'ADMIN' || user.role === 'MODERATOR';
    if (!isAdmin) return errorResponse('Acces interzis', 403);

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) return errorResponse('Comandă negăsită', 404);

    const updateData: Record<string, unknown> = {};

    if (body.status) {
      const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED'];
      if (!validStatuses.includes(body.status)) return errorResponse('Status invalid');
      updateData.status = body.status;
    }

    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.phone) updateData.phone = body.phone;
    if (body.email) updateData.email = body.email;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    // Send status-based emails
    if (updateData.status === 'SHIPPED' && order.email) {
      sendEmail({
        to: order.email,
        subject: `📦 Comanda ${order.orderNumber} a fost expediată!`,
        html: orderShippedHtml(order.orderNumber, body.trackingInfo),
      }).catch(() => {});
    }

    if (updateData.status === 'DELIVERED' && order.email) {
      sendEmail({
        to: order.email,
        subject: `🎉 Comanda ${order.orderNumber} a fost livrată!`,
        html: orderDeliveredHtml(order.orderNumber),
      }).catch(() => {});
    }

    return successResponse(order);
  } catch {
    return serverErrorResponse();
  }
}

// DELETE /api/orders/[id] — delete single order (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(_request);
    if (!user) return errorResponse('Neautorizat', 401);
    const isAdmin = user.role === 'ADMIN' || user.role === 'MODERATOR';
    if (!isAdmin) return errorResponse('Acces interzis', 403);

    const { id } = await params;
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return errorResponse('Comandă negăsită', 404);

    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });

    return successResponse({ message: 'Comandă ștearsă' });
  } catch {
    return serverErrorResponse();
  }
}
