// src/components/seo/JsonLd.tsx — Reusable JSON-LD structured data component

interface JsonLdProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

/**
 * Renders a JSON-LD <script> tag for structured data.
 * Usage: <JsonLd data={productJsonLd({...})} />
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Renders multiple JSON-LD blocks at once.
 * Usage: <JsonLdArray data={[organizationJsonLd(), websiteJsonLd()]} />
 */
interface JsonLdArrayProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[];
}

export function JsonLdArray({ data }: JsonLdArrayProps) {
  return (
    <>
      {data.map((item, i) => (
        <JsonLd key={i} data={item} />
      ))}
    </>
  );
}
