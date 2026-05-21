// src/components/ui/LanguageProvider.tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { translations, type Locale } from '@/lib/i18n';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'ro',
  setLocale: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ro');

  useEffect(() => {
    const stored = localStorage.getItem('wi-locale') as Locale | null;
    if (stored && (stored === 'ro' || stored === 'ru')) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('wi-locale', newLocale);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[locale]?.[key] ?? translations['ro']?.[key] ?? key;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
