'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/components/ui/LanguageProvider';
import BlogPostPage from '@/app/blog/[slug]/page';

export default function BlogPostRuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { locale, setLocale } = useLanguage();

  useEffect(() => {
    if (locale !== 'ru') setLocale('ru');
  }, [locale, setLocale]);

  return <BlogPostPage params={params} />;
}
