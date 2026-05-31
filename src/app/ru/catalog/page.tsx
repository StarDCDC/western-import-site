// src/app/ru/catalog/page.tsx — Russian catalog route. Server Component that
// reuses the (server-rendered) RO catalog page and forces the 'ru' locale.
import CatalogPage from '@/app/catalog/page';
import LocaleSetter from '@/components/ui/LocaleSetter';

export const dynamic = 'force-dynamic';

export default async function CatalogRuPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <>
      <LocaleSetter locale="ru" />
      <CatalogPage searchParams={searchParams} />
    </>
  );
}
