// src/lib/integrations/nineNineNineMd.ts — 999.md Partners API Client
// Docs: https://partners-api.999.md/api/documentation
// Auth: HTTP Basic Auth (API key as username, empty password)

const BASE_URL = 'https://partners-api.999.md';
const API_KEY = process.env.NINE_NINE_NINE_MD_API_KEY || 'qMmu73Mg5Q942hVLc4kyuyhnnf97';

function authHeader(): Record<string, string> {
  const encoded = Buffer.from(API_KEY + ':').toString('base64');
  return { Authorization: `Basic ${encoded}`, 'Content-Type': 'application/json' };
}

async function apiRequest<T>(method: string, path: string, body?: unknown, params?: Record<string, string>): Promise<T> {
  let url = `${BASE_URL}${path}`;
  if (params) url += '?' + new URLSearchParams(params).toString();

  const res = await fetch(url, {
    method,
    headers: authHeader(),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`999.md API error (${res.status}): ${text}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

// ─── Categories ───────────────────────────────────────────────────
export async function getCategories(lang = 'ro') {
  return apiRequest<any[]>('GET', '/categories', undefined, { lang });
}

// ─── Adverts ──────────────────────────────────────────────────────
export async function getAdverts(params?: Record<string, string>) {
  return apiRequest<any>('GET', '/adverts', undefined, params);
}

export async function getAdvert(id: string | number) {
  return apiRequest<any>('GET', `/adverts/${id}`);
}

export async function createAdvert(data: Record<string, unknown>) {
  return apiRequest<any>('POST', '/adverts', data);
}

export async function updateAdvert(id: string | number, data: Record<string, unknown>) {
  return apiRequest<any>('PATCH', `/adverts/${id}`, data);
}

export async function republishAdvert(id: string | number) {
  return apiRequest<any>('POST', `/adverts/${id}/republish`);
}

// ─── Features (for category-specific fields) ──────────────────────
export async function getFeaturesForAdvert(subcategoryId: string | number) {
  return apiRequest<any>('GET', `/features`, undefined, { subcategory_id: String(subcategoryId) });
}

// ─── Helper: push a product as an advert to 999.md ───────────────
export async function pushProductTo999(product: {
  name: string;
  price: number;
  description?: string;
  images?: string[];
  categoryId?: number;
  subcategoryId?: number;
  sku?: string;
  currency?: string;
}) {
  const data: Record<string, unknown> = {
    title: product.name,
    price: product.price,
    currency: product.currency || 'mdl',
    description: product.description || product.name,
    category_id: product.subcategoryId || product.categoryId || 4,
    state: 'public',
    images: (product.images || []).map((url, i) => ({ url, order: i })),
    param_phone_visible: true,
  };

  if (product.sku) data.param_sku = product.sku;

  return createAdvert(data);
}
