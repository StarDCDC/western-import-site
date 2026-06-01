// src/lib/revalidate.ts — drop cached reads after an admin write so changes show
// up on the site immediately (instead of waiting for the revalidate window).
import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from './queries';

type Entity = keyof typeof CACHE_TAGS;

// Next 16 types revalidateTag as (tag, profile) for the Cache Components model,
// but the single-tag form still works at runtime for unstable_cache tags. Cast
// so the build is happy; the short `revalidate` window in queries.ts is the
// safety net if this ever no-ops.
const revalidateTagCompat = revalidateTag as unknown as (tag: string) => void;

/** Invalidate one or more cache tags. Call after create/update/delete in admin routes. */
export function revalidate(...entities: Entity[]) {
  for (const e of entities) {
    try {
      revalidateTagCompat(CACHE_TAGS[e]);
    } catch {
      // revalidateTag throws outside a request scope (e.g. scripts) — ignore.
    }
  }
}
