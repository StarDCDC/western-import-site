// src/components/ui/IutePaySDK.tsx — Lazy IutePay SDK Loader
// Only loads when user navigates to a page that might need credit checkout.
// The SDK is NOT loaded on every page — only product and checkout pages.
'use client';

import { useEffect, useState } from 'react';

const IUTEPAY_LANG = 'md';
const IUTEPAY_KEY = process.env.NEXT_PUBLIC_IUTE_CREDIT_API_KEY || 'e757e925-8e5c-4ccf-9712-edf093290032';

function needsIutePay(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname;
  // Only load on product pages, checkout, and catalog (where credit widgets appear)
  return /\/(product|checkout|catalog)/.test(path);
}

function loadIutePaySDK() {
  // CSS
  if (!document.querySelector('link[href*="iutepay.css"]')) {
    const link = document.createElement('link');
    link.href = 'https://ecom.iutecredit.md/iutepay.css';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    document.head.appendChild(link);
  }

  // JS
  if (!document.querySelector('script[src*="iutepay.js"]')) {
    const script = document.createElement('script');
    script.src = 'https://ecom.iutecredit.md/iutepay.js';
    script.async = true;
    script.onload = () => {
      // @ts-expect-error IutePay global
      if (window.iute) {
        // @ts-expect-error IutePay global
        window.iute.configure(IUTEPAY_KEY, IUTEPAY_LANG);
      }
    };
    document.head.appendChild(script);
  }
}

export default function IutePaySDK() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (needsIutePay()) {
      setShouldLoad(true);
    }
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    loadIutePaySDK();
  }, [shouldLoad]);

  // Also listen for route changes — if user navigates to a product page
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (!shouldLoad && needsIutePay()) {
        setShouldLoad(true);
      }
    });
    // Observe URL changes via history
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      if (needsIutePay()) setShouldLoad(true);
    };
    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      if (needsIutePay()) setShouldLoad(true);
    };
    window.addEventListener('popstate', () => {
      if (needsIutePay()) setShouldLoad(true);
    });

    return () => observer.disconnect();
  }, [shouldLoad]);

  return null;
}
