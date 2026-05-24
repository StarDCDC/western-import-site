import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';

// GET /api/settings — get all settings
export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const settingsObj: Record<string, unknown> = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

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
