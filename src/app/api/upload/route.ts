import { NextRequest } from 'next/server';
import { createHash } from 'crypto';
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

    const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
    const API_KEY = process.env.CLOUDINARY_API_KEY;
    const API_SECRET = process.env.CLOUDINARY_API_SECRET;

    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      console.error('[UPLOAD] Missing Cloudinary env vars');
      return errorResponse('Upload indisponibil — configurare incompletă');
    }

    // Convert to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Generate signature
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const sigString = `folder=western-import&timestamp=${timestamp}${API_SECRET}`;
    const signature = createHash('sha1').update(sigString).digest('hex');

    // Upload to Cloudinary
    const body = new FormData();
    body.append('file', dataUri);
    body.append('folder', 'western-import');
    body.append('timestamp', timestamp);
    body.append('api_key', API_KEY);
    body.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[UPLOAD] Cloudinary error:', errText);
      return errorResponse('Upload eșuat la Cloudinary');
    }

    const data = await res.json();
    console.log('[UPLOAD] Cloudinary OK:', data.secure_url);

    return successResponse({
      url: data.secure_url,
      filename: data.public_id,
      size: data.bytes,
      type: file.type,
    }, 201);
  } catch (e) {
    console.error('[UPLOAD] Error:', e);
    return serverErrorResponse();
  }
}
