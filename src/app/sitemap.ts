// src/app/sitemap.ts — Dynamic sitemap.xml

import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://westernimport.md";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ─── Static pages ─────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/catalog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/shipping`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/warranty`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/cookies`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    // Russian versions
    {
      url: `${SITE_URL}/ru/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/ru/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/ru/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // ─── Dynamic product pages ────────────────────────────────────
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true },
    });

    productPages = products.map((p) => ({
      url: `${SITE_URL}/product/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB not available — skip dynamic products
  }

  // ─── Dynamic category pages ───────────────────────────────────
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true },
    });

    categoryPages = categories.map((c) => ({
      url: `${SITE_URL}/catalog?category=${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // DB not available — skip dynamic categories
  }

  // ─── Dynamic blog posts ───────────────────────────────────────
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });

    blogPages = posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // DB not available — skip dynamic blog posts
  }

  return [
    ...staticPages,
    ...productPages,
    ...categoryPages,
    ...blogPages,
  ];
}
