// src/app/api/integrations/iute/route.ts — IuteCredit Admin API Proxy
// Conform docs: https://ecom-docs.iutecredit.md/docs/public/one-page-guide.html
//
// Real endpoints (admin key in header x-iute-admin-key):
//   GET /api/v1/eshop/management/eshop-order-status?orderId=...  (v1)
//   GET /api/v2/eshop/management/eshop-order-status?orderId=...  (v2, includes SIGNED status)
//   GET /api/v1/eshop/management/loan-product                    (list loan products)
//   GET /api/v1/eshop/management/product-mapping?skus=...        (read mappings)
//   POST /api/v2/eshop/management/product-mapping?batch=true      (create mappings)

import { NextRequest } from 'next/server';
import {
  configureIuteCredit,
  checkOrderStatus,
  getLoanProducts,
  getProductMappings,
  createProductMappings,
  isIuteCreditConfigured,
  hasAdminKey,
  mapIuteStatusToOrder,
} from '@/lib/integrations/iuteCredit';
import prisma from '@/lib/prisma';

// Load config from env
function loadConfig() {
  configureIuteCredit({
    publicKey: process.env.NEXT_PUBLIC_IUTE_CREDIT_API_KEY || '',
    adminKey: process.env.IUTE_CREDIT_ADMIN_API_KEY || '',
  });
}

// ─── GET ──────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  loadConfig();

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  // ── Check configuration ──
  if (action === 'config') {
    return Response.json({
      success: true,
      configured: isIuteCreditConfigured(),
      hasPublicKey: !!(process.env.NEXT_PUBLIC_IUTE_CREDIT_API_KEY),
      hasAdminKey: hasAdminKey(),
    });
  }

  // ── All admin actions require admin key ──
  if (!hasAdminKey()) {
    return Response.json({
      success: false,
      error: 'IuteCredit Admin API key nu este configurată. Adaugă IUTE_CREDIT_ADMIN_API_KEY în .env',
    }, { status: 503 });
  }

  try {
    // ── Check order status (conform docs: v1/v2 endpoint) ──
    // GET ?action=status&orderId=...&version=2
    if (action === 'status') {
      const orderId = searchParams.get('orderId');
      if (!orderId) {
        return Response.json({ success: false, error: 'orderId este obligatoriu' }, { status: 400 });
      }

      const version = searchParams.get('version') === '1' ? 1 : 2;
      const result = await checkOrderStatus(orderId, version);

      return Response.json({ success: true, data: result });
    }

    // ── List loan products ──
    // GET ?action=loan-products
    if (action === 'loan-products') {
      const products = await getLoanProducts();
      return Response.json({ success: true, data: products });
    }

    // ── Read product mappings ──
    // GET ?action=mappings&skus=sku1,sku2
    if (action === 'mappings') {
      const skusParam = searchParams.get('skus');
      const skus = skusParam ? skusParam.split(',') : undefined;
      const mappings = await getProductMappings(skus);
      return Response.json({ success: true, data: mappings });
    }

    return Response.json({
      success: false,
      error: 'Acțiune necunoscută. Valide: config, status, loan-products, mappings',
    }, { status: 400 });
  } catch (error) {
    console.error('[IuteCredit] GET error:', error);
    return Response.json(
      { success: false, error: `Eroare: ${error instanceof Error ? error.message : 'Eroare internă'}` },
      { status: 500 }
    );
  }
}

// ─── POST ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  loadConfig();

  if (!hasAdminKey()) {
    return Response.json({
      success: false,
      error: 'IuteCredit Admin API key nu este configurată',
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    // ── Create product mappings (conform docs: POST /api/v2/.../product-mapping?batch=true) ──
    // POST { action: "create-mappings", mappings: [{ sku: "...", loanProductId: "..." }] }
    if (action === 'create-mappings') {
      const { mappings } = body;
      if (!mappings || !Array.isArray(mappings) || mappings.length === 0) {
        return Response.json({ success: false, error: 'mappings array este obligatoriu' }, { status: 400 });
      }

      const result = await createProductMappings(mappings);
      return Response.json({ success: true, data: result });
    }

    // ── Sync pending orders status ──
    // POST { action: "sync-orders" }
    // Checks all pending iutepay orders against IuteCredit API (recommended: 5 min cron)
    if (action === 'sync-orders') {
      const pendingOrders = await prisma.order.findMany({
        where: {
          paymentMethod: 'iutepay',
          status: { in: ['pending', 'confirmed'] },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      const results: Array<{ orderId: string; oldStatus: string; newStatus: string }> = [];

      for (const order of pendingOrders) {
        try {
          let iuteOrderId = order.id;
          // Check if we stored a checkout session ID in metadata
          const meta = JSON.parse((order as Record<string, unknown>).metadata as string || '{}');
          if (meta.iuteOrderId) {
            iuteOrderId = meta.iuteOrderId;
          }

          const statusResult = await checkOrderStatus(iuteOrderId, 2);
          const newStatus = mapIuteStatusToOrder(statusResult.status);

          if (newStatus !== order.status) {
            await prisma.order.update({
              where: { id: order.id },
              data: { status: newStatus },
            });
            results.push({ orderId: order.id, oldStatus: order.status, newStatus });
          }
        } catch {
          // Skip orders that can't be checked (might not exist in IutePay yet)
        }
      }

      return Response.json({ success: true, data: { checked: pendingOrders.length, updated: results.length, results } });
    }

    return Response.json({
      success: false,
      error: 'Acțiune necunoscută. Valide: create-mappings, sync-orders',
    }, { status: 400 });
  } catch (error) {
    console.error('[IuteCredit] POST error:', error);
    return Response.json(
      { success: false, error: `Eroare: ${error instanceof Error ? error.message : 'Eroare internă'}` },
      { status: 500 }
    );
  }
}
