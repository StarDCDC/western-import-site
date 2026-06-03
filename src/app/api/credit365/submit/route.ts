import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import {
  configureCredit365,
  authenticate,
  submitLoanRequest,
  uploadDocument,
  isCredit365Configured,
} from '@/lib/integrations/credit365';

// POST /api/credit365/submit — submit loan application
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
    const { idnp, lastName, firstName, phone, email, productId, amount, duration, birthDate, gender, commodityName, passportBase64 } = body;

    if (!idnp || !lastName || !firstName || !phone || !productId || !amount || !duration || !birthDate || !gender) {
      return errorResponse('Toate câmpurile sunt obligatorii');
    }

    const token = await authenticate();

    const applicationId = await submitLoanRequest(token, {
      idnp,
      lastName,
      firstName,
      phone: Number(phone),
      email: email || null,
      productId: Number(productId),
      amount: Number(amount),
      duration: Number(duration),
      birthDate,
      gender,
      commodityName: commodityName || 'Produse diverse',
    });

    // Upload passport if provided
    if (passportBase64) {
      await uploadDocument(token, applicationId, passportBase64);
    }

    return successResponse({ applicationId });
  } catch (err) {
    console.error('[Credit365] submit error:', err);
    const message = err instanceof Error ? err.message : 'Eroare Credit365';
    return errorResponse(message);
  }
}
