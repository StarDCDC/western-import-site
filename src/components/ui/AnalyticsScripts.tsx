'use client';

import { useEffect, useState } from 'react';
import { initFacebookPixel, initGoogleAnalytics, initTikTokPixel } from '@/lib/analytics';

interface AnalyticsSettings {
  facebookPixelId?: string;
  googleAnalyticsId?: string;
  tiktokPixelId?: string;
}

export default function AnalyticsScripts() {
  const [settings, setSettings] = useState<AnalyticsSettings>({});

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const allSettings = await res.json();
          const map: Record<string, string> = {};
          if (Array.isArray(allSettings)) {
            allSettings.forEach((s: { key: string; value: string }) => { map[s.key] = s.value; });
          }
          setSettings({
            facebookPixelId: map.FACEBOOK_PIXEL_ID || '',
            googleAnalyticsId: map.GOOGLE_ANALYTICS_ID || '',
            tiktokPixelId: map.TIKTOK_PIXEL_ID || '',
          });
        }
      } catch { /* ignore */ }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings.facebookPixelId) initFacebookPixel(settings.facebookPixelId);
    if (settings.googleAnalyticsId) initGoogleAnalytics(settings.googleAnalyticsId);
    if (settings.tiktokPixelId) initTikTokPixel(settings.tiktokPixelId);
  }, [settings]);

  // This component renders nothing visible
  return null;
}
