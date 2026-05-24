// src/app/page/layout.tsx — Adds structured data to homepage via server layout

import { organizationJsonLd, websiteJsonLd, localBusinessJsonLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={localBusinessJsonLd()} />
      {children}
    </>
  );
}
