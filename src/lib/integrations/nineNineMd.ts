// src/lib/integrations/nineNineMd.ts — 999.md Marketplace Integration
// Full TypeScript integration for syncing products with 999.md marketplace

// ─── Configuration ────────────────────────────────────────────────
export interface NineNineMdConfig {
  apiKey: string;
  endpoint: string;
  userId?: string;
  timeout?: number;
}

const DEFAULT_CONFIG: NineNineMdConfig = {
  apiKey: '',
  endpoint: 'https://api.999.md/api/v1',
  timeout: 30000,
};

let config: NineNineMdConfig = { ...DEFAULT_CONFIG };

export function configureNineNineMd(userConfig: Partial<NineNineMdConfig>): void {
  config = { ...DEFAULT_CONFIG, ...userConfig };
}

export function getNineNineMdConfig(): NineNineMdConfig {
  return { ...config };
}

// ─── 999.md Data Types ────────────────────────────────────────────
export interface NineNineMdCategory {
  id: number;
  name: string;
  parentId?: number;
}

export interface NineNineMdImage {
  url: string;
  order: number;
  isMain: boolean;
}

export interface NineNineMdProduct {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  price: number;
  currency: 'MDL' | 'EUR' | 'USD';
  condition: 'new' | 'used';
  location: string;
  images: NineNineMdImage[];
  contactPhone: string;
  contactName: string;
  status: 'active' | 'paused' | 'closed';
  createdAt: string;
  updatedAt: string;
  views: number;
  favorites: number;
}

export interface NineNineMdSyncResult {
  success: boolean;
  nineNineId?: number;
  message: string;
  errors?: string[];
}

export interface NineNineMdSyncStatus {
  totalProducts: number;
  synced: number;
  failed: number;
  results: NineNineMdSyncResult[];
}

// ─── Our Product Type (for mapping) ───────────────────────────────
export interface LocalProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  condition: 'nou' | 'refurbished';
  price: number;
  oldPrice?: number;
  description: string;
  images: string[];
  specs: Record<string, string>;
  inStock: boolean;
}

// ─── Category Mapping ─────────────────────────────────────────────
// Maps our internal categories to 999.md category IDs
const CATEGORY_MAP: Record<string, number> = {
  laptopuri: 470,       // Laptopuri pe 999.md
  telefoane: 52,        // Telefoane
  'pc-monitoare': 468,  // PC & Monitoare
  tablete: 507,         // Tablete
  componente: 1608,     // Componente PC
  accesorii: 490,       // Accesorii
};

export function mapCategoryTo999(localCategory: string): number {
  return CATEGORY_MAP[localCategory] || 470;
}

// ─── Product Mapping ──────────────────────────────────────────────
export function mapProductTo999(product: LocalProduct): Omit<NineNineMdProduct, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'views' | 'favorites'> {
  const specsText = Object.entries(product.specs)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  const description = `${product.description}\n\nSpecificații:\n${specsText}`;

  const conditionMap: Record<string, 'new' | 'used'> = {
    nou: 'new',
    refurbished: 'used',
  };

  return {
    title: `${product.brand} ${product.name}`,
    description,
    categoryId: mapCategoryTo999(product.category),
    price: product.price,
    currency: 'MDL',
    condition: conditionMap[product.condition] || 'used',
    location: 'Chișinău',
    images: product.images.map((url, i) => ({
      url,
      order: i,
      isMain: i === 0,
    })),
    contactPhone: '+37322123456',
    contactName: 'Western Import',
  };
}

export function map999ToLocal(nineNineProduct: NineNineMdProduct): Partial<LocalProduct> {
  return {
    name: nineNineProduct.title,
    price: nineNineProduct.price,
    description: nineNineProduct.description,
    images: nineNineProduct.images.map((img) => img.url),
    inStock: nineNineProduct.status === 'active',
  };
}

// ─── API Client ───────────────────────────────────────────────────
async function nineNineRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown
): Promise<T> {
  if (!config.apiKey) {
    throw new Error('999.md API key nu este configurată');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeout);

  try {
    const response = await fetch(`${config.endpoint}${path}`, {
      method,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`999.md API error (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Public API Functions ─────────────────────────────────────────

/**
 * Upload a single product to 999.md
 */
export async function uploadProduct(product: LocalProduct): Promise<NineNineMdSyncResult> {
  try {
    const payload = mapProductTo999(product);
    const result = await nineNineRequest<{ id: number; success: boolean }>('POST', '/listings', payload);

    return {
      success: true,
      nineNineId: result.id,
      message: `Produsul "${product.name}" a fost publicat pe 999.md (ID: ${result.id})`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Eroare la publicarea "${product.name}": ${error instanceof Error ? error.message : 'Eroare necunoscută'}`,
      errors: [error instanceof Error ? error.message : 'Eroare necunoscută'],
    };
  }
}

/**
 * Sync all products to 999.md
 */
export async function syncProducts(products: LocalProduct[]): Promise<NineNineMdSyncStatus> {
  const results: NineNineMdSyncResult[] = [];
  let synced = 0;
  let failed = 0;

  for (const product of products) {
    if (!product.inStock) continue;

    const result = await uploadProduct(product);
    results.push(result);

    if (result.success) {
      synced++;
    } else {
      failed++;
    }

    // Rate limit: wait 500ms between requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return {
    totalProducts: products.filter((p) => p.inStock).length,
    synced,
    failed,
    results,
  };
}

/**
 * Sync stock status for a single product on 999.md
 */
export async function syncStock(productId: string, inStock: boolean): Promise<NineNineMdSyncResult> {
  try {
    const status = inStock ? 'active' : 'paused';
    await nineNineRequest('PUT', `/listings/${productId}/status`, { status });

    return {
      success: true,
      message: `Stocul pentru "${productId}" a fost actualizat: ${inStock ? 'disponibil' : 'indisponibil'}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Eroare la sincronizarea stocului: ${error instanceof Error ? error.message : 'Eroare necunoscută'}`,
      errors: [error instanceof Error ? error.message : 'Eroare necunoscută'],
    };
  }
}

/**
 * Sync price for a single product on 999.md
 */
export async function syncPrice(productId: string, price: number, currency: 'MDL' | 'EUR' | 'USD' = 'MDL'): Promise<NineNineMdSyncResult> {
  try {
    await nineNineRequest('PUT', `/listings/${productId}/price`, { price, currency });

    return {
      success: true,
      message: `Prețul pentru "${productId}" a fost actualizat la ${price} ${currency}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Eroare la sincronizarea prețului: ${error instanceof Error ? error.message : 'Eroare necunoscută'}`,
      errors: [error instanceof Error ? error.message : 'Eroare necunoscută'],
    };
  }
}

/**
 * Delete a product from 999.md
 */
export async function deleteProduct(productId: string): Promise<NineNineMdSyncResult> {
  try {
    await nineNineRequest('DELETE', `/listings/${productId}`);

    return {
      success: true,
      message: `Produsul "${productId}" a fost șters de pe 999.md`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Eroare la ștergerea produsului: ${error instanceof Error ? error.message : 'Eroare necunoscută'}`,
      errors: [error instanceof Error ? error.message : 'Eroare necunoscută'],
    };
  }
}

/**
 * Test connection to 999.md API
 */
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    await nineNineRequest('GET', '/me');
    return { success: true, message: 'Conexiune reușită la 999.md API' };
  } catch (error) {
    return { success: false, message: `Conexiune eșuată: ${error instanceof Error ? error.message : 'Eroare necunoscută'}` };
  }
}
