import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Removed X-Frame-Options — IutePay SDK opens checkout iframe from ecom.iutecredit.md
  // SAMEORIGIN would block it. CSP frame-src below handles security instead.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  // Allow IutePay SDK to load scripts and open iframes
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://ecom.iutecredit.md",
      "style-src 'self' 'unsafe-inline' https://ecom.iutecredit.md https://fonts.googleapis.com",
      "frame-src 'self' https://ecom.iutecredit.md https://iutecredit.md https://iute.md https://www.google.com https://maps.google.com https://www.openstreetmap.org",
      "connect-src 'self' https://ecom.iutecredit.md https://iutecredit.md https://preprod.aventus.md",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com https://ecom.iutecredit.md",
      "worker-src 'self' blob:",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },

  allowedDevOrigins: ['172.25.17.179', 'localhost'],
  devIndicators: false,
  // removed — conflicts with Turbopack path resolution
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "western.md" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.picrd.com" },
      { protocol: "https", hostname: "files.catbox.moe" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  headers: async () => [
    {
      source: "/(.*)",
      headers: securityHeaders,
    },
    {
      source: "/api/settings",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=60, stale-while-revalidate=120",
        },
      ],
    },
    {
      source: "/api/products",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=30, stale-while-revalidate=60",
        },
      ],
    },
    {
      source: "/api/products/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=60, stale-while-revalidate=120",
        },
      ],
    },
    {
      source: "/api/banners",
      headers: [
        {
          key: "Cache-Control",
          // Banners change rarely — let the browser cache them too (not just a CDN).
          value: "public, max-age=120, s-maxage=120, stale-while-revalidate=300",
        },
      ],
    },
    {
      source: "/api/categories",
      headers: [
        {
          key: "Cache-Control",
          // Categories change rarely — browser-cacheable for snappy filter loads.
          value: "public, max-age=120, s-maxage=300, stale-while-revalidate=600",
        },
      ],
    },
    {
      source: "/:path*.{jpg,jpeg,png,webp,svg,ico,woff,woff2,ttf,eot}",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      source: "/sitemap.xml",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=3600, s-maxage=3600",
        },
      ],
    },
    {
      source: "/robots.txt",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=86400, s-maxage=86400",
        },
      ],
    },
  ],
};

export default nextConfig;
