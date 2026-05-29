import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';

// POST /api/upload — image upload to Cloudinary (free 25GB)
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

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) return errorResponse('Fișier prea mare. Maxim 5MB');

    const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
    const API_KEY = process.env.CLOUDINARY_API_KEY;
    const API_SECRET = process.env.CLOUDINARY_API_SECRET;

    // If Cloudinary is configured, upload there
    if (CLOUD_NAME && API_KEY && API_SECRET) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString('base64');
      const dataUri = `data:${file.type};base64,${base64}`;

      const timestamp = Math.floor(Date.now() / 1000).toString();

      // Generate signature
      const crypto = await import('crypto');
      const signatureStr = `folder=western-import&timestamp=${timestamp}${API_SECRET}`;
      const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

      const cloudFormData = new FormData();
      cloudFormData.append('file', dataUri);
      cloudFormData.append('folder', 'western-import');
      cloudFormData.append('timestamp', timestamp);
      cloudFormData.append('api_key', API_KEY);
      cloudFormData.append('signature', signature);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: cloudFormData,
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('[UPLOAD] Cloudinary error:', err);
        return errorResponse('Upload eșuat la Cloudinary');
      }

      const data = await res.json();
      return successResponse({
        url: data.secure_url,
        filename: data.public_id,
        size: data.bytes,
        type: file.type,
      }, 201);
    }

    // Fallback: local filesystem (for dev only)
    const { writeFile, mkdir } = await import('fs/promises');
    const path = await import('path');
    const { randomUUID } = await import('crypto');

    const bytes = await file.arrayBuffer();
    const bufferLocal = Buffer.from(bytes);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, bufferLocal);

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
