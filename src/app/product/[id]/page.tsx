// src/app/product/[id]/page.tsx — Server Component: fetches the product on the
// server so the HTML ships fully rendered (no client fetch waterfall).
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductData } from '@/lib/queries';
import ProductClient from './ProductClient';

// ISR with 30s revalidation. Admin writes trigger revalidateTag() for instant updates.
export const revalidate = 30;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const data = await getProductData(id);
    if (!data) return { title: 'Produs negăsit' };
    const { product } = data;
    const desc = (product.description || '').slice(0, 160) || `${product.name} — Western Import`;
    const image = Array.isArray(product.images) ? product.images[0] : undefined;
    return {
      title: product.name,
      description: desc,
      openGraph: {
        title: product.name,
        description: desc,
        ...(image ? { images: [{ url: image }] } : {}),
      },
    };
  } catch {
    return {};
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProductData(id);
  if (!data) notFound();
  return <ProductClient product={data.product} similar={data.similar} />;
}
