'use client';

import { useEffect, useState } from 'react';
import { initFacebookPixel, initGoogleAnalytics, initTikTokPixel } from '@/lib/analytics';
import { useSettings } from '@/lib/useSettings';

export default function AnalyticsScripts() {
  const settings = useSettings();

  useEffect(() => {
    if (settings.FACEBOOK_PIXEL_ID) initFacebookPixel(settings.FACEBOOK_PIXEL_ID);
    if (settings.GOOGLE_ANALYTICS_ID) initGoogleAnalytics(settings.GOOGLE_ANALYTICS_ID);
    if (settings.TIKTOK_PIXEL_ID) initTikTokPixel(settings.TIKTOK_PIXEL_ID);
  }, [settings]);

  return null;
}
