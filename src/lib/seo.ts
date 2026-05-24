// src/lib/seo.ts — SEO helpers for metadata, canonical URLs, and structured data

import type { Metadata } from "next";

// ─── Constants ──────────────────────────────────────────────────────

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://westernimport.md";
export const SITE_NAME = "Western Import";
export const DEFAULT_LOCALE = "ro_MD";

// ─── Canonical URL helper ──────────────────────────────────────────

export function canonicalUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

// ─── Open Graph image helper ───────────────────────────────────────

export function ogImage(path?: string): string {
  if (path) return path.startsWith("http") ? path : `${SITE_URL}${path}`;
  return `${SITE_URL}/og-default.jpg`;
}

// ─── Base metadata factory ─────────────────────────────────────────

interface BaseMetaOptions {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "product";
  locale?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export function generatePageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  locale = "ro_MD",
  publishedTime,
  modifiedTime,
}: BaseMetaOptions): Metadata {
  const url = canonicalUrl(path);
  const img = ogImage(image);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        "ro-MD": url,
        "ru-MD": `${SITE_URL}/ru${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale,
      type: type === "article" ? "article" : "website",
      images: [
        {
          url: img,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === "article" && publishedTime
        ? { publishedTime }
        : {}),
      ...(type === "article" && modifiedTime
        ? { modifiedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [img],
    },
  };
}

// ─── Product metadata ──────────────────────────────────────────────

interface ProductMetaOptions {
  name: string;
  price: number;
  oldPrice?: number;
  currency?: string;
  description: string;
  path: string;
  image?: string;
  condition?: string;
  inStock?: boolean;
}

export function generateProductMetadata({
  name,
  price,
  description,
  path,
  image,
  condition,
  inStock,
}: ProductMetaOptions): Metadata {
  const title = `${name} — ${price.toLocaleString("ro-MD")} MDL`;
  const url = canonicalUrl(path);

  return {
    title,
    description: description.slice(0, 160),
    alternates: {
      canonical: url,
      languages: {
        "ro-MD": url,
        "ru-MD": `${SITE_URL}/ru${path}`,
      },
    },
    openGraph: {
      title,
      description: description.slice(0, 200),
      url,
      siteName: SITE_NAME,
      locale: DEFAULT_LOCALE,
      type: "website",
      images: [
        {
          url: ogImage(image),
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description.slice(0, 200),
      images: [ogImage(image)],
    },
  };
}

// ─── Category metadata ─────────────────────────────────────────────

interface CategoryMetaOptions {
  name: string;
  description?: string;
  path: string;
}

export function generateCategoryMetadata({
  name,
  description,
  path,
}: CategoryMetaOptions): Metadata {
  const title = `${name} — Catalog Western Import`;
  const desc =
    description ||
    `Cumpără ${name.toLowerCase()} la prețuri avantajoase. Livrare în toată Moldova. Garanție reală.`;

  return generatePageMetadata({
    title,
    description: desc,
    path,
    type: "website",
  });
}

// ─── Blog article metadata ─────────────────────────────────────────

interface BlogMetaOptions {
  title: string;
  excerpt: string;
  slug: string;
  image?: string;
  author?: string;
  publishedTime?: string;
}

export function generateBlogMetadata({
  title,
  excerpt,
  slug,
  image,
  author,
  publishedTime,
}: BlogMetaOptions): Metadata {
  return generatePageMetadata({
    title,
    description: excerpt,
    path: `/blog/${slug}`,
    image,
    type: "article",
    publishedTime,
  });
}

// ─── Structured Data: Product ──────────────────────────────────────

export interface ProductSchemaData {
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  currency?: string;
  image?: string;
  brand?: string;
  sku?: string;
  condition?: string;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
  url?: string;
}

export function productJsonLd(data: ProductSchemaData) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.name,
    description: data.description,
    image: data.image ? ogImage(data.image) : undefined,
    brand: data.brand
      ? { "@type": "Brand", name: data.brand }
      : undefined,
    sku: data.sku,
    itemCondition:
      data.condition === "nou"
        ? "https://schema.org/NewCondition"
        : "https://schema.org/RefurbishedCondition",
    offers: {
      "@type": "Offer",
      url: data.url || undefined,
      priceCurrency: data.currency || "MDL",
      price: data.price,
      availability: data.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceValidUntil: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0],
      ...(data.oldPrice
        ? {
            priceSpecification: {
              "@type": "PriceSpecification",
              price: data.oldPrice,
              priceCurrency: "MDL",
            },
          }
        : {}),
    },
    ...(data.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: data.rating,
            bestRating: 5,
            worstRating: 1,
            reviewCount: data.reviewCount || 1,
          },
        }
      : {}),
  };
}

// ─── Structured Data: Organization ─────────────────────────────────

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "Laptopuri, telefoane și electronică premium la prețuri accesibile. Garanție reală și livrare în toată Moldova.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "str. Podgorenilor 17",
      addressLocality: "Chișinău",
      addressCountry: "MD",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+373-60-000-000",
        contactType: "customer service",
        availableLanguage: ["Romanian", "Russian"],
      },
    ],
    sameAs: [
      "https://www.facebook.com/westernimport",
      "https://www.instagram.com/westernimport",
    ],
  };
}

// ─── Structured Data: WebSite with SearchAction ────────────────────

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/catalog?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ─── Structured Data: LocalBusiness ────────────────────────────────

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: SITE_NAME,
    image: `${SITE_URL}/logo.png`,
    "@id": SITE_URL,
    url: SITE_URL,
    telephone: "+373-60-000-000",
    address: {
      "@type": "PostalAddress",
      streetAddress: "str. Podgorenilor 17",
      addressLocality: "Chișinău",
      addressRegion: "Chișinău",
      postalCode: "MD-2001",
      addressCountry: "MD",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 47.0456,
      longitude: 28.8345,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "10:00",
        closes: "15:00",
      },
    ],
    priceRange: "$$",
    currenciesAccepted: "MDL",
    paymentAccepted: "Cash, Credit Card",
  };
}

// ─── Structured Data: Product (enhanced) ─────────────────────────

export interface ProductSchema {
  name: string;
  description: string;
  price: number;
  currency?: string;
  image?: string;
  brand?: string;
  sku?: string;
  condition?: string;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
  url?: string;
}

export function generateProductSchema(product: ProductSchema) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image ? ogImage(product.image) : undefined,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    itemCondition:
      product.condition === "nou"
        ? "https://schema.org/NewCondition"
        : "https://schema.org/RefurbishedCondition",
    offers: {
      "@type": "Offer",
      url: product.url || undefined,
      priceCurrency: product.currency || "MDL",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    ...(product.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            bestRating: 5,
            worstRating: 1,
            reviewCount: product.reviewCount || 1,
          },
        }
      : {}),
  };
}

// ─── Structured Data: Organization (enhanced) ─────────────────────

export interface OrganizationSchemaOptions {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  socialLinks?: string[];
}

export function generateOrganizationSchema({
  name = SITE_NAME,
  url = SITE_URL,
  logo = `${SITE_URL}/logo.png`,
  description = "Laptopuri, telefoane și electronică premium la prețuri accesibile. Garanție reală și livrare în toată Moldova.",
  address = "str. Podgorenilor 17",
  city = "Chișinău",
  phone = "+373 69 466 585",
  email = "info@westernimport.md",
  socialLinks = ["https://www.facebook.com/westernimport", "https://www.instagram.com/westernimport"],
}: OrganizationSchemaOptions = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: city,
      addressCountry: "MD",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: phone,
        email,
        contactType: "customer service",
        availableLanguage: ["Romanian", "Russian"],
      },
    ],
    sameAs: socialLinks,
  };
}

// ─── Structured Data: BreadcrumbList ───────────────────────────────

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: canonicalUrl(item.url),
    })),
  };
}

// ─── Structured Data: FAQ ──────────────────────────────────────────

export interface FAQItem {
  question: string;
  answer: string;
}

export function faqJsonLd(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

// ─── Structured Data: BlogPosting ──────────────────────────────────

export interface BlogPostSchemaData {
  title: string;
  excerpt: string;
  slug: string;
  image?: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
}

export function blogPostingJsonLd(data: BlogPostSchemaData) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: data.title,
    description: data.excerpt,
    image: data.image ? ogImage(data.image) : undefined,
    author: {
      "@type": "Person",
      name: data.author || "Western Import",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    url: canonicalUrl(`/blog/${data.slug}`),
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl(`/blog/${data.slug}`),
    },
  };
}
