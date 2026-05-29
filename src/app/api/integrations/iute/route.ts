// src/app/api/integrations/iute/route.ts — IuteCredit API Proxy
// Full integration: credit calculations, checkout sessions, applications, webhooks, status
import { NextRequest } from 'next/server';
import {
  configureIuteCredit,
  calculateMonthlyPayment,
  getAllCreditPlans,
  generateCheckoutUrl,
  generateCreditLink,
  createCheckoutSession,
  submitCreditApplication,
  getCreditStatus,
  testConnection,
  verifyWebhookSignature,
  isIuteCreditConfigured,
  AVAILABLE_MONTHS,
  type CreditPlan,
  type CreditApplicationRequest,
} from '@/lib/integrations/iuteCredit';
import prisma from '@/lib/prisma';

// Helper: load config from env
function loadConfig() {
  configureIuteCredit({
    apiKey: process.env.IUTE_CREDIT_API_KEY || '',
    partnerId: process.env.IUTE_CREDIT_PARTNER_ID || '',
    siteId: process.env.IUTE_CREDIT_SITE_ID || '',
    endpoint: process.env.IUTE_CREDIT_ENDPOINT || 'https://api.iutecredit.md/v1',
    checkoutUrl: process.env.IUTE_CREDIT_CHECKOUT_URL || 'https://checkout.iutecredit.md',
  });
}

// ─── GET ──────────────────────────────────────────────────────────
// Various read operations based on `action` query param

export async function GET(request: NextRequest) {
  try {
    loadConfig();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const productId = searchParams.get('productId');
    const applicationId = searchParams.get('applicationId');

    // ── Test connection ──
    if (action === 'test') {
      if (!isIuteCreditConfigured()) {
        return Response.json({
          success: false,
          configured: false,
          message: 'IuteCredit nu este configurat. Adaugă IUTE_CREDIT_API_KEY, IUTE_CREDIT_PARTNER_ID, IUTE_CREDIT_SITE_ID în .env',
        });
      }
      const result = await testConnection();
      return Response.json({ success: result.success, configured: true, data: result });
    }

    // ── Check application status ──
    if (action === 'status' && applicationId) {
      if (!isIuteCreditConfigured()) {
        return Response.json({ success: false, error: 'IuteCredit nu este configurat' }, { status: 503 });
      }
      try {
        const status = await getCreditStatus(applicationId);
        return Response.json({ success: true, data: status });
      } catch {
        return Response.json({ success: false, error: 'Aplicația nu a fost găsită' }, { status: 404 });
      }
    }

    // ── Check if configured ──
    if (action === 'config') {
      return Response.json({
        success: true,
        configured: isIuteCreditConfigured(),
        hasApiKey: !!(process.env.IUTE_CREDIT_API_KEY),
        hasPartnerId: !!(process.env.IUTE_CREDIT_PARTNER_ID),
        hasSiteId: !!(process.env.IUTE_CREDIT_SITE_ID),
      });
    }

    // ── Get credit calculations for a product ──
    if (!productId) {
      return Response.json({ success: false, error: 'productId este obligatoriu (sau action=test/status/config)' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true, brand: true },
    });

    if (!product) {
      return Response.json({ success: false, error: 'Produsul nu a fost găsit' }, { status: 404 });
    }

    const plans: CreditPlan[] = getAllCreditPlans(product.price);
    const bestPlan = plans[plans.length - 1];

    const responseData: Record<string, unknown> = {
      productId: product.id,
      productName: product.name,
      price: product.price,
      currency: 'MDL',
      plans,
      bestPlan,
    };

    // Generate checkout URL if configured
    let checkoutLink: string;
    if (isIuteCreditConfigured()) {
      checkoutLink = generateCheckoutUrl(product.id, product.name, product.price);
      responseData.creditLink = checkoutLink;
    } else {
      checkoutLink = generateCreditLink(productId, product.price);
      responseData.creditLink = checkoutLink;
    }

    // If accessed directly from browser (Accept: text/html), redirect to checkout
    const accept = request.headers.get('accept') || '';
    if (accept.includes('text/html')) {
      return Response.redirect(checkoutLink);
    }

    return Response.json({ success: true, data: responseData });
  } catch (error) {
    console.error('[IuteCredit] GET error:', error);
    return Response.json(
      { success: false, error: `Eroare: ${error instanceof Error ? error.message : 'Eroare internă'}` },
      { status: 500 }
    );
  }
}

// ─── POST ─────────────────────────────────────────────────────────
// Submit credit application or create checkout session

export async function POST(request: NextRequest) {
  try {
    loadConfig();

    const body = await request.json();
    const { action, ...data } = body;

    // ── Test connection ──
    if (action === 'test') {
      if (!isIuteCreditConfigured()) {
        return Response.json({
          success: false,
          configured: false,
          message: 'IuteCredit nu este configurat. Adaugă cheile în .env',
        });
      }
      const result = await testConnection();
      return Response.json({ success: result.success, configured: true, data: result });
    }

    // ── Create checkout session ──
    if (action === 'checkout') {
      const { productId, months, customerPhone, customerEmail } = data;
      if (!productId || !months) {
        return Response.json({ success: false, error: 'productId și months sunt obligatorii' }, { status: 400 });
      }

      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        return Response.json({ success: false, error: 'Produsul nu a fost găsit' }, { status: 404 });
      }

      if (!AVAILABLE_MONTHS.includes(months)) {
        return Response.json({ success: false, error: `Perioadă invalidă. Valide: ${AVAILABLE_MONTHS.join(', ')}` }, { status: 400 });
      }

      // If API configured, create real checkout session
      if (isIuteCreditConfigured()) {
        try {
          const session = await createCheckoutSession({
            productId: product.id,
            productName: product.name,
            price: product.price,
            months,
            customerPhone,
            customerEmail,
          });
          return Response.json({ success: true, data: session });
        } catch (err) {
          console.error('[IuteCredit] Checkout session error:', err);
          // Fall through to fallback
        }
      }

      // Fallback: generate checkout URL
      const checkoutUrl = generateCheckoutUrl(product.id, product.name, product.price, months);
      const monthlyPayment = calculateMonthlyPayment(product.price, months);

      return Response.json({
        success: true,
        data: {
          sessionId: `IUTE-${Date.now()}`,
          checkoutUrl,
          status: 'created',
          amount: product.price,
          months,
          monthlyPayment,
        },
      });
    }

    // ── Submit credit application ──
    const { productId, months, customerName, customerPhone, customerEmail, customerPin, monthlyIncome } = data;

    if (!productId || !months || !customerName || !customerPhone) {
      return Response.json(
        { success: false, error: 'Date incomplete: productId, months, customerName, customerPhone sunt obligatorii' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return Response.json({ success: false, error: 'Produsul nu a fost găsit' }, { status: 404 });
    }

    if (!AVAILABLE_MONTHS.includes(months)) {
      return Response.json(
        { success: false, error: `Perioadă invalidă. Valide: ${AVAILABLE_MONTHS.join(', ')}` },
        { status: 400 }
      );
    }

    // If API is configured, submit to IuteCredit
    if (isIuteCreditConfigured()) {
      try {
        const application: CreditApplicationRequest = {
          productId,
          productName: product.name,
          price: product.price,
          months,
          customerName,
          customerPhone,
          customerEmail: customerEmail || '',
          customerPin: customerPin || '',
          monthlyIncome,
        };

        const result = await submitCreditApplication(application);

        // Log to DB
        await prisma.auditLog.create({
          data: {
            userId: 'system',
            action: 'CREDIT_APPLICATION',
            entity: 'IuteCredit',
            entityId: result.applicationId,
            details: JSON.stringify({ productId, months, amount: product.price }),
          },
        });

        return Response.json({ success: true, data: result });
      } catch (err) {
        console.error('[IuteCredit] Application error:', err);
        // Fall through to fallback
      }
    }

    // Fallback: return generated link
    const link = generateCreditLink(productId, product.price, months);
    const monthlyPayment = calculateMonthlyPayment(product.price, months);

    return Response.json({
      success: true,
      data: {
        applicationId: `IUTE-${Date.now()}`,
        status: 'pending' as const,
        redirectUrl: link,
        monthlyPayment,
        months,
        totalAmount: monthlyPayment * months,
      },
    });
  } catch (error) {
    console.error('[IuteCredit] POST error:', error);
    return Response.json(
      { success: false, error: `Eroare: ${error instanceof Error ? error.message : 'Eroare internă'}` },
      { status: 500 }
    );
  }
}

// ─── PUT ──────────────────────────────────────────────────────────
// Webhook receiver — IuteCredit calls this to notify about status changes

export async function PUT(request: NextRequest) {
  try {
    loadConfig();

    const body = await request.text();
    const signature = request.headers.get('X-Iute-Signature') || '';
    const eventType = request.headers.get('X-Iute-Event') || '';

    // Verify signature (if API is configured)
    if (isIuteCreditConfigured() && !verifyWebhookSignature(body, signature)) {
      return Response.json({ success: false, error: 'Semnătură invalidă' }, { status: 401 });
    }

    const data = JSON.parse(body);

    // Log the webhook event
    await prisma.auditLog.create({
      data: {
        userId: 'iute-webhook',
        action: `WEBHOOK_${eventType.toUpperCase()}`,
        entity: 'IuteCredit',
        entityId: data.applicationId || 'unknown',
        details: body,
      },
    });

    // If there's an order associated with this application, update it
    if (data.metadata?.orderId) {
      const orderStatusMap: Record<string, string> = {
        'application.approved': 'confirmed',
        'application.rejected': 'cancelled',
        'application.disbursed': 'delivered',
        'application.cancelled': 'cancelled',
      };

      const newStatus = orderStatusMap[eventType];
      if (newStatus) {
        await prisma.order.update({
          where: { id: data.metadata.orderId },
          data: { status: newStatus },
        }).catch(() => {
          // Order might not exist
        });
      }
    }

    return Response.json({ success: true, event: eventType });
  } catch (error) {
    console.error('[IuteCredit] Webhook error:', error);
    return Response.json(
      { success: false, error: 'Webhook processing error' },
      { status: 500 }
    );
  }
}
