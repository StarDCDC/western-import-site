'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/components/ui/LanguageProvider';

// Re-export catalog page with RU locale forced
import CatalogPage from '@/app/catalog/page';

export default function CatalogRuPage() {
  const { locale, setLocale } = useLanguage();

  useEffect(() => {
    if (locale !== 'ru') setLocale('ru');
  }, [locale, setLocale]);

  return <CatalogPage />;
}
