import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return errorResponse('Fișierul lipsește');

    if (!ALLOWED_TYPES.includes(file.type)) {
      return errorResponse('Tip fișier invalid. Acceptate: JPEG, PNG, GIF, WebP, SVG');
    }
    if (file.size > MAX_SIZE) return errorResponse('Fișier prea mare. Maxim 10MB');

    const bytes = await file.arrayBuffer();
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), Buffer.from(bytes));

    console.log('[UPLOAD] Local file saved:', filename);

    return successResponse({
      url: `/uploads/${filename}`,
      filename,
      size: file.size,
      type: file.type,
    }, 201);
  } catch (e) {
    console.error('[UPLOAD] Error:', e);
    return serverErrorResponse();
  }
}
