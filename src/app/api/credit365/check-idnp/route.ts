import { NextRequest } from 'next/server';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';
import { configureCredit365, getAvailableTerms, isCredit365Configured } from '@/lib/integrations/credit365';

// POST /api/credit365/check-idnp
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

    if (!idnp || typeof idnp !== 'string' || idnp.length < 10) {
      return errorResponse('IDNP invalid');
    }

    const result = await getAvailableTerms(idnp);
    return successResponse(result);
  } catch (err) {
    console.error('[Credit365] check-idnp error:', err);
    const message = err instanceof Error ? err.message : 'Eroare Credit365';
    return errorResponse(message);
  }
}
