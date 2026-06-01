import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';

// Cache settings for 60 seconds
let settingsCache: { data: Record<string, unknown>; ts: number } | null = null;
const CACHE_TTL = 60_000;

// SECURITY: this endpoint is PUBLIC. Only non-secret keys may be returned —
// never SMTP/API keys or the admin_settings blob. Whitelist explicitly.
const PUBLIC_KEYS = new Set([
  'siteName', 'phone', 'email', 'address', 'schedule', 'metaTitle', 'metaDescription',
  'facebook', 'instagram', 'telegram', 'tiktok',
  // legacy / analytics keys read by existing client components (non-secret)
  'site_phone', 'site_email', 'site_address', 'WHATSAPP_NUMBER',
  'GOOGLE_ANALYTICS_ID', 'FACEBOOK_PIXEL_ID', 'TIKTOK_PIXEL_ID',
]);

// GET /api/settings — get public settings (cached, whitelisted)
export async function GET() {
  try {
    const now = Date.now();
    if (settingsCache && now - settingsCache.ts < CACHE_TTL) {
      return successResponse({ settings: settingsCache.data });
    }
    const settings = await prisma.setting.findMany();
    const settingsObj: Record<string, unknown> = {};
    settings.forEach((s) => {
      if (PUBLIC_KEYS.has(s.key)) settingsObj[s.key] = s.value;
    });
    settingsCache = { data: settingsObj, ts: now };
    return successResponse({ settings: settingsObj });
  } catch {
    return serverErrorResponse();
  }
}

// PUT /api/settings — update all settings
export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const body = await request.json();
    const { settings }: { settings: Array<{ key: string; value: any }> } = body;

    for (const setting of settings) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      });
    }

    // Invalidate cache
    settingsCache = null;

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'UPDATE_SETTINGS',
        entity: 'Settings',
        details: JSON.stringify({ settings: settings.map(s => s.key) }),
      },
    });

    return successResponse({ message: 'Setări actualizate cu succes' });
  } catch {
    return serverErrorResponse();
  }
}
