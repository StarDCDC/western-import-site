import { NextRequest } from 'next/server';
import { sanitizeInput, validateRequired, validateEmail, hasSQLInjection } from '@/lib/validators';
import { successResponse, errorResponse, serverErrorResponse, getClientIp, rateLimitResponse } from '@/lib/utils';
import { rateLimit } from '@/lib/rateLimit';
import { sendEmail, contactFormHtml } from '@/lib/email';

// POST /api/contact
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(ip, { windowMs: 60000, maxRequests: 3 });
    if (!rl.allowed) return rateLimitResponse(rl.resetTime);

    const body = await request.json();
    const sanitized = sanitizeInput(body) as Record<string, unknown>;

    const name = validateRequired(sanitized.name, 'Numele');
    const email = validateRequired(sanitized.email, 'Email');
    const message = validateRequired(sanitized.message, 'Mesajul');

    if (!validateEmail(email)) return errorResponse('Email invalid');
    if (hasSQLInjection(message as string)) return errorResponse('Mesaj invalid');

    // Send email to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `Mesaj de contact de la ${name}`,
        html: contactFormHtml(name as string, email as string, message as string),
        replyTo: email as string,
      });
    }

    return successResponse({ message: 'Mesaj trimis cu succes!' });
  } catch (err) {
    if (err instanceof Error && err.message.includes('obligatoriu')) return errorResponse(err.message);
    return serverErrorResponse();
  }
}
