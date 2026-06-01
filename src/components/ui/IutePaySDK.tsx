// src/components/ui/IutePaySDK.tsx — Official IutePay SDK Loader
// Docs: inject iutepay.js + iutepay.css in <head>, configure with public key
'use client';

import Script from 'next/script';

/**
 * Loads the official IutePay JavaScript SDK + CSS and configures it.
 * Must be loaded on ALL pages (docs: "must be loaded on all pages, even on pages that do not feature products").
 */
export default function IutePaySDK() {
  const publicKey = process.env.NEXT_PUBLIC_IUTE_CREDIT_API_KEY;
  const lang = 'md'; // Moldova

  if (!publicKey) return null;

  return (
    <>
      <link
        href="https://ecom.iutecredit.md/iutepay.css"
        rel="stylesheet"
        type="text/css"
      />
      <Script
        src="https://ecom.iutecredit.md/iutepay.js"
        strategy="afterInteractive"
        onLoad={() => {
          // @ts-expect-error IutePay global
          if (window.iute) {
            // @ts-expect-error IutePay global
            window.iute.configure(publicKey, lang);
          }
        }}
      />
    </>
  );
}
