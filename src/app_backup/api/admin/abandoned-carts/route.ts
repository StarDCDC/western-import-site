import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET abandoned carts (no update in >24h, with items)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const carts = await prisma.cart.findMany({
      where: {
        updatedAt: { lt: twentyFourHoursAgo },
        items: { some: {} },
        userId: { not: null },
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, price: true, images: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.cart.count({
      where: {
        updatedAt: { lt: twentyFourHoursAgo },
        items: { some: {} },
        userId: { not: null },
      },
    });

    const enriched = carts.map(cart => ({
      id: cart.id,
      user: cart.user,
      itemCount: cart.items.length,
      total: cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      lastActivity: cart.updatedAt,
      items: cart.items,
    }));

    return NextResponse.json({ carts: enriched, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Abandoned carts GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch abandoned carts' }, { status: 500 });
  }
}

// POST - send recovery email to a specific cart
export async function POST(req: NextRequest) {
  try {
    const { cartId } = await req.json();

    if (!cartId) {
      return NextResponse.json({ error: 'Missing cartId' }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, price: true, images: true } },
          },
        },
      },
    });

    if (!cart || !cart.user?.email) {
      return NextResponse.json({ error: 'Cart or user email not found' }, { status: 404 });
    }

    // Import email helper
    const { sendEmail } = await import('@/lib/email');

    const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const itemsHtml = cart.items.map(item => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${item.product.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${(item.product.price * item.quantity).toFixed(0)} MDL</td>
      </tr>
    `).join('');

    await sendEmail({
      to: cart.user.email,
      subject: '🛒 Ai uitat ceva în coș! — Western Import',
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
          <h1 style="color:#8B4513;">Salut${cart.user.name ? ' ' + cart.user.name : ''}!</h1>
          <p>Am observat că ai lăsat produse în coș. Nu uita să finalizezi comanda!</p>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="padding:8px;text-align:left;">Produs</th>
                <th style="padding:8px;text-align:center;">Cant.</th>
                <th style="padding:8px;text-align:right;">Preț</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:8px;text-align:right;font-weight:bold;">Total:</td>
                <td style="padding:8px;text-align:right;font-weight:bold;">${total.toFixed(0)} MDL</td>
              </tr>
            </tfoot>
          </table>
          <div style="text-align:center;margin:24px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://westernimport.md'}/cart" style="background:#8B4513;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">Finalizează Comanda</a>
          </div>
          <p style="color:#666;font-size:12px;">Western Import — Laptopuri, Telefoane & Electronică</p>
        </div>
      `,
    });

    // Update cart timestamp to prevent duplicate emails
    await prisma.cart.update({
      where: { id: cartId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, sentTo: cart.user.email });
  } catch (error) {
    console.error('Cart recovery POST error:', error);
    return NextResponse.json({ error: 'Failed to send recovery email' }, { status: 500 });
  }
}
