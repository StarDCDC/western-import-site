// src/app/warranty/layout.tsx — Server layout for warranty page structured data

import type { Metadata } from "next";
import { breadcrumbJsonLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Garanție",
  description:
    "Politica de garanție Western Import. Perioade de garanție, ce acoperă, procedura de service și contact.",
  alternates: {
    canonical: "/warranty",
  },
  openGraph: {
    title: "Garanție — Western Import",
    description: "Politica de garanție Western Import.",
  },
};

export default function WarrantyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Acasă", url: "/" },
          { name: "Garanție", url: "/warranty" },
        ])}
      />
      {children}
    </>
  );
}
