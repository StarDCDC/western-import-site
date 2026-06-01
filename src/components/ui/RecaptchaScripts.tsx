'use client';

import { useEffect } from 'react';
import { getRecaptchaSiteKey } from '@/lib/captcha';

// Only load reCAPTCHA on pages that actually need it (checkout, contact).
// Not loaded globally to avoid the extra network request on every page.
export default function RecaptchaScripts() {
  useEffect(() => {
    const siteKey = getRecaptchaSiteKey();
    if (!siteKey) return;

    // Check if we're on a page that needs recaptcha
    const needsRecaptcha = /\/(checkout|contact|login|register)/.test(window.location.pathname);
    if (!needsRecaptcha) return;

    const existing = document.querySelector(`script[src*="recaptcha"][src*="${siteKey}"]`);
    if (existing) return;

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    document.head.appendChild(script);

    return () => {
      const el = document.querySelector(`script[src*="recaptcha"][src*="${siteKey}"]`);
      if (el) el.remove();
    };
  }, []);

  return null;
}
