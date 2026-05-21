'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { translations } from '@/lib/translations';

export type Language = 'ro' | 'ru';

export function useLanguage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentLang, setCurrentLang] = useState<Language>('ro');

  // Get language from URL or localStorage
  useEffect(() => {
    const urlLang = searchParams.get('lang') as Language;
    const savedLang = localStorage.getItem('language') as Language;
    
    const lang = urlLang || savedLang || 'ro';
    setCurrentLang(lang);
  }, [searchParams]);

  const setLanguage = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem('language', lang);
    
    // Create new URL with language parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', lang);
    const newPath = `${window.location.pathname}?${params.toString()}`;
    
    router.push(newPath);
  };

  const t = (currentLang === 'ro' || currentLang === 'ru') ? translations[currentLang] : translations.ro;

  return { currentLang, setLanguage, t };
}