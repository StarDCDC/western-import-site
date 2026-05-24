// src/app/api/integrations/iute/route.ts — API proxy for IuteCredit integration
import { NextRequest } from 'next/server';
import {
  configureIuteCredit,
  calculateMonthlyPayment,
  getAllCreditPlans,
  generateCreditLink,
  submitCreditApplication,
  getCreditStatus,
  testConnection,
  AVAILABLE_MONTHS,
  type CreditPlan,
  type CreditApplicationRequest,
} from '@/lib/integrations/iuteCredit';
import { getProductById } from '@/lib/data';

// Helper: load config
function loadConfig() {
  configureIuteCredit({
    apiKey: process.env.IUTE_CREDIT_API_KEY || '',
    partnerId: process.env.IUTE_CREDIT_PARTNER_ID || '',
    endpoint: process.env.IUTE_CREDIT_ENDPOINT || 'https://api.iute.md/v1',
  });
}

// GET /api/integrations/iute?productId=xxx — returns credit calculations for a product
export async function GET(request: NextRequest) {
  try {
    loadConfig();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const applicationId = searchParams.get('applicationId');
    const action = searchParams.get('action');

    // Check application status
    if (action === 'status' && applicationId) {
      const cfg = configureIuteCredit;
      try {
        const status = await getCreditStatus(applicationId);
        return Response.json({ success: true, data: status });
      } catch {
        return Response.json({ success: false, error: 'Aplicația nu a fost găsită' }, { status: 404 });
      }
    }

    // Get credit calculations for a product
    if (!productId) {
      return Response.json({ success: false, error: 'productId este obligatoriu' }, { status: 400 });
    }

    const product = getProductById(productId);
    if (!product) {
      return Response.json({ success: false, error: 'Produsul nu a fost găsit' }, { status: 404 });
    }

    const plans: CreditPlan[] = getAllCreditPlans(product.price);
    const bestPlan = plans[plans.length - 1];

    return Response.json({
      success: true,
      data: {
        productId: product.id,
        productName: product.name,
        price: product.price,
        plans,
        bestPlan,
        creditLink: generateCreditLink(productId, product.price),
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: `Eroare: ${error instanceof Error ? error.message : 'Eroare internă'}` },
      { status: 500 }
    );
  }
}

// POST /api/integrations/iute — submit credit application
export async function POST(request: NextRequest) {
  try {
    loadConfig();

    const body = await request.json();
    const { action, ...data } = body;

    // Test connection
    if (action === 'test') {
      const result = await testConnection();
      return Response.json({ success: result.success, data: result });
    }

    // Apply for credit
    const { productId, months, customerName, customerPhone, customerEmail, customerPin } = data;

    if (!productId || !months || !customerName || !customerPhone) {
      return Response.json(
        { success: false, error: 'Date incomplete: productId, months, customerName, customerPhone sunt obligatorii' },
        { status: 400 }
      );
    }

    const product = getProductById(productId);
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
    const cfg = {
      apiKey: process.env.IUTE_CREDIT_API_KEY || '',
      partnerId: process.env.IUTE_CREDIT_PARTNER_ID || '',
    };

    if (cfg.apiKey) {
      const application: CreditApplicationRequest = {
        productId,
        productName: product.name,
        price: product.price,
        months,
        customerName,
        customerPhone,
        customerEmail: customerEmail || '',
        customerPin: customerPin || '',
      };

      const result = await submitCreditApplication(application);
      return Response.json({ success: true, data: result });
    }

    // Fallback: return a generated link (no real API connection)
    const link = generateCreditLink(productId, product.price, months);
    const monthlyPayment = calculateMonthlyPayment(product.price, months);

    return Response.json({
      success: true,
      data: {
        applicationId: `IUTE-${Date.now()}`,
        status: 'pending',
        redirectUrl: link,
        monthlyPayment,
        months,
        totalAmount: monthlyPayment * months,
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: `Eroare: ${error instanceof Error ? error.message : 'Eroare internă'}` },
      { status: 500 }
    );
  }
}
