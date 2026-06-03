import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { configureCredit365, authenticate, isCredit365Configured } from '@/lib/integrations/credit365';

// POST /api/credit365/init — get auth token for client-side requests
// Client will use this token to call Aventus API directly (bypasses Cloudflare server blocking)
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

    const token = await authenticate();
    return successResponse({
      token,
      baseUrl: process.env.CREDIT365_BASE_URL || 'https://preprod.aventus.md/',
    });
  } catch (err) {
    console.error('[Credit365] init error:', err);
    const message = err instanceof Error ? err.message : 'Eroare Credit365';
    return errorResponse(message);
  }
}
