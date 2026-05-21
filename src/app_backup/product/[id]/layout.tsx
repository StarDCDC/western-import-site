// src/app/product/[id]/layout.tsx — Server layout for product structured data

import prisma from "@/lib/prisma";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

interface ProductLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ProductLayout({
  children,
  params,
}: ProductLayoutProps) {
  const { id } = await params;

  // Try to get product from DB for structured data
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { brand: true, category: true },
    });

    if (product) {
      const brand = product.brand as { name: string } | null;
      const category = product.category as { nameRo: string; slug: string } | null;

      return (
        <>
          <JsonLd
            data={productJsonLd({
              name: product.name,
              description: product.descriptionRo || "",
              price: product.price,
              oldPrice: product.oldPrice || undefined,
              brand: brand?.name,
              sku: product.sku || `WI-${product.id.padStart(4, "0")}`,
              condition: product.condition === "NEW" ? "nou" : "refurbished",
              inStock: product.stock > 0,
              rating: undefined,
              url: `/product/${product.id}`,
            })}
          />
          <JsonLd
            data={breadcrumbJsonLd([
              { name: "Acasă", url: "/" },
              { name: "Catalog", url: "/catalog" },
              ...(category
                ? [{ name: category.nameRo, url: `/catalog?category=${category.slug}` }]
                : []),
              { name: product.name, url: `/product/${product.id}` },
            ])}
          />
          {children}
        </>
      );
    }
  } catch {
    // DB not available — skip structured data
  }

  return <>{children}</>;
}
