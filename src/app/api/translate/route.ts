// src/app/api/translate/route.ts — lightweight on-demand translation proxy.
// Used to translate product descriptions to RU when no stored `descriptionRu`
// exists. Falls back gracefully to the original text on any error.
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Simple in-memory cache (per server instance) to avoid re-translating the same text.
const cache = new Map<string, string>();
const MAX_CACHE = 500;

async function translate(text: string, from: string, to: string): Promise<string> {
  const key = `${from}:${to}:${text}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  // 1) Optional self-hosted endpoint (TRANSLATE_API_URL, ?sl&dl&text → { 'destination-text' })
  const custom = process.env.TRANSLATE_API_URL;
  if (custom) {
    try {
      const res = await fetch(`${custom}?sl=${from}&dl=${to}&text=${encodeURIComponent(text)}`, { cache: 'no-store' });
      const data = await res.json();
      const out = data['destination-text'];
      if (out) { remember(key, out); return out; }
    } catch { /* fall through */ }
  }

  // 2) Public Google gtx endpoint (no key, keyless, widely used).
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      // data[0] = array of [translatedChunk, originalChunk, ...]
      const out = Array.isArray(data?.[0])
        ? data[0].map((seg: unknown[]) => (Array.isArray(seg) ? seg[0] : '')).join('')
        : '';
      if (out) { remember(key, out); return out; }
    }
  } catch { /* fall through */ }

  return text; // graceful fallback
}

function remember(key: string, value: string) {
  if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value as string);
  cache.set(key, value);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text') || '';
  const from = searchParams.get('from') || 'ro';
  const to = searchParams.get('to') || 'ru';

  if (!text.trim()) return NextResponse.json({ text: '' });

  const translated = await translate(text, from, to);
  return NextResponse.json(
    { text: translated },
    { headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' } },
  );
}
