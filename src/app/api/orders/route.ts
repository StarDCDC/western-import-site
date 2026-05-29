import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { sanitizeInput, validateRequired, validateEmail, validatePhone } from '@/lib/validators';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams, generateOrderNumber, serverErrorResponse } from '@/lib/utils';
import { sendEmail, orderConfirmationHtml, newOrderAdminHtml, orderShippedHtml, orderDeliveredHtml } from '@/lib/email';

// GET /api/orders — user's orders (admin sees all)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return errorResponse('Neautorizat', 401);

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const status = searchParams.get('status');

    const isAdmin = user.role === 'ADMIN' || user.role === 'MODERATOR';

    const where: Record<string, unknown> = {};
    if (!isAdmin) where.userId = user.id;
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return paginatedResponse(orders, total, page, limit);
  } catch {
    return serverErrorResponse();
  }
}

// POST /api/orders — create order
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const body = await request.json();
    const sanitized = sanitizeInput(body) as Record<string, unknown>;

    const items = sanitized.items as Array<{ productId: string; quantity: number }>;
    if (!items || !items.length) return errorResponse('Coșul este gol');

    // Validate required fields
    const customerName = validateRequired(sanitized.customerName, 'Numele complet');
    const phone = validateRequired(sanitized.phone, 'Telefonul');
    const emailRaw = validateRequired(sanitized.email, 'Email');
    if (!validateEmail(emailRaw)) return errorResponse('Email invalid');
    const email = emailRaw;

    if (!validatePhone(phone)) return errorResponse('Număr de telefon invalid');

    const paymentMethod = (sanitized.paymentMethod as string) || 'CASH';
    const deliveryMethod = (sanitized.deliveryMethod as string) || 'PICKUP';

    if (!['CASH', 'CARD', 'CREDIT'].includes(paymentMethod)) {
      return errorResponse('Metodă de plată invalidă');
    }
    if (!['PICKUP', 'COURIER_CHISINAU', 'COURIER_NATIONAL'].includes(deliveryMethod)) {
      return errorResponse('Metodă de livrare invalidă');
    }

    // Validate products and get prices
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== productIds.length) {
      return errorResponse('Unul sau mai multe produse nu sunt disponibile');
    }

    // Check stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product && product.stock < item.quantity) {
        return errorResponse(`Stoc insuficient pentru ${product.name}`);
      }
    }

    // Build order items
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
      };
    });

    // Calculate subtotal
    const subtotal = orderItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    // FREE shipping everywhere in Moldova
    let shippingCost = 0;
    // PICKUP is always free

    // Calculate discount (coupon)
    let discount = 0;
    let couponId: string | null = null;
    const couponCode = sanitized.couponCode as string | undefined;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (!coupon || !coupon.isActive) {
        return errorResponse('Codul promoțional nu este valid');
      }

      if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        return errorResponse('Codul promoțional a expirat');
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return errorResponse('Codul promoțional a ajuns la limita de utilizări');
      }

      if (coupon.minOrder && subtotal < coupon.minOrder) {
        return errorResponse(`Comanda minimă pentru acest cod este ${coupon.minOrder} MDL`);
      }

      if (coupon.type === 'PERCENTAGE') {
        discount = Math.round(subtotal * (coupon.value / 100));
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        // FIXED
        discount = coupon.value;
      }

      couponId = coupon.id;
    }

    // Bulk discount: 3% over 10000 MDL, 5% over 20000 MDL
    let bulkDiscount = 0;
    if (subtotal >= 20000) {
      bulkDiscount = Math.round(subtotal * 0.05);
    } else if (subtotal >= 10000) {
      bulkDiscount = Math.round(subtotal * 0.03);
    }

    const totalDiscount = discount + bulkDiscount;
    const total = subtotal - totalDiscount + shippingCost;

    // Build shipping address
    const address = (sanitized.address as string) || '';
    const city = (sanitized.city as string) || '';
    const notes = (sanitized.notes as string) || '';
    const shippingAddress = deliveryMethod === 'PICKUP'
      ? 'Ridicare din magazin — Chișinău'
      : `${city ? city + ', ' : ''}${address}${notes ? '. Notițe: ' + notes : ''}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user?.id || null,
        status: 'PENDING',
        total,
        subtotal,
        discount: totalDiscount,
        shippingCost,
        paymentMethod: paymentMethod as string,
        shippingAddress,
        phone,
        email,
        notes: notes || null,
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
          })),
        },
      },
      include: { items: true },
    });

    // Update coupon usage
    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Decrease stock
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Clear user cart if logged in
    if (user) {
      await prisma.cartItem.deleteMany({
        where: { cart: { userId: user.id } },
      });
    }

    // Send confirmation emails (non-blocking)
    const adminEmail = process.env.ADMIN_EMAIL || 'freemen92@gmail.com';
    const emailItems = orderItems.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: Number(i.price),
    }));

    console.log(`[ORDER] 📦 Creating order ${order.orderNumber} for ${email} — total ${total} MDL`);

    sendEmail({
      to: email,
      subject: `Comanda ${order.orderNumber} confirmată — Western Import`,
      html: orderConfirmationHtml(order.orderNumber, emailItems, total, {
        subtotal,
        discount: totalDiscount,
        shippingCost,
        paymentMethod,
        deliveryMethod,
        shippingAddress,
      }),
    }).then(() => {
      console.log(`[EMAIL] ✅ Confirmation sent to customer: ${email}`);
    }).catch((err) => {
      console.error(`[EMAIL] ❌ Customer confirmation failed for ${email}:`, err.message);
    });

    sendEmail({
      to: adminEmail,
      subject: `🛒 Comandă nouă: ${order.orderNumber}`,
      html: newOrderAdminHtml(order.orderNumber, {
        customerName,
        email,
        phone,
        subtotal,
        discount: totalDiscount,
        shippingCost,
        total,
        paymentMethod,
        deliveryMethod,
        shippingAddress,
        items: emailItems,
      }),
    }).then(() => {
      console.log(`[EMAIL] ✅ Admin notification sent to: ${adminEmail}`);
    }).catch((err) => {
      console.error(`[EMAIL] ❌ Admin notification failed for ${adminEmail}:`, err.message);
    });

    console.log(`[ORDER] ✅ Order ${order.orderNumber} created successfully`);

    // Generate IuteCredit redirect URL if credit payment
    let redirectUrl: string | null = null;
    if (paymentMethod === 'CREDIT') {
      // Redirect to IuteCredit website for credit application
      // When we get the real Site ID from IuteCredit, we'll switch to API integration
      const totalAmount = total;
      const returnUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://exquisite-spontaneity-production-183c.up.railway.app';
      redirectUrl = `https://iutecredit.md/apply?amount=${totalAmount}&source=western-import&return_url=${encodeURIComponent(returnUrl + '/checkout/success')}`;
    }

    return successResponse({ ...order, redirectUrl }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('obligatoriu')) return errorResponse(err.message);
    console.error(`[ORDER] ❌ Order creation failed:`, err);
    return serverErrorResponse();
  }
}
