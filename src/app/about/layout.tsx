// src/app/about/layout.tsx — Server layout for about page structured data

import type { Metadata } from "next";
import { breadcrumbJsonLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Despre Noi",
  description:
    "Despre Western Import — povestea, misiunea, valorile și echipa din spatele magazinului de electronică premium din Chișinău.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "Despre Noi — Western Import",
    description: "Povestea, misiunea și valorile magazinului de electronică premium din Chișinău.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Acasă", url: "/" },
          { name: "Despre Noi", url: "/about" },
        ])}
      />
      {children}
    </>
  );
}
