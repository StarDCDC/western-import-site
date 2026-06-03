import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import {
  configureCredit365,
  authenticate,
  checkIdnp,
  getPricelist,
  isCredit365Configured,
} from '@/lib/integrations/credit365';

// POST /api/credit365/prices — get price list for a product
export async function POST(request: NextRequest) {
  try {
    configureCredit365({
      baseUrl: process.env.CREDIT365_BASE_URL || 'https://preprod.aventus.md/',
      username: process.env.CREDIT365_USERNAME || '',
      password: process.env.CREDIT365_PASSWORD || '',
    });

    if (!isCredit365Configured()) {
      return errorResponse('Credit365 nu este configurat', 503);
    }

    const body = await request.json();
    const { idnp } = body;

    if (!idnp) return errorResponse('IDNP obligatoriu');

    const token = await authenticate();
    const { productId, userId } = await checkIdnp(token, idnp);
    const prices = await getPricelist(token, productId, userId);

    return successResponse({ prices, productId, userId });
  } catch (err) {
    console.error('[Credit365] prices error:', err);
    const message = err instanceof Error ? err.message : 'Eroare Credit365';
    return errorResponse(message);
  }
}
