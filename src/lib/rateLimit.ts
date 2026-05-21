// ─── Rate Limiter (in-memory, per IP) ──────────────────────────────

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

interface RateLimitOptions {
  windowMs?: number;   // Time window in milliseconds
  maxRequests?: number; // Max requests per window
}

const DEFAULT_OPTIONS: Required<RateLimitOptions> = {
  windowMs: 60 * 1000,    // 1 minute
  maxRequests: 60,         // 60 requests per minute
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const { windowMs, maxRequests } = { ...DEFAULT_OPTIONS, ...options };
  const now = Date.now();

  const entry = store.get(identifier);

  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs;
    store.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  entry.count++;

  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime };
}

export function rateLimitMiddleware(options: RateLimitOptions = {}) {
  return function checkRateLimit(ip: string): RateLimitResult {
    return rateLimit(ip, options);
  };
}

// Preset limiters
export const authLimiter = rateLimitMiddleware({ windowMs: 60 * 1000, maxRequests: 5 });
export const apiLimiter = rateLimitMiddleware({ windowMs: 60 * 1000, maxRequests: 60 });
export const uploadLimiter = rateLimitMiddleware({ windowMs: 60 * 1000, maxRequests: 10 });
