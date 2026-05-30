'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/components/ui/LanguageProvider';
import BlogPage from '@/app/blog/page';

export default function BlogRuPage() {
  const { locale, setLocale } = useLanguage();

  useEffect(() => {
    if (locale !== 'ru') setLocale('ru');
  }, [locale, setLocale]);

  return <BlogPage />;
}
