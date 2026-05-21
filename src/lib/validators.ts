// ─── Input Validators ──────────────────────────────────────────────

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\+?[\d\s()-]{6,20}$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SQL_INJECTION_REGEX = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE|xp_|sp_|0x)\b)|(--|;|\/\*|\*\/|@@|char\(|nchar\(|varchar\(|nvarchar\()/i;
const XSS_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|javascript:|on\w+\s*=/i;

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function validatePhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Minim 8 caractere');
  if (!/[A-Z]/.test(password)) errors.push('Cel puțin o literă mare');
  if (!/[a-z]/.test(password)) errors.push('Cel puțin o literă mică');
  if (!/[0-9]/.test(password)) errors.push('Cel puțin o cifră');
  return { valid: errors.length === 0, errors };
}

export function validateSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug);
}

export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

export function hasSQLInjection(input: string): boolean {
  return SQL_INJECTION_REGEX.test(input);
}

export function hasXSS(input: string): boolean {
  return XSS_REGEX.test(input);
}

export function sanitizeInput(input: unknown): unknown {
  if (typeof input === 'string') {
    return sanitizeString(input);
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (input !== null && typeof input === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
}

export function validatePagination(page: unknown, limit: unknown): { page: number; limit: number } {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || 20));
  return { page: p, limit: l };
}

export function validateRating(rating: unknown): number {
  const r = Number(rating);
  if (isNaN(r) || r < 1 || r > 5) throw new Error('Rating trebuie să fie între 1 și 5');
  return Math.round(r);
}

export function validateRequired(value: unknown, field: string): string {
  if (!value || (typeof value === 'string' && !value.trim())) {
    throw new Error(`${field} este obligatoriu`);
  }
  return String(value).trim();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u00C0-\u024F]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
