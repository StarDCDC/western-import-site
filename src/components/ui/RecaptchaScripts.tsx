'use client';

import { useEffect } from 'react';
import { getRecaptchaSiteKey } from '@/lib/captcha';

export default function RecaptchaScripts() {
  useEffect(() => {
    const siteKey = getRecaptchaSiteKey();
    if (!siteKey) return;

    // Load reCAPTCHA v3 script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      const existing = document.querySelector(`script[src*="recaptcha"][src*="${siteKey}"]`);
      if (existing) existing.remove();
    };
  }, []);

  return null;
}