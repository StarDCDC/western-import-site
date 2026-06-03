// src/lib/credit365-client.ts — Client-side Credit365 API
// All requests go directly from browser to Aventus API (bypasses Cloudflare server blocking)

const BASE_URL = process.env.NEXT_PUBLIC_CREDIT365_BASE_URL || 'https://preprod.aventus.md/';
const USERNAME = process.env.NEXT_PUBLIC_CREDIT365_USERNAME || '';
const PASSWORD = process.env.NEXT_PUBLIC_CREDIT365_PASSWORD || '';
const PRODUCT_TYPE = 'credit365';

let cachedToken: string | null = null;

async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  
  const res = await fetch(`${BASE_URL}api/third-party/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  });

  if (!res.ok) throw new Error(`Autentificare Credit365 eșuată (${res.status})`);
  const data = await res.json();
  if (!data.token) throw new Error('Token lipsă');
  cachedToken = data.token;
  return cachedToken!;
}

export interface Credit365Terms {
  terms: Array<{ months: number; amounts: number[] }>;
  productId: number;
  userId: number | null;
}

export async function checkIdnp(idnp: string): Promise<Credit365Terms> {
  const token = await getToken();

  // Check IDNP and get products
  const checkRes = await fetch(`${BASE_URL}api/third-party/check-idnp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ idnp }),
  });

  if (!checkRes.ok) throw new Error(`Verificare IDNP eșuată (${checkRes.status})`);
  const checkData = await checkRes.json();

  const products = checkData.products ?? [];
  const product = products.find((p: { type: string }) => p.type === PRODUCT_TYPE);
  if (!product) throw new Error('Produsul credit365 nu este disponibil');
  
  const userId = checkData.user?.id ?? null;
  const productId = product.id;

  // Get pricelist
  const priceUrl = new URL(`${BASE_URL}api/wallet/partner/products/${productId}/prices`);
  if (userId) priceUrl.searchParams.set('user_id', String(userId));

  const priceRes = await fetch(priceUrl.toString(), {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!priceRes.ok) throw new Error(`Pricelist eșuat (${priceRes.status})`);
  const prices = await priceRes.json();

  // Parse prices: { "3": { "5000": {...}, "10000": {...} }, ... }
  const terms: Array<{ months: number; amounts: number[] }> = [];
  for (const [term, amounts] of Object.entries(prices)) {
    const months = parseInt(term);
    const amountKeys = Object.keys(amounts as Record<string, unknown>).map(Number);
    terms.push({ months, amounts: amountKeys });
  }

  return { terms, productId, userId };
}

export async function submitLoanRequest(params: {
  idnp: string;
  lastName: string;
  firstName: string;
  phone: number;
  email: string | null;
  productId: number;
  amount: number;
  duration: number;
  birthDate: string;
  gender: number;
  commodityName: string;
  passportBase64?: string | null;
}): Promise<number> {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}api/wallet/partner/wallet-loan-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      idnp: params.idnp,
      last_name: params.lastName,
      first_name: params.firstName,
      main_phone_number: params.phone,
      email: params.email,
      product_id: params.productId,
      amount: params.amount,
      duration: params.duration,
      giveout_method: 8,
      approval_pep: 0,
      first_payment_date: null,
      birth_date: params.birthDate,
      gender: params.gender,
      commodity_category: 1,
      commodity_name: params.commodityName,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cerere eșuată: ${errText}`);
  }
  const data = await res.json();

  // Upload passport if provided
  if (params.passportBase64 && data.ApplicationId) {
    await fetch(`${BASE_URL}api/wallet/partner/wallet-loan-requests/${data.ApplicationId}/document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        Content: params.passportBase64,
        Name: 'passport_front',
        Type: 0,
      }),
    });
  }

  return data.ApplicationId;
}

export async function confirmRequest(applicationId: number, smsCode: string): Promise<void> {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}api/wallet/partner/wallet-loan-requests/${applicationId}/confirm-request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ code: smsCode }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Confirmare eșuată: ${errText}`);
  }
}

export async function getRequestStatus(applicationId: number): Promise<Record<string, unknown>> {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}api/wallet/partner/wallet-loan-requests/${applicationId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Status eșuat (${res.status})`);
  return await res.json();
}

export function isCredit365Configured(): boolean {
  return !!USERNAME && !!PASSWORD;
}
