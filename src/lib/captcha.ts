// src/lib/captcha.ts — Google reCAPTCHA v3 verification

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const SCORE_THRESHOLD = 0.5; // Below this = likely bot

export interface CaptchaVerifyResult {
  success: boolean;
  score?: number;
  error?: string;
}

/**
 * Verify a reCAPTCHA v3 token with Google's API.
 * Returns success=true only if score >= SCORE_THRESHOLD.
 */
export async function verifyCaptcha(token: string): Promise<CaptchaVerifyResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.warn("[CAPTCHA] RECAPTCHA_SECRET_KEY not set — skipping verification");
    // Fail open in dev, fail closed in production would be safer
    return { success: true };
  }

  if (!token) {
    return { success: false, error: "No token provided" };
  }

  try {
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json() as {
      success: boolean;
      score?: number;
      "error-codes"?: string[];
    };

    if (!data.success) {
      return {
        success: false,
        error: (data["error-codes"] || ["unknown-error"]).join(", "),
      };
    }

    const score = data.score ?? 0;
    if (score < SCORE_THRESHOLD) {
      return {
        success: false,
        score,
        error: `Score ${score} below threshold ${SCORE_THRESHOLD}`,
      };
    }

    return { success: true, score };
  } catch (err) {
    console.error("[CAPTCHA] Verification failed:", err);
    return { success: false, error: "Network error during verification" };
  }
}

/**
 * Helper to get site key for frontend use.
 * Returns undefined if not configured.
 */
export function getRecaptchaSiteKey(): string | undefined {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
}