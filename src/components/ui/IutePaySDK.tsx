'use client';

import Script from 'next/script';

/**
 * Loads the official IutePay JavaScript SDK and configures it with the public API key.
 * This must be a Client Component because it uses onLoad callback.
 */
export default function IutePaySDK() {
  const publicKey = process.env.NEXT_PUBLIC_IUTE_CREDIT_API_KEY;

  if (!publicKey) return null;

  return (
    <Script
      src="https://ecom.iutecredit.md/iutepay.js"
      strategy="afterInteractive"
      onLoad={() => {
        // @ts-expect-error IutePay global
        if (window.iute) {
          // @ts-expect-error IutePay global
          window.iute.configure(publicKey, 'md');
        }
      }}
    />
  );
}
