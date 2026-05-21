// src/app/contact/layout.tsx — Server layout for contact page metadata + structured data

import type { Metadata } from "next";
import { organizationJsonLd, localBusinessJsonLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactează Western Import — telefon, email, adresă și program de lucru. Răspundem rapid la orice întrebare.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact — Western Import",
    description: "Contactează Western Import. Telefon, email, adresă și program.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={localBusinessJsonLd()} />
      {children}
    </>
  );
}
