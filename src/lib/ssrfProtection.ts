// src/lib/ssrfProtection.ts — SSRF prevention for external fetches

// ─── Allow-list of permitted domains ─────────────────────────────

const ALLOWED_HOSTS = new Set([
  "google.com",
  "googleapis.com",
  "gstatic.com",
  "recaptcha.net",
  "google.com",
  "ipapi.co",
  "ip-api.com",
  "cloudinary.com",
  "western.md",
  "westernimport.md",
  "elfsight.com",
]);

const BLOCKED_IP_PREFIXES = [
  /^127\./,           // loopback
  /^10\./,            // private class A
  /^172\.(1[6-9]|2\d|3[01])\./, // private class B
  /^192\.168\./,      // private class C
  /^0\.0\.0\.0$/,     // all zeros
  /^::1$/,            // IPv6 loopback
  /^localhost$/i,     // localhost string
];

// ─── Validate URL ──────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateUrl(url: string): ValidationResult {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, reason: "Invalid URL format" };
  }

  // Only allow http and https
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { valid: false, reason: "Only HTTP and HTTPS protocols are allowed" };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Check for localhost / IP literals
  if (
    hostname === "localhost" ||
    hostname === "0.0.0.0" ||
    /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    hostname === "::1" ||
    /^::1:\d+$/.test(hostname)
  ) {
    return { valid: false, reason: `Blocked private/internal host: ${hostname}` };
  }

  // Block numeric IPs that resolve to private ranges
  const ipBlocked = BLOCKED_IP_PREFIXES.some((re) => re.test(hostname));
  if (ipBlocked) {
    return { valid: false, reason: `Blocked IP range: ${hostname}` };
  }

  // Allow only known safe domains (basic check)
  // In production, expand this to a full domain allow-list
  const allowed = ALLOWED_HOSTS.has(hostname) || hostname.endsWith(".cloudinary.com");
  if (!allowed && !hostname.includes(".")) {
    return { valid: false, reason: `Unrecognized host: ${hostname}` };
  }

  return { valid: true };
}

// ─── Safe fetch wrapper ────────────────────────────────────────────

export interface SafeFetchOptions extends RequestInit {
  timeoutMs?: number;
  allowedHosts?: Set<string>;
}

export async function safeFetch(
  url: string,
  options: SafeFetchOptions = {}
): Promise<Response> {
  const { timeoutMs = 8000, allowedHosts, ...fetchOptions } = options;

  // Merge global allow-list with per-request allow-list
  const hosts = allowedHosts ? new Set([...ALLOWED_HOSTS, ...allowedHosts]) : ALLOWED_HOSTS;

  // Validate URL
  const result = validateUrl(url);
  if (!result.valid) {
    throw new Error(`SSRF Blocked: ${result.reason}`);
  }

  // Extra hostname check against merged allow-list
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid URL");
  }

  const hostname = parsed.hostname.toLowerCase();
  const hostAllowed =
    hosts.has(hostname) ||
    hostname.endsWith(".cloudinary.com") ||
    hostname.endsWith(".googleapis.com");

  if (!hostAllowed) {
    throw new Error(`SSRF Blocked: Host "${hostname}" is not in the allowed list`);
  }

  // AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Fetch timeout after ${timeoutMs}ms`);
    }
    throw err;
  }
}

// ─── Helper: build external image URL with validation ─────────────

export async function fetchExternalImage(
  url: string,
  options?: SafeFetchOptions
): Promise<ArrayBuffer> {
  const validated = validateUrl(url);
  if (!validated.valid) {
    throw new Error(`SSRF Blocked: ${validated.reason}`);
  }
  const response = await safeFetch(url, { ...options, responseType: "arraybuffer" } as SafeFetchOptions);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  return response.arrayBuffer();
}