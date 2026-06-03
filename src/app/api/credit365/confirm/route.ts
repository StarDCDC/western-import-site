import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import {
  configureCredit365,
  authenticate,
  confirmRequest,
  isCredit365Configured,
} from '@/lib/integrations/credit365';

// POST /api/credit365/confirm — confirm with SMS code
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
    const { applicationId, smsCode } = body;

    if (!applicationId || !smsCode) {
      return errorResponse('Application ID și cod SMS obligatorii');
    }

    const token = await authenticate();
    await confirmRequest(token, Number(applicationId), String(smsCode));

    return successResponse({ confirmed: true });
  } catch (err) {
    console.error('[Credit365] confirm error:', err);
    const message = err instanceof Error ? err.message : 'Eroare Credit365';
    return errorResponse(message);
  }
}
