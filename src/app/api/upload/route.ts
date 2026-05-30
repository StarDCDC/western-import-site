import { NextRequest } from 'next/server';
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

    // Upload to catbox.moe — free, no API key, permanent
    const buffer = Buffer.from(await file.arrayBuffer());
    const blob = new Blob([buffer], { type: file.type });

    const uploadForm = new FormData();
    uploadForm.append('reqtype', 'fileupload');
    uploadForm.append('fileToUpload', blob, file.name || 'image.jpg');

    const res = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: uploadForm,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[UPLOAD] Catbox error:', errText);
      return errorResponse('Upload eșuat — încearcă din nou');
    }

    const url = (await res.text()).trim();
    if (!url.startsWith('https://')) {
      console.error('[UPLOAD] Invalid response:', url);
      return errorResponse('Upload eșuat — răspuns invalid');
    }

    console.log('[UPLOAD] Catbox OK:', url);

    return successResponse({
      url,
      filename: file.name,
      size: file.size,
      type: file.type,
    }, 201);
  } catch (e) {
    console.error('[UPLOAD] Error:', e);
    return serverErrorResponse();
  }
}
