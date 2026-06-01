// src/app/api/iute/confirm/route.ts — IutePay Webhook: userConfirmationUrl
// Docs: IuteCredit POSTs here when loan application is approved/signed.
// This is the userConfirmationUrl from the checkout flow.
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderId = body.orderId;
    const checkoutSessionId = body.checkoutSessionId;

    if (!orderId && !checkoutSessionId) {
      return Response.json({ success: false, error: 'Missing orderId or checkoutSessionId' }, { status: 400 });
    }

    // Find the order by orderId or by iute checkout session id stored in metadata
    let order;
    if (orderId) {
      order = await prisma.order.findUnique({ where: { id: orderId } });
    }
    if (!order && checkoutSessionId) {
      // Search pending iutepay orders for matching session
      const orders = await prisma.order.findMany({
        where: { paymentMethod: 'iutepay', status: 'pending' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      order = orders.find((o) => {
        try {
          const meta = JSON.parse((o as Record<string, unknown>).metadata as string || '{}');
          return meta.iuteCheckoutSessionId === checkoutSessionId;
        } catch { return false; }
      });
    }

    if (order) {
      // Update order — loan was approved/signed via IutePay
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'confirmed',
          paymentMethod: 'iutepay',
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: 'iute-webhook',
          action: 'IUTE_CHECKOUT_CONFIRMED',
          entity: 'Order',
          entityId: order.id,
          details: JSON.stringify(body),
        },
      }).catch(() => {});
    }

    // Docs: IutePay expects a 200 response
    return Response.json({ success: true, received: true });
  } catch (error) {
    console.error('[IutePay] Confirm webhook error:', error);
    // Still return 200 so IutePay doesn't retry unnecessarily
    return Response.json({ success: false, error: 'Processing error' });
  }
}
