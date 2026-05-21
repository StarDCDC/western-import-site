// src/app/api/admin/settings/route.ts — Admin settings CRUD
import { NextRequest } from 'next/server';

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

// In-memory store (resets on server restart; use DB in production)
let settingsStore: AdminSettings = { ...DEFAULT_SETTINGS };

// GET /api/admin/settings
export async function GET() {
  return Response.json({ success: true, data: settingsStore });
}

// PUT /api/admin/settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as Partial<AdminSettings>;

    // Merge with existing settings
    settingsStore = { ...settingsStore, ...body };

    return Response.json({ success: true, data: settingsStore });
  } catch {
    return Response.json({ success: false, error: 'Date invalide' }, { status: 400 });
  }
}
