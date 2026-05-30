'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/components/ui/LanguageProvider';
import CheckoutPage from '@/app/checkout/page';

export default function CheckoutRuPage() {
  const { locale, setLocale } = useLanguage();

  useEffect(() => {
    if (locale !== 'ru') setLocale('ru');
  }, [locale, setLocale]);

  return <CheckoutPage />;
}
