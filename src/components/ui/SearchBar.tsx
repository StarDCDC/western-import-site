// src/components/ui/SearchBar.tsx
'use client';

import { Search, X, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { formatPrice } from '@/lib/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  condition: string;
  images: string;
  category: { id: string; nameRo: string; nameRu: string; slug: string };
  brand: { id: string; name: string; slug: string };
  specs: string | Record<string, string>;
}

export default function SearchBar() {
  const { locale } = useLanguage();
  const isRu = locale === 'ru';
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [searching, setSearching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setTotal(0);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setResults(json.data.products || []);
          setTotal(json.data.total || 0);
        }
      }
    } catch {
      // silently fail
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => doSearch(query), 300);
      setOpen(true);
    } else {
      setResults([]);
      setTotal(0);
      setOpen(false);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const getImageUrl = (imagesStr: string): string | null => {
    try {
      const parsed = JSON.parse(imagesStr);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    } catch { /* not json */ }
    if (typeof imagesStr === 'string') {
      if (imagesStr.startsWith('http')) return imagesStr.split(',')[0].trim();
      // Comma-separated URLs
      if (imagesStr.includes('http')) {
        const parts = imagesStr.split(',');
        for (const p of parts) {
          const trimmed = p.trim();
          if (trimmed.startsWith('http')) return trimmed;
        }
      }
    }
    return null;
  };

  const getSpecSummary = (specs: string | Record<string, string>): string => {
    if (typeof specs === 'string') {
      try {
        const parsed = JSON.parse(specs);
        return [parsed.procesor, parsed.ram, parsed.display].filter(Boolean).join(', ');
      } catch {
        return '';
      }
    }
    return [specs?.procesor, specs?.ram, specs?.display].filter(Boolean).join(', ');
  };

  const closeDropdown = () => {
    setOpen(false);
    setQuery('');
    setResults([]);
  };

  return (
    <div ref={ref} className="relative flex-1 max-w-xl">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={isRu ? "Поиск ноутбуков, телефонов, аксессуаров..." : "Caută laptopuri, telefoane, accesorii..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          className="w-full py-2.5 pl-4 pr-20 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-primary dark:focus:border-primary-light transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setOpen(false);
              setResults([]);
            }}
            className="absolute right-14 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary text-white rounded-lg px-3 py-1.5 text-sm hover:bg-primary-dark transition-colors">
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
        {/* Keyboard shortcut hint */}
        <kbd className="hidden lg:flex absolute right-[52px] top-1/2 -translate-y-1/2 items-center gap-0.5 text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">
          <span>⌘</span>K
        </kbd>
      </div>

      <AnimatePresence>
        {open && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
          >
            {searching ? (
              <div className="px-4 py-6 text-sm text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Căutare...
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                  {results.map((p) => {
                    const imgUrl = getImageUrl(p.images);
                    return (
                      <Link
                        key={p.id}
                        href={`/product/${p.id}`}
                        onClick={closeDropdown}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        {/* Thumbnail */}
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-600 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                          {imgUrl ? (
                            <Image src={imgUrl} alt={p.name} width={48} height={48} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-slate-400">
                              {p.brand?.name?.slice(0, 2).toUpperCase() || '?'}
                            </span>
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{p.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500">{p.category?.nameRo || ''}</span>
                            {p.brand && (
                              <>
                                <span className="text-xs text-slate-300">•</span>
                                <span className="text-xs text-slate-500">{p.brand.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {/* Price */}
                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold text-primary-dark dark:text-primary">{formatPrice(p.price)}</div>
                          {p.oldPrice && (
                            <div className="text-[11px] text-slate-400 line-through">{formatPrice(p.oldPrice)}</div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
                {/* Footer: See all results */}
                {total > results.length && (
                  <Link
                    href={`/catalog?search=${encodeURIComponent(query)}`}
                    onClick={closeDropdown}
                    className="block px-4 py-3 text-center text-sm font-semibold text-primary hover:bg-slate-50 dark:hover:bg-slate-700/50 border-t border-slate-100 dark:border-slate-700 transition-colors"
                  >
                    {isRu ? `Все ${total} результатов →` : `Vezi toate cele ${total} rezultate →`}
                  </Link>
                )}
              </>
            ) : (
              <div className="px-4 py-6 text-sm text-slate-500 text-center">
                <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                {isRu ? `Ничего не найдено для "${query}"` : `Niciun rezultat pentru \u201C${query}\u201D`}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
