// src/app/catalog/layout.tsx — Server layout for catalog structured data

import { breadcrumbJsonLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Acasă", url: "/" },
          { name: "Catalog", url: "/catalog" },
        ])}
      />
      {children}
    </>
  );
}
