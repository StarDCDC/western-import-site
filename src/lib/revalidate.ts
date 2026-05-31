// src/lib/revalidate.ts — drop cached reads after an admin write so changes show
// up on the site immediately (instead of waiting for the revalidate window).
import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from './queries';

type Entity = keyof typeof CACHE_TAGS;

/** Invalidate one or more cache tags. Call after create/update/delete in admin routes. */
export function revalidate(...entities: Entity[]) {
  for (const e of entities) {
    try {
      revalidateTag(CACHE_TAGS[e]);
    } catch {
      // revalidateTag throws outside a request scope (e.g. scripts) — ignore.
    }
  }
}
