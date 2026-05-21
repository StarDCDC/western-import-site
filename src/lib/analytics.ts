// ─── Analytics Initialization Helpers ──────────────────────────────

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    ttq?: { track: (...args: unknown[]) => void; identify: (...args: unknown[]) => void; page: () => void };
    dataLayer?: unknown[];
    _fbq?: unknown[];
  }
}

// ─── Facebook Pixel ────────────────────────────────────────────────
export function initFacebookPixel(pixelId: string) {
  if (typeof window === 'undefined' || !pixelId) return;

  // Prevent double init
  if (window.fbq) return;

  /* eslint-disable */
  // @ts-ignore
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  // @ts-expect-error fbq init
  window.fbq('init', pixelId);
  // @ts-expect-error fbq track
  window.fbq('track', 'PageView');
  /* eslint-enable */
}

// ─── Google Analytics ──────────────────────────────────────────────
export function initGoogleAnalytics(measurementId: string) {
  if (typeof window === 'undefined' || !measurementId) return;

  // Prevent double init
  if (document.querySelector(`script[src*="${measurementId}"]`)) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args: unknown[]) {
    // @ts-ignore
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
}

// ─── TikTok Pixel ──────────────────────────────────────────────────
export function initTikTokPixel(pixelId: string) {
  if (typeof window === 'undefined' || !pixelId) return;

  // Prevent double init
  if (window.ttq) return;

  /* eslint-disable */
  // @ts-ignore
  !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date;var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load(pixelId);ttq.page()}(window,document,"ttq");
  /* eslint-enable */
}

// ─── Track Events ──────────────────────────────────────────────────
export function trackPageView() {
  window.fbq?.('track', 'PageView');
  window.gtag?.('event', 'page_view');
  window.ttq?.page();
}

export function trackAddToCart(product: { id: string; name: string; price: number; currency?: string }) {
  window.fbq?.('track', 'AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    value: product.price,
    currency: product.currency || 'MDL',
  });
  window.gtag?.('event', 'add_to_cart', {
    items: [{ id: product.id, name: product.name, price: product.price }],
  });
  window.ttq?.track('AddToCart', { content_id: product.id, content_name: product.name, price: product.price });
}

export function trackPurchase(order: { id: string; total: number; currency?: string }) {
  window.fbq?.('track', 'Purchase', { value: order.total, currency: order.currency || 'MDL' });
  window.gtag?.('event', 'purchase', { transaction_id: order.id, value: order.total });
  window.ttq?.track('CompletePayment', { content_id: order.id, value: order.total });
}

export function trackSearch(query: string) {
  window.fbq?.('track', 'Search', { search_string: query });
  window.gtag?.('event', 'search', { search_term: query });
  window.ttq?.track('Search', { query });
}
