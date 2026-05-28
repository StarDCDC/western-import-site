// src/app/api/integrations/999/route.ts — API proxy for 999.md integration
import { NextRequest } from 'next/server';
import {
  configureNineNineMd,
  getNineNineMdConfig,
  uploadProduct,
  syncProducts,
  syncStock,
  syncPrice,
  deleteProduct,
  testConnection,
  type LocalProduct,
} from '@/lib/integrations/nineNineMd';
import { products as mockProducts } from '@/lib/data';

// Helper: check admin
function isAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  // In production, validate JWT/session properly
  return !!authHeader;
}

// Helper: load config from localStorage-equivalent (env or settings store)
function loadConfig() {
  configureNineNineMd({
    apiKey: process.env.NINE_MD_API_KEY || '',
    endpoint: process.env.NINE_MD_ENDPOINT || 'https://api.999.md/api/v1',
  });
}

// Helper: convert mock product to LocalProduct
function toLocalProduct(p: typeof mockProducts[0]): LocalProduct {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    condition: p.condition,
    price: p.price,
    oldPrice: p.oldPrice,
    description: p.description,
    images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? [p.images] : []),
    specs: p.specs,
    inStock: p.inStock,
  };
}

// POST /api/integrations/999
export async function POST(request: NextRequest) {
  try {
    loadConfig();

    const body = await request.json();
    const { action, productId } = body as { action: 'sync' | 'upload' | 'delete' | 'test'; productId?: string };

    if (!action) {
      return Response.json({ success: false, error: 'Acțiunea este obligatorie' }, { status: 400 });
    }

    // Test connection
    if (action === 'test') {
      const result = await testConnection();
      return Response.json({ success: result.success, data: result });
    }

    // Check admin
    if (!isAdmin(request)) {
      return Response.json({ success: false, error: 'Neautorizat' }, { status: 401 });
    }

    const cfg = getNineNineMdConfig();
    if (!cfg.apiKey) {
      return Response.json({ success: false, error: '999.md API key nu este configurată' }, { status: 400 });
    }

    switch (action) {
      case 'upload': {
        if (!productId) {
          return Response.json({ success: false, error: 'productId este obligatoriu pentru upload' }, { status: 400 });
        }
        const product = mockProducts.find((p) => p.id === productId);
        if (!product) {
          return Response.json({ success: false, error: 'Produsul nu a fost găsit' }, { status: 404 });
        }
        const result = await uploadProduct(toLocalProduct(product));
        return Response.json({ success: result.success, data: result });
      }

      case 'sync': {
        const localProducts = mockProducts.map(toLocalProduct);
        const result = await syncProducts(localProducts);
        return Response.json({ success: true, data: result });
      }

      case 'delete': {
        if (!productId) {
          return Response.json({ success: false, error: 'productId este obligatoriu pentru delete' }, { status: 400 });
        }
        const result = await deleteProduct(productId);
        return Response.json({ success: result.success, data: result });
      }

      default:
        return Response.json({ success: false, error: `Acțiune necunoscută: ${action}` }, { status: 400 });
    }
  } catch (error) {
    return Response.json(
      { success: false, error: `Eroare: ${error instanceof Error ? error.message : 'Eroare internă'}` },
      { status: 500 }
    );
  }
}

// GET /api/integrations/999 — get 999.md config status
export async function GET() {
  loadConfig();
  const cfg = getNineNineMdConfig();
  return Response.json({
    success: true,
    data: {
      configured: !!cfg.apiKey,
      endpoint: cfg.endpoint,
    },
  });
}
