// src/lib/integrations/iuteCredit.ts — IuteCredit Integration
// Full TypeScript integration for consumer credit calculations and applications

// ─── Configuration ────────────────────────────────────────────────
export interface IuteCreditConfig {
  apiKey: string;
  partnerId: string;
  endpoint: string;
  timeout?: number;
}

const DEFAULT_CONFIG: IuteCreditConfig = {
  apiKey: '',
  partnerId: '',
  endpoint: 'https://api.iute.md/v1',
  timeout: 15000,
};

let config: IuteCreditConfig = { ...DEFAULT_CONFIG };

export function configureIuteCredit(userConfig: Partial<IuteCreditConfig>): void {
  config = { ...DEFAULT_CONFIG, ...userConfig };
}

export function getIuteCreditConfig(): IuteCreditConfig {
  return { ...config };
}

// ─── Data Types ───────────────────────────────────────────────────
export interface CreditPlan {
  months: number;
  interestRate: number;     // Annual interest rate as percentage
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  downPayment: number;      // Required down payment (usually 0% for eligible)
  isZeroInterest: boolean;  // 0% interest flag
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
  customerPin: string;      // IDNP
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

// ─── Interest Rate Table ──────────────────────────────────────────
// Based on typical IuteCredit Moldova terms:
// - 3, 6 months: 0% interest (promo)
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
 * where P = principal, r = monthly rate, n = number of months
 */
export function calculateMonthlyPayment(price: number, months: number): number {
  const annualRate = INTEREST_RATES[months];
  if (annualRate === undefined) {
    throw new Error(`Perioada nesuportată: ${months} luni. Valide: ${AVAILABLE_MONTHS.join(', ')}`);
  }

  // 0% interest — simple division
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
    const isZeroInterest = annualRate === 0;

    return {
      months,
      interestRate: annualRate,
      monthlyPayment,
      totalPayment,
      totalInterest,
      downPayment: 0,
      isZeroInterest,
    };
  });
}

/**
 * Get the best (lowest monthly) credit plan
 */
export function getBestCreditPlan(price: number): CreditPlan {
  const plans = getAllCreditPlans(price);
  return plans[plans.length - 1]; // 24 months has lowest monthly
}

/**
 * Get the cheapest (least interest) non-zero plan, or first zero-interest plan
 */
export function getCheapestCreditPlan(price: number): CreditPlan {
  const plans = getAllCreditPlans(price);
  const zeroInterest = plans.filter((p) => p.isZeroInterest);
  if (zeroInterest.length > 0) {
    return zeroInterest[zeroInterest.length - 1]; // longest 0% plan
  }
  return plans[0]; // shortest term
}

// ─── API Client ───────────────────────────────────────────────────
async function iuteRequest<T>(
  method: 'GET' | 'POST' | 'PUT',
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
 * Generate a credit application link for a product
 */
export function generateCreditLink(productId: string, price: number, months: number = 12): string {
  const baseParams = new URLSearchParams({
    partner: config.partnerId,
    product: productId,
    amount: String(price),
    months: String(months),
    currency: 'MDL',
    source: 'western-import',
  });

  // In production, this would be the real IuteCredit application URL
  return `${config.endpoint}/apply?${baseParams.toString()}`;
}

/**
 * Submit a credit application
 */
export async function submitCreditApplication(application: CreditApplicationRequest): Promise<CreditApplication> {
  const monthlyPayment = calculateMonthlyPayment(application.price, application.months);

  const result = await iuteRequest<CreditApplication>('POST', '/applications', {
    partnerId: config.partnerId,
    productId: application.productId,
    productName: application.productName,
    amount: application.price,
    currency: 'MDL',
    months: application.months,
    monthlyPayment,
    customer: {
      name: application.customerName,
      phone: application.customerPhone,
      email: application.customerEmail,
      pin: application.customerPin,
      monthlyIncome: application.monthlyIncome,
    },
    returnUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/product/${application.productId}`,
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
 * Test connection to IuteCredit API
 */
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    await iuteRequest('GET', '/ping');
    return { success: true, message: 'Conexiune reușită la IuteCredit API' };
  } catch (error) {
    return { success: false, message: `Conexiune eșuată: ${error instanceof Error ? error.message : 'Eroare necunoscută'}` };
  }
}
