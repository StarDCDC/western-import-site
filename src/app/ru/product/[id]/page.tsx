// src/app/ru/product/[id]/page.tsx — Russian product route. Server Component that
// reuses the (server-rendered) RO product page and forces the 'ru' locale.
import ProductPage from '@/app/product/[id]/page';
import LocaleSetter from '@/components/ui/LocaleSetter';

export const dynamic = 'force-dynamic';

export default async function ProductRuPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <LocaleSetter locale="ru" />
      <ProductPage params={params} />
    </>
  );
}
