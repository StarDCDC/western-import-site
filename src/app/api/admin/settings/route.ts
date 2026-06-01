// src/app/api/admin/settings/route.ts — Admin settings CRUD
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// All admin settings live in a single `settings` row under this key (value is a
// JSON string). This persists across restarts/redeploys — the previous
// in-memory store reset on every Railway deploy.
const SETTINGS_KEY = 'admin_settings';

async function loadSettings(): Promise<AdminSettings> {
  const row = await prisma.setting.findUnique({ where: { key: SETTINGS_KEY } });
  if (!row?.value) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(row.value) as Partial<AdminSettings>) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

async function saveSettings(settings: AdminSettings): Promise<void> {
  const value = JSON.stringify(settings);
  await prisma.setting.upsert({
    where: { key: SETTINGS_KEY },
    update: { value },
    create: { key: SETTINGS_KEY, value },
  });
}

// ─── Settings Interface ───────────────────────────────────────────
export interface AdminSettings {
  siteName: string;
  phone: string;
  email: string;
  address: string;
  schedule: string;
  metaTitle: string;
  metaDescription: string;
  gaId: string;
  facebook: string;
  instagram: string;
  telegram: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  nineNineMdApiKey: string;
  nineNineMdEndpoint: string;
  nineNineMdActive: boolean;
  iuteCreditApiKey: string;
  iuteCreditPartnerId: string;
  iuteCreditEndpoint: string;
  iuteCreditActive: boolean;
  elfsightWidgetId: string;
  elfsightActive: boolean;
}

const DEFAULT_SETTINGS: AdminSettings = {
  siteName: 'Western Import',
  phone: '+373 22 123 456',
  email: 'info@western.md',
  address: 'str. Ion Creangă 12, Chișinău, MD-2001',
  schedule: 'Luni-Vineri: 09:00-18:00, Sâmbătă: 09:00-14:00',
  metaTitle: 'Western Import - Electronice și IT',
  metaDescription: 'Magazin online de electronice, laptopuri, telefoane și accesorii. Livrare în toată Republica Moldova.',
  gaId: 'G-XXXXXXXXXX',
  facebook: 'https://facebook.com/westernimport',
  instagram: 'https://instagram.com/westernimport',
  telegram: 'https://t.me/westernimport',
  smtpHost: 'smtp.gmail.com',
  smtpPort: '587',
  smtpUser: 'info@western.md',
  nineNineMdApiKey: '',
  nineNineMdEndpoint: 'https://api.999.md/api/v1',
  nineNineMdActive: false,
  iuteCreditApiKey: '',
  iuteCreditPartnerId: '',
  iuteCreditEndpoint: 'https://api.iute.md/v1',
  iuteCreditActive: false,
  elfsightWidgetId: '',
  elfsightActive: false,
};

// GET /api/admin/settings (admin only)
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return Response.json({ success: false, error: 'Neautorizat' }, { status: error === 'forbidden' ? 403 : 401 });

  const settings = await loadSettings();
  return Response.json({ success: true, data: settings });
}

// PUT /api/admin/settings (admin only) — persisted in DB
export async function PUT(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return Response.json({ success: false, error: 'Neautorizat' }, { status: error === 'forbidden' ? 403 : 401 });

  try {
    const body = await request.json() as Partial<AdminSettings>;
    const current = await loadSettings();
    const merged = { ...current, ...body };
    await saveSettings(merged);
    return Response.json({ success: true, data: merged });
  } catch {
    return Response.json({ success: false, error: 'Date invalide' }, { status: 400 });
  }
}
