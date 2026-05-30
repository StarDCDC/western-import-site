'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/components/ui/LanguageProvider';
import CartPage from '@/app/cart/page';

export default function CartRuPage() {
  const { locale, setLocale } = useLanguage();

  useEffect(() => {
    if (locale !== 'ru') setLocale('ru');
  }, [locale, setLocale]);

  return <CartPage />;
}
