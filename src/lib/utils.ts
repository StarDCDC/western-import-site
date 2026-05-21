// ─── Utility Functions ─────────────────────────────────────────────

export function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('ro-MD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num) + ' MDL';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[ăâîșțĂÂÎȘȚ]/g, (match) => {
      const map: Record<string, string> = { 'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't' };
      return map[match.toLowerCase()] || match;
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function generateOrderNumber(): string {
  const prefix = 'WI';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIp) return realIp.trim();
  return 'unknown';
}

export function parseSort(sort: string | null, allowedFields: string[]): { field: string; order: 'asc' | 'desc' } {
  if (!sort) return { field: 'createdAt', order: 'desc' };
  const [field, order] = sort.split(':');
  if (!allowedFields.includes(field)) return { field: 'createdAt', order: 'desc' };
  return { field, order: order === 'asc' ? 'asc' : 'desc' };
}

export function successResponse(data: unknown, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

export function unauthorizedResponse() {
  return Response.json({ success: false, error: 'Neautorizat' }, { status: 401 });
}

export function forbiddenResponse() {
  return Response.json({ success: false, error: 'Acces interzis' }, { status: 403 });
}

export function notFoundResponse(message = 'Resursă negăsită') {
  return Response.json({ success: false, error: message }, { status: 404 });
}

export function serverErrorResponse() {
  return Response.json({ success: false, error: 'Eroare de server. Încercați din nou.' }, { status: 500 });
}

export function rateLimitResponse(resetTime: number) {
  return Response.json(
    { success: false, error: 'Prea multe cereri. Încercați din nou mai târziu.' },
    { status: 429, headers: { 'X-RateLimit-Reset': String(resetTime) } }
  );
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function paginatedResponse(data: unknown[], total: number, page: number, limit: number) {
  return Response.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export function calculateDiscount(price: number, oldPrice: number): number {
  if (!oldPrice || oldPrice <= 0) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}
