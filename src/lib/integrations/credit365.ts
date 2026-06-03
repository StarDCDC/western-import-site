// src/lib/integrations/credit365.ts — Credit365 Partner API Integration
// API Docs: Postman collection from Aventus Group

export interface Credit365Config {
  baseUrl: string;
  username: string;
  password: string;
  productType: string;
}

const DEFAULT_CONFIG: Credit365Config = {
  baseUrl: 'https://preprod.aventus.md/',
  username: '',
  password: '',
  productType: 'credit365',
};

let config: Credit365Config = { ...DEFAULT_CONFIG };

// Browser-like headers to bypass Cloudflare
const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7',
  'Origin': 'https://credit365.md',
  'Referer': 'https://credit365.md/',
};

export function configureCredit365(userConfig: Partial<Credit365Config>): void {
  config = { ...DEFAULT_CONFIG, ...userConfig };
}

export function getCredit365Config(): Credit365Config {
  return { ...config };
}

export function isCredit365Configured(): boolean {
  return !!config.username && !!config.password;
}

// ─── Step 1: Authentication ────────────────────────────────────────
interface AuthResponse {
  token: string;
}

export async function authenticate(): Promise<string> {
  const res = await fetch(`${config.baseUrl}api/third-party/auth`, {
    method: 'POST',
    headers: { ...BROWSER_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: config.username, password: config.password }),
  });

  if (!res.ok) throw new Error(`Credit365 auth failed: ${res.status}`);
  const data: AuthResponse = await res.json();
  if (!data.token) throw new Error('Credit365 auth: no token returned');
  return data.token;
}

// ─── Step 2: Check IDNP + Get Products ─────────────────────────────
interface CheckIdnpResponse {
  products: Array<{ id: number; type: string }>;
  user: { id: number } | null;
}

export async function checkIdnp(token: string, idnp: string): Promise<{
  productId: number;
  userId: number | null;
}> {
  const res = await fetch(`${config.baseUrl}api/third-party/check-idnp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ idnp }),
  });

  if (!res.ok) throw new Error(`Credit365 check-idnp failed: ${res.status}`);
  const data: CheckIdnpResponse = await res.json();

  // Find credit365 product
  const product = (data.products || []).find(
    (p) => p.type === config.productType
  );

  if (!product) throw new Error('Credit365: produsul credit365 nu este disponibil pentru acest IDNP');

  return {
    productId: product.id,
    userId: data.user?.id ?? null,
  };
}

// ─── Step 3: Get Pricelist ─────────────────────────────────────────
// Returns: { "3": { "5000": {...}, "10000": {...} }, "6": { ... } }
export async function getPricelist(
  token: string,
  productId: number,
  userId: number | null
): Promise<Record<string, Record<string, unknown>>> {
  const url = new URL(`${config.baseUrl}api/wallet/partner/products/${productId}/prices`);
  if (userId) url.searchParams.set('user_id', String(userId));

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { ...BROWSER_HEADERS, 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Credit365 pricelist failed: ${res.status}`);
  return await res.json();
}

// ─── Step 4: Submit Loan Request ───────────────────────────────────
interface LoanRequestParams {
  idnp: string;
  lastName: string;
  firstName: string;
  phone: number;
  email: string | null;
  productId: number;
  amount: number;
  duration: number;
  birthDate: string; // YYYY-MM-DD
  gender: 1 | 2; // 1 = male, 2 = female
  commodityName: string; // product name being purchased
}

interface LoanRequestResponse {
  ApplicationId: number;
}

export async function submitLoanRequest(
  token: string,
  params: LoanRequestParams
): Promise<number> {
  const res = await fetch(`${config.baseUrl}api/wallet/partner/wallet-loan-requests`, {
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
      giveout_method: 8, // card
      approval_pep: 0,
      first_payment_date: null,
      birth_date: params.birthDate,
      gender: params.gender,
      commodity_category: 1, // electronics/goods
      commodity_name: params.commodityName,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Credit365 loan request failed: ${res.status} — ${errText}`);
  }
  const data: LoanRequestResponse = await res.json();
  return data.ApplicationId;
}

// ─── Step 5: Upload Document (passport photo) ──────────────────────
export async function uploadDocument(
  token: string,
  requestId: number,
  base64Image: string,
  docName: string = 'passport_front',
  docType: number = 0 // 0 = front
): Promise<void> {
  const res = await fetch(
    `${config.baseUrl}api/wallet/partner/wallet-loan-requests/${requestId}/document`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        Content: base64Image,
        Name: docName,
        Type: docType,
      }),
    }
  );

  if (!res.ok) throw new Error(`Credit365 upload document failed: ${res.status}`);
}

// ─── Step 6: Confirm with SMS Code ─────────────────────────────────
export async function confirmRequest(
  token: string,
  requestId: number,
  smsCode: string
): Promise<void> {
  const res = await fetch(
    `${config.baseUrl}api/wallet/partner/wallet-loan-requests/${requestId}/confirm-request`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ code: smsCode }),
    }
  );

  if (!res.ok) throw new Error(`Credit365 confirm failed: ${res.status}`);
}

// ─── Step 7: Get Request Status ────────────────────────────────────
interface LoanRequestStatus {
  ApplicationId: number;
  Status: string;
  LoanData?: {
    LoanId: number;
  };
  [key: string]: unknown;
}

export async function getRequestStatus(
  token: string,
  requestId: number
): Promise<LoanRequestStatus> {
  const res = await fetch(
    `${config.baseUrl}api/wallet/partner/wallet-loan-requests/${requestId}`,
    {
      method: 'GET',
      headers: { ...BROWSER_HEADERS, 'Authorization': `Bearer ${token}` },
    }
  );

  if (!res.ok) throw new Error(`Credit365 get status failed: ${res.status}`);
  return await res.json();
}

// ─── Step 7.1: Get Payment Schedule ────────────────────────────────
export async function getLoanSchedule(
  token: string,
  requestId: number
): Promise<unknown> {
  const res = await fetch(
    `${config.baseUrl}api/wallet/partner/wallet-loan-requests/${requestId}/loan-schedule`,
    {
      method: 'GET',
      headers: { ...BROWSER_HEADERS, 'Authorization': `Bearer ${token}` },
    }
  );

  if (!res.ok) throw new Error(`Credit365 get schedule failed: ${res.status}`);
  return await res.json();
}

// ─── Step 8: Cancel Request ────────────────────────────────────────
export async function cancelRequest(
  token: string,
  requestId: number,
  reason: number = 4
): Promise<void> {
  const res = await fetch(
    `${config.baseUrl}api/wallet/partner/wallet-loan-requests/${requestId}/cancel`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    }
  );

  if (!res.ok) throw new Error(`Credit365 cancel failed: ${res.status}`);
}

// ─── Full Flow: Check + Get Prices ─────────────────────────────────
export async function getAvailableTerms(idnp: string): Promise<{
  terms: Array<{ months: number; amounts: number[] }>;
  productId: number;
  userId: number | null;
}> {
  const token = await authenticate();
  const { productId, userId } = await checkIdnp(token, idnp);
  const prices = await getPricelist(token, productId, userId);

  // Parse prices: { "3": { "5000": {...}, "10000": {...} }, ... }
  const terms: Array<{ months: number; amounts: number[] }> = [];
  for (const [term, amounts] of Object.entries(prices)) {
    const months = parseInt(term);
    const amountKeys = Object.keys(amounts as Record<string, unknown>).map(Number);
    terms.push({ months, amounts: amountKeys });
  }

  return { terms, productId, userId };
}
