// src/app/robots.ts — robots.txt

import { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://westernimport.md";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/catalog",
          "/product",
          "/about",
          "/contact",
          "/blog",
          "/shipping",
          "/warranty",
          "/terms",
          "/privacy",
          "/cookies",
          "/ru",
        ],
        disallow: [
          "/admin",
          "/api",
          "/account",
          "/checkout",
          "/cart",
          "/login",
          "/register",
          "/favorites",
          "/wishlist",
          "/compare",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
