'use client';

import { useState, useEffect } from 'react';

interface SiteSettings {
  site_phone?: string;
  site_email?: string;
  email?: string;
  phone?: string;
  address?: string;
  site_address?: string;
  WHATSAPP_NUMBER?: string;
  FACEBOOK_PIXEL_ID?: string;
  GOOGLE_ANALYTICS_ID?: string;
  TIKTOK_PIXEL_ID?: string;
  [key: string]: string | undefined;
}

// Singleton cache — shared across all component instances
let cachedSettings: SiteSettings | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5_000; // 5 seconds for fast admin updates
let fetchPromise: Promise<SiteSettings> | null = null;

async function fetchSettings(): Promise<SiteSettings> {
  if (cachedSettings && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedSettings;
  }
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch('/api/settings')
    .then(r => r.json())
    .then(json => {
      const s: SiteSettings = {};
      if (json.success && json.data?.settings) {
        Object.assign(s, json.data.settings);
      }
      cachedSettings = s;
      cacheTimestamp = Date.now();
      fetchPromise = null;
      return s;
    })
    .catch(() => {
      fetchPromise = null;
      return cachedSettings || {};
    });

  return fetchPromise;
}

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(cachedSettings || {});

  useEffect(() => {
    fetchSettings().then(setSettings);
  }, []);

  return settings;
}

export { fetchSettings };
