import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return errorResponse('Fișierul lipsește');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse('Tip fișier invalid. Acceptate: JPEG, PNG, GIF, WebP');
    }
    if (file.size > 5 * 1024 * 1024) return errorResponse('Fișier prea mare. Maxim 5MB');

    const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
    const API_KEY = process.env.CLOUDINARY_API_KEY;
    const API_SECRET = process.env.CLOUDINARY_API_SECRET;

    const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (CLOUD_NAME && UPLOAD_PRESET) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString('base64');
      const dataUri = `data:${file.type};base64,${base64}`;

      const body = new FormData();
      body.append('file', dataUri);
      body.append('upload_preset', UPLOAD_PRESET);
      body.append('folder', 'western-import');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body,
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('[UPLOAD] Cloudinary error:', errText);
        return errorResponse('Upload eșuat la Cloudinary: ' + res.status);
      }

      const data = await res.json();
      console.log('[UPLOAD] Cloudinary OK:', data.secure_url);
      return successResponse({
        url: data.secure_url,
        filename: data.public_id,
        size: data.bytes,
        type: file.type,
      }, 201);
    }

    // Fallback: local filesystem (dev only)
    const bytes = await file.arrayBuffer();
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), Buffer.from(bytes));

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
