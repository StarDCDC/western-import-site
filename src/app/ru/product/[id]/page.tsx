'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/components/ui/LanguageProvider';
import ProductPage from '@/app/product/[id]/page';

export default function ProductRuPage() {
  const { locale, setLocale } = useLanguage();

  useEffect(() => {
    if (locale !== 'ru') setLocale('ru');
  }, [locale, setLocale]);

  return <ProductPage />;
}
