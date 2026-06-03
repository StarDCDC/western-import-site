import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';

// POST /api/admin/migrate — run pending migrations
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    // Add RU columns to banners if they don't exist
    const migrations: string[] = [];

    // Check if titleRu column exists
    const columns = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'banners' AND column_name = 'titleRu'
    `;

    if (!Array.isArray(columns) || columns.length === 0) {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "banners" ADD COLUMN IF NOT EXISTS "titleRu" TEXT;
        ALTER TABLE "banners" ADD COLUMN IF NOT EXISTS "subtitleRu" TEXT;
        ALTER TABLE "banners" ADD COLUMN IF NOT EXISTS "buttonTextRu" TEXT;
      `);
      migrations.push('Added titleRu, subtitleRu, buttonTextRu to banners');
    } else {
      migrations.push('Banner RU columns already exist');
    }

    return successResponse({ migrations, message: 'Migrații aplicate cu succes' });
  } catch (err) {
    console.error('Migration error:', err);
    return serverErrorResponse();
  }
}
