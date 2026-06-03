import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import {
  configureCredit365,
  authenticate,
  getRequestStatus,
  isCredit365Configured,
} from '@/lib/integrations/credit365';

// POST /api/credit365/status — check application status
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
    const { applicationId } = body;

    if (!applicationId) return errorResponse('Application ID obligatoriu');

    const token = await authenticate();
    const status = await getRequestStatus(token, Number(applicationId));

    return successResponse(status);
  } catch (err) {
    console.error('[Credit365] status error:', err);
    const message = err instanceof Error ? err.message : 'Eroare Credit365';
    return errorResponse(message);
  }
}
