// src/lib/integrations/iuteCredit.ts — IutePay Integration (conform docs oficiale)
// Docs: https://ecom-docs.iutecredit.md/docs/public/one-page-guide.html

// ─── Configuration ────────────────────────────────────────────────
export interface IuteCreditConfig {
  /** Public API key — poate fi expus pe client side */
  publicKey: string;
  /** Admin API key — DOAR backend, niciodată pe client */
  adminKey: string;
  /** ISO-2 language code: md, sq, bg, etc. */
  lang: string;
  /** Base URL pentru SDK + API */
  baseUrl: string;
  /** Currency ISO-3: MDL, ALL, BGN, EUR */
  currency: string;
  /** Country ISO-3: mda, alb, etc. */
  country: string;
}

const DEFAULT_CONFIG: IuteCreditConfig = {
  publicKey: '',
  adminKey: '',
  lang: 'md',
  baseUrl: 'https://ecom.iutecredit.md',
  currency: 'MDL',
  country: 'mda',
};

let config: IuteCreditConfig = { ...DEFAULT_CONFIG };

export function configureIuteCredit(userConfig: Partial<IuteCreditConfig>): void {
  config = { ...DEFAULT_CONFIG, ...userConfig };
}

export function getIuteCreditConfig(): IuteCreditConfig {
  return { ...config };
}

export function isIuteCreditConfigured(): boolean {
  return !!config.publicKey;
}

export function hasAdminKey(): boolean {
  return !!config.adminKey;
}

// ─── Order Status Types (conform docs) ────────────────────────────
export type IuteOrderStatus =
  | 'PENDING'        // application submitted
  | 'IN_PROGRESS'    // approved, waiting for customer signature
  | 'PAID'           // approved + signed — ok to ship
  | 'CANCELLED'      // rejected or cancelled by customer
  | 'SIGNED';        // signed by customer (v2 only)

export interface IuteOrderStatusResponse {
  orderId: string;
  status: IuteOrderStatus;
  approvedAmount: number;
}

// ─── Loan Product Types (conform docs) ────────────────────────────
export interface IuteLoanProduct {
  id: string;
  name: string;
  priority: number;
}

// ─── Product Mapping Types (conform docs) ─────────────────────────
export interface IuteProductMapping {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  createdBy: string | null;
  createdDate: string | null;
  lastModifiedBy: string | null;
  lastModifiedDate: string | null;
}

export interface IuteProductMappingsResponse {
  content: IuteProductMapping[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─── Admin API Client (backend-only) ──────────────────────────────
// Docs: header x-iute-admin-key, GET endpoints

async function adminRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
  params?: Record<string, string>
): Promise<T> {
  if (!config.adminKey) {
    throw new Error('IuteCredit Admin API key nu este configurată');
  }

  let url = `${config.baseUrl}${path}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    method,
    headers: {
      'x-iute-admin-key': config.adminKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`IuteCredit Admin API error (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<T>;
}

// ─── Public API: Order Status Check (conform docs) ────────────────
// GET /api/v1/eshop/management/eshop-order-status?orderId=...
// sau v2: GET /api/v2/eshop/management/eshop-order-status?orderId=...

export async function checkOrderStatus(orderId: string, version: 1 | 2 = 2): Promise<IuteOrderStatusResponse> {
  return adminRequest<IuteOrderStatusResponse>(
    'GET',
    `/api/v${version}/eshop/management/eshop-order-status`,
    undefined,
    { orderId }
  );
}

// ─── Public API: Loan Products (conform docs) ─────────────────────
// GET /api/v1/eshop/management/loan-product

export async function getLoanProducts(): Promise<IuteLoanProduct[]> {
  return adminRequest<IuteLoanProduct[]>(
    'GET',
    '/api/v1/eshop/management/loan-product'
  );
}

// ─── Public API: Product Mappings (conform docs) ──────────────────
// GET /api/v1/eshop/management/product-mapping?skus=...&page=0&size=500&sort=id

export async function getProductMappings(skus?: string[], page = 0, size = 500): Promise<IuteProductMappingsResponse> {
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
    sort: 'id',
  };
  if (skus && skus.length > 0) {
    params.skus = skus.join(',');
  }
  return adminRequest<IuteProductMappingsResponse>(
    'GET',
    '/api/v1/eshop/management/product-mapping',
    undefined,
    params
  );
}

// ─── Public API: Create Product Mappings (conform docs) ───────────
// POST /api/v2/eshop/management/product-mapping?batch=true

export async function createProductMappings(mappings: Array<{
  sku: string;
  loanProductId: string;
}>): Promise<unknown> {
  return adminRequest(
    'POST',
    '/api/v2/eshop/management/product-mapping?batch=true',
    mappings
  );
}

// ─── Map IutePay status to our order status ───────────────────────
export function mapIuteStatusToOrder(iuteStatus: IuteOrderStatus): string {
  switch (iuteStatus) {
    case 'PENDING':
    case 'IN_PROGRESS':
    case 'SIGNED':
      return 'pending';
    case 'PAID':
      return 'confirmed';
    case 'CANCELLED':
      return 'cancelled';
    default:
      return 'pending';
  }
}
