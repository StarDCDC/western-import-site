import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: process.env.NODE_ENV === 'development'
      ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://elfsight.com/; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src * data:; connect-src *; frame-src https://www.google.com/ https://www.google.com/maps/ https://www.googlemaps.com/ https://elfsight.com/;"
      : "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://elfsight.com/; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src * data:; connect-src *; frame-src https://www.google.com/ https://www.google.com/maps/ https://www.googlemaps.com/ https://elfsight.com/;",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
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
