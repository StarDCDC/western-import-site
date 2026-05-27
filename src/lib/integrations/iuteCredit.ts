// src/lib/integrations/iuteCredit.ts — IuteCredit Integration (Complete)
// Ready for production — needs IUTE_CREDIT_API_KEY, IUTE_CREDIT_PARTNER_ID, IUTE_CREDIT_SITE_ID from Costel

// ─── Configuration ────────────────────────────────────────────────
export interface IuteCreditConfig {
  apiKey: string;       // API Key from IuteCredit partner dashboard
  partnerId: string;    // Partner ID
  siteId: string;       // Site ID (for checkout widget)
  endpoint: string;     // API endpoint
  checkoutUrl: string;  // Checkout widget URL
  country: string;      // Country code: md, al, bg, me, mk, ba, xk
  currency: string;     // Currency: MDL, ALL, BGN, EUR
  timeout?: number;
}

const DEFAULT_CONFIG: IuteCreditConfig = {
  apiKey: '',
  partnerId: '',
  siteId: '',
  endpoint: 'https://api.iutecredit.md/v1',
  checkoutUrl: 'https://checkout.iutecredit.md',
  country: 'md',
  currency: 'MDL',
  timeout: 15000,
};

let config: IuteCreditConfig = { ...DEFAULT_CONFIG };

export function configureIuteCredit(userConfig: Partial<IuteCreditConfig>): void {
  config = { ...DEFAULT_CONFIG, ...userConfig };
}

export function getIuteCreditConfig(): IuteCreditConfig {
  return { ...config };
}

export function isIuteCreditConfigured(): boolean {
  return !!(config.apiKey && config.partnerId);
}

// ─── Data Types ───────────────────────────────────────────────────
export interface CreditPlan {
  months: number;
  interestRate: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  downPayment: number;
  isZeroInterest: boolean;
}

export interface CreditApplication {
  applicationId: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'cancelled';
  amount: number;
  months: number;
  monthlyPayment: number;
  createdAt: string;
  redirectUrl?: string;
}

export interface CreditApplicationRequest {
  productId: string;
  productName: string;
  price: number;
  months: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerPin?: string;       // IDNP
  monthlyIncome?: number;
}

export interface CreditStatusResponse {
  applicationId: string;
  status: CreditApplication['status'];
  message: string;
  approvedAmount?: number;
  approvedMonths?: number;
  monthlyPayment?: number;
  updatedAt: string;
}

export interface CheckoutSession {
  sessionId: string;
  checkoutUrl: string;
  status: 'created' | 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  months: number;
  monthlyPayment: number;
}

export interface WebhookEvent {
  event: 'application.created' | 'application.approved' | 'application.rejected' | 'application.disbursed' | 'application.cancelled';
  applicationId: string;
  amount: number;
  currency: string;
  months: number;
  monthlyPayment: number;
  customerPhone: string;
  timestamp: string;
  signature: string;
}

// ─── Interest Rate Table (IuteCredit Moldova) ─────────────────────
// Based on IuteCredit Moldova standard terms:
// - 3, 6 months: 0% interest (Smart 0%)
// - 9 months: 4.9% annual
// - 12 months: 7.9% annual  
// - 18 months: 11.9% annual
// - 24 months: 14.9% annual
const INTEREST_RATES: Record<number, number> = {
  3: 0,
  6: 0,
  9: 4.9,
  12: 7.9,
  18: 11.9,
  24: 14.9,
};

export const AVAILABLE_MONTHS = [3, 6, 9, 12, 18, 24] as const;
export type CreditMonths = typeof AVAILABLE_MONTHS[number];

// ─── Credit Calculation ───────────────────────────────────────────

/**
 * Calculate monthly payment using amortization formula
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyPayment(price: number, months: number): number {
  const annualRate = INTEREST_RATES[months];
  if (annualRate === undefined) {
    throw new Error(`Perioada nesuportată: ${months} luni. Valide: ${AVAILABLE_MONTHS.join(', ')}`);
  }

  if (annualRate === 0) {
    return Math.ceil(price / months);
  }

  const monthlyRate = annualRate / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, months);
  const payment = price * (monthlyRate * factor) / (factor - 1);

  return Math.ceil(payment);
}

/**
 * Get all credit plans for a given price
 */
export function getAllCreditPlans(price: number): CreditPlan[] {
  return AVAILABLE_MONTHS.map((months) => {
    const annualRate = INTEREST_RATES[months];
    const monthlyPayment = calculateMonthlyPayment(price, months);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - price;

    return {
      months,
      interestRate: annualRate,
      monthlyPayment,
      totalPayment,
      totalInterest,
      downPayment: 0,
      isZeroInterest: annualRate === 0,
    };
  });
}

/**
 * Get the best (lowest monthly) credit plan
 */
export function getBestCreditPlan(price: number): CreditPlan {
  const plans = getAllCreditPlans(price);
  return plans[plans.length - 1];
}

/**
 * Get the cheapest (least interest) non-zero plan, or first zero-interest plan
 */
export function getCheapestCreditPlan(price: number): CreditPlan {
  const plans = getAllCreditPlans(price);
  const zeroInterest = plans.filter((p) => p.isZeroInterest);
  if (zeroInterest.length > 0) {
    return zeroInterest[zeroInterest.length - 1];
  }
  return plans[0];
}

// ─── API Client ───────────────────────────────────────────────────
async function iuteRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
  params?: Record<string, string>
): Promise<T> {
  if (!config.apiKey) {
    throw new Error('IuteCredit API key nu este configurată');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeout);

  try {
    let url = `${config.endpoint}${path}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'X-Partner-ID': config.partnerId,
        'X-Site-ID': config.siteId,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`IuteCredit API error (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Public API Functions ─────────────────────────────────────────

/**
 * Generate a checkout session URL for IuteCredit widget
 * This creates a pre-filled checkout link that opens the IuteCredit application form
 */
export function generateCheckoutUrl(productId: string, productName: string, price: number, months: number = 12): string {
  const params = new URLSearchParams({
    partner_id: config.partnerId,
    site_id: config.siteId,
    product_id: productId,
    product_name: productName,
    amount: String(price),
    months: String(months),
    currency: config.currency,
    country: config.country,
    source: 'western-import',
    return_url: `${typeof window !== 'undefined' ? window.location.origin : ''}/checkout/success`,
    cancel_url: `${typeof window !== 'undefined' ? window.location.origin : ''}/checkout/cancel`,
  });

  return `${config.checkoutUrl}/apply?${params.toString()}`;
}

/**
 * Generate credit link (legacy compatibility)
 */
export function generateCreditLink(productId: string, price: number, months: number = 12): string {
  const baseParams = new URLSearchParams({
    partner: config.partnerId,
    product: productId,
    amount: String(price),
    months: String(months),
    currency: config.currency,
    source: 'western-import',
  });

  return `${config.endpoint}/apply?${baseParams.toString()}`;
}

/**
 * Create a checkout session (for embedded widget flow)
 * This initiates a checkout session with IuteCredit API
 */
export async function createCheckoutSession(data: {
  productId: string;
  productName: string;
  price: number;
  months: number;
  customerPhone?: string;
  customerEmail?: string;
}): Promise<CheckoutSession> {
  const monthlyPayment = calculateMonthlyPayment(data.price, data.months);

  const result = await iuteRequest<CheckoutSession>('POST', '/checkout/sessions', {
    partnerId: config.partnerId,
    siteId: config.siteId,
    productId: data.productId,
    productName: data.productName,
    amount: data.price,
    currency: config.currency,
    months: data.months,
    monthlyPayment,
    customer: {
      phone: data.customerPhone || '',
      email: data.customerEmail || '',
    },
    returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/checkout/success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/checkout/cancel`,
    metadata: {
      source: 'western-import-site',
    },
  });

  return result;
}

/**
 * Submit a credit application directly
 */
export async function submitCreditApplication(application: CreditApplicationRequest): Promise<CreditApplication> {
  const monthlyPayment = calculateMonthlyPayment(application.price, application.months);

  const result = await iuteRequest<CreditApplication>('POST', '/applications', {
    partnerId: config.partnerId,
    siteId: config.siteId,
    productId: application.productId,
    productName: application.productName,
    amount: application.price,
    currency: config.currency,
    months: application.months,
    monthlyPayment,
    customer: {
      name: application.customerName,
      phone: application.customerPhone,
      email: application.customerEmail,
      pin: application.customerPin || '',
      monthlyIncome: application.monthlyIncome,
    },
    returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/product/${application.productId}`,
    metadata: {
      source: 'western-import-site',
      productId: application.productId,
    },
  });

  return result;
}

/**
 * Get credit application status
 */
export async function getCreditStatus(applicationId: string): Promise<CreditStatusResponse> {
  return iuteRequest<CreditStatusResponse>('GET', `/applications/${applicationId}`);
}

/**
 * Verify webhook signature
 * IuteCredit sends a signature header with each webhook for security verification
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!config.apiKey) return false;
  
  // HMAC-SHA256 verification using API key as secret
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', config.apiKey)
      .update(payload)
      .digest('hex');
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

/**
 * Test connection to IuteCredit API
 */
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    await iuteRequest('GET', '/ping');
    return { success: true, message: 'Conexiune reușită la IuteCredit API' };
  } catch (error) {
    return { 
      success: false, 
      message: `Conexiune eșuată: ${error instanceof Error ? error.message : 'Eroare necunoscută'}` 
    };
  }
}
