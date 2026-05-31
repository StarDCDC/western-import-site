// src/components/ui/LocaleSetter.tsx — tiny client helper to force a locale on
// the localized (/ru) routes. Rendered alongside Server Components.
'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/components/ui/LanguageProvider';

export default function LocaleSetter({ locale }: { locale: 'ro' | 'ru' }) {
  const { locale: current, setLocale } = useLanguage();
  useEffect(() => {
    if (current !== locale) setLocale(locale);
  }, [current, locale, setLocale]);
  return null;
}
