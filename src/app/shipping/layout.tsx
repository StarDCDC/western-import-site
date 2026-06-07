// src/app/shipping/layout.tsx — Server layout for shipping page structured data

import type { Metadata } from "next";
import { breadcrumbJsonLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Livrare și Returnare",
  description:
    "Informații despre livrarea și returnarea produselor Western Import. Curier Chișinău, livrare națională, ridicare din magazin.",
  alternates: {
    canonical: "/shipping",
  },
  openGraph: {
    title: "Livrare și Returnare — Western Import",
    description: "Informații livrare și returnare produse Western Import.",
  },
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Acasă", url: "/" },
          { name: "Livrare și Returnare", url: "/shipping" },
        ])}
      />
      {children}
    </>
  );
}
