// src/app/terms/layout.tsx — Server layout for terms page structured data

import type { Metadata } from "next";
import { breadcrumbJsonLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Termeni și Condiții",
  description:
    "Termenii și condițiile de utilizare a site-ului Western Import. Informații despre comenzi, plată, livrare, returnare și drepturile consumatorului.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Termeni și Condiții — Western Import",
    description: "Termenii și condițiile de utilizare a site-ului Western Import.",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Acasă", url: "/" },
          { name: "Termeni și Condiții", url: "/terms" },
        ])}
      />
      {children}
    </>
  );
}
