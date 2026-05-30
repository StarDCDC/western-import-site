// src/app/catalog/page.tsx
'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getProducts, getCategories, getBrands, formatPrice, getDiscount } from '@/lib/api';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, ShoppingCart, Heart, SlidersHorizontal, X, ChevronDown, ArrowUpDown } from 'lucide-react';
import type { Product } from '@/lib/data';
import type { ApiCategory } from '@/lib/api';
import type { Brand } from '@/lib/data';
import { useLanguage } from '@/components/ui/LanguageProvider';

type SortOption = 'popular' | 'price_asc' | 'price_desc' | 'newest';

const SORT_OPTIONS: { val: SortOption; labelKey: string }[] = [
  { val: 'popular', labelKey: 'catalog.popular' },
  { val: 'price_asc', labelKey: 'catalog.priceAsc' },
  { val: 'price_desc', labelKey: 'catalog.priceDesc' },
  { val: 'newest', labelKey: 'catalog.newest' },
];

// Spec filter fields for tech products
const SPEC_FILTER_FIELDS: { key: string; label: string }[] = [
  { key: 'display', label: 'Display' },
  { key: 'storage', label: 'Stocare' },
  { key: 'weight', label: 'Greutate' },
  { key: 'refreshRate', label: 'Frecvență ecran' },
  { key: 'ram', label: 'Memorie RAM' },
  { key: 'gpuModel', label: 'Model Placă Video' },
  { key: 'cpuModel', label: 'Model Procesor' },
  { key: 'resolution', label: 'Rezoluție' },
  { key: 'gpuSeries', label: 'Serie Placă Video' },
  { key: 'cpuSeries', label: 'Serie Procesor' },
  { key: 'os', label: 'Sistem de Operare' },
  { key: 'storageType', label: 'Tip Stocare' },
  { key: 'gpuType', label: 'Tip Placă Video' },
];

function CatalogContent() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category') ? [searchParams.get('category')!] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brand') ? [searchParams.get('brand')!] : []
  );
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    searchParams.get('condition') ? [searchParams.get('condition')!] : []
  );
  const [priceMin, setPriceMin] = useState(Number(searchParams.get('minPrice')) || 0);
  const [priceMax, setPriceMax] = useState(Number(searchParams.get('maxPrice')) || 50000);
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'popular');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  // searchQuery is LOCAL ONLY to this component. We write it to URL only via debounce.
  // We NEVER read search from URL into searchQuery — that was causing the input reset loop.
  const [searchQuery, setSearchQuery] = useState('');
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchChangeSource = useRef<'input' | 'url' | null>(null);
  const urlUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mobileFilters, setMobileFilters] = useState(false);

  const [categoryList, setCategoryList] = useState<ApiCategory[]>([]);
  const [brandList, setBrandList] = useState<Brand[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const perPage = 12;

  // Spec filters state
  const [specFilters, setSpecFilters] = useState<Record<string, string>>({});
  const [specFilterOptions, setSpecFilterOptions] = useState<Record<string, Record<string, number>>>({});
  const [loadingSpecFilters, setLoadingSpecFilters] = useState(false);

  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.addItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const removeWishlist = useWishlistStore((s) => s.removeItem);

  const updateURL = useCallback((params: Record<string, string | string[] | number | undefined>) => {
    const sp = new URLSearchParams();

    if (params.category && Array.isArray(params.category) && params.category.length > 0) {
      sp.set('category', params.category.join(','));
    }
    if (params.brand && Array.isArray(params.brand) && params.brand.length > 0) {
      sp.set('brand', params.brand.join(','));
    }
    if (params.condition && Array.isArray(params.condition) && params.condition.length > 0) {
      sp.set('condition', params.condition.join(','));
    }
    if (params.minPrice && Number(params.minPrice) > 0) sp.set('minPrice', String(params.minPrice));
    if (params.maxPrice && Number(params.maxPrice) < 50000) sp.set('maxPrice', String(params.maxPrice));
    if (params.sort && params.sort !== 'popular') sp.set('sort', String(params.sort));
    if (params.page && Number(params.page) > 1) sp.set('page', String(params.page));
    if (params.search) sp.set('search', String(params.search));

    const qs = sp.toString();
    const url = `/catalog${qs ? '?' + qs : ''}`;
    // Use replaceState to avoid page remount — keeps React state intact
    window.history.replaceState(null, '', url);
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    const newCats = cat ? [cat] : [];
    if (JSON.stringify(selectedCategories) !== JSON.stringify(newCats)) {
      setSelectedCategories(newCats);
    }
    const brand = searchParams.get('brand');
    const newBrands = brand ? [brand] : [];
    if (JSON.stringify(selectedBrands) !== JSON.stringify(newBrands)) {
      setSelectedBrands(newBrands);
    }
    const cond = searchParams.get('condition');
    const newConds = cond ? [cond] : [];
    if (JSON.stringify(selectedConditions) !== JSON.stringify(newConds)) {
      setSelectedConditions(newConds);
    }
    const newPriceMin = Number(searchParams.get('minPrice')) || 0;
    if (priceMin !== newPriceMin) setPriceMin(newPriceMin);
    const newPriceMax = Number(searchParams.get('maxPrice')) || 50000;
    if (priceMax !== newPriceMax) setPriceMax(newPriceMax);
    const newSort = (searchParams.get('sort') as SortOption) || 'popular';
    if (sort !== newSort) setSort(newSort);
    const newPage = Number(searchParams.get('page')) || 1;
    if (page !== newPage) setPage(newPage);
    // NOOP — we intentionally don't sync search FROM URL into state.
    // Other filters (category, brand, etc.) sync from URL; search does NOT.
  }, [searchParams]);

  // Load categories and brands
  useEffect(() => {
    async function loadFilters() {
      const [cats, brds] = await Promise.all([getCategories(), getBrands()]);
      setCategoryList(cats);
      setBrandList(brds);
    }
    loadFilters();
  }, []);

  // Load spec filter options when base filters change
  useEffect(() => {
    async function loadSpecFilters() {
      setLoadingSpecFilters(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategories.length > 0) params.set('categoryId', selectedCategories.join(','));
        if (selectedBrands.length > 0) params.set('brandId', selectedBrands.join(','));
        if (selectedConditions.length > 0) params.set('condition', selectedConditions.join(','));
        if (priceMin > 0) params.set('minPrice', String(priceMin));
        if (priceMax < 50000) params.set('maxPrice', String(priceMax));
        if (searchQuery) params.set('search', searchQuery);

        const res = await fetch(`/api/products/specs-filters?${params.toString()}`);
        const json = await res.json();
        if (json.success) setSpecFilterOptions(json.data);
      } catch {} finally { setLoadingSpecFilters(false); }
    }
    loadSpecFilters();
  }, [selectedCategories, selectedBrands, selectedConditions, priceMin, priceMax, searchQuery]);

  // Fetch products when filters change
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const result = await getProducts({
          category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
          brand: selectedBrands.length > 0 ? selectedBrands.join(',') : undefined,
          condition: selectedConditions.length > 0 ? selectedConditions.join(',') : undefined,
          minPrice: priceMin > 0 ? priceMin : undefined,
          maxPrice: priceMax < 50000 ? priceMax : undefined,
          sort,
          page,
          limit: perPage,
          search: searchQuery || undefined,
          ...specFilters,
        });
        setFilteredProducts(result.products);
        setTotalProducts(result.total);
        setTotalPages(result.totalPages);
      } catch {} finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [selectedCategories, selectedBrands, selectedConditions, priceMin, priceMax, sort, page, searchQuery, specFilters]);

  useEffect(() => {
    updateURL({
      category: selectedCategories,
      brand: selectedBrands,
      condition: selectedConditions,
      minPrice: priceMin,
      maxPrice: priceMax,
      sort,
      page,
      search: searchQuery,
    });
  }, [selectedCategories, selectedBrands, selectedConditions, priceMin, priceMax, sort, page, updateURL]);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      const sp = new URLSearchParams(window.location.search);
      if (q) sp.set('search', q); else sp.delete('search');
      const qs = sp.toString();
      window.history.replaceState(null, '', `/catalog${qs ? '?' + qs : ''}`);
    }, 500);
  };


  const toggleArray = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
    setArr(next);
    setPage(1);
  };

  const toggleSpecFilter = (key: string, value: string) => {
    setSpecFilters(prev => {
      const next = { ...prev };
      if (next[key] === value) {
        delete next[key];
      } else {
        next[key] = value;
      }
      setPage(1);
      return next;
    });
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedConditions([]);
    setPriceMin(0);
    setPriceMax(50000);
    setSort('popular');
    setPage(1);
    setSearchQuery('');
    setSpecFilters({});
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 ||
    selectedConditions.length > 0 || priceMin > 0 || priceMax < 50000 || searchQuery.length > 0 ||
    Object.keys(specFilters).length > 0;

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-3">{t('catalog.search')}</h3>
        <input
          type="text"
          placeholder={t('catalog.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-3">{t('catalog.category')}</h3>
        <div className="space-y-2">
          {categoryList.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.id)}
                onChange={() => toggleArray(selectedCategories, setSelectedCategories, cat.id)}
                className="rounded border-slate-300 text-primary focus:ring-primary"
              />
              {(locale === 'ru' && cat.nameRu) ? cat.nameRu : cat.nameRo}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-3">{t('catalog.brand')}</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {brandList.map((b) => (
            <label key={b.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedBrands.includes(b.id)}
                onChange={() => toggleArray(selectedBrands, setSelectedBrands, b.id)}
                className="rounded border-slate-300 text-primary focus:ring-primary"
              />
              {b.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-3">{t('catalog.condition')}</h3>
        <div className="space-y-2">
          {[{ val: 'nou', labelKey: 'catalog.new' }, { val: 'refurbished', labelKey: 'catalog.refurbished' }, { val: 'folosit', labelKey: 'catalog.used' }].map((c) => (
            <label key={c.val} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" checked={selectedConditions.includes(c.val)} onChange={() => toggleArray(selectedConditions, setSelectedConditions, c.val)} className="rounded border-slate-300 text-primary focus:ring-primary" />
              {t(c.labelKey)}
            </label>
          ))}
        </div>
      </div>

      {/* Spec filters */}
      {!loadingSpecFilters && SPEC_FILTER_FIELDS.map(({ key, label }) => {
        const options = specFilterOptions[key];
        if (!options || Object.keys(options).length === 0) return null;
        return (
          <div key={key}>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-2">{label}</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {Object.entries(options).map(([value, count]) => (
                <label key={value} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(specFilters[key] || '') === value}
                    onChange={() => toggleSpecFilter(key, value)}
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  {value} <span className="text-slate-400">({count})</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}

      <div>
        <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-1">{t('catalog.price')}</h3>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>{formatPrice(priceMin)}</span>
          <span>{formatPrice(priceMax)}</span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400">{t('catalog.priceFrom')}</label>
            <input type="range" min={0} max={50000} step={500} value={priceMin} onChange={(e) => { setPriceMin(Number(e.target.value)); setPage(1); }} className="w-full accent-primary" />
          </div>
          <div>
            <label className="text-xs text-slate-400">{t('catalog.priceTo')}</label>
            <input type="range" min={0} max={50000} step={500} value={priceMax} onChange={(e) => { setPriceMax(Number(e.target.value)); setPage(1); }} className="w-full accent-primary" />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <button onClick={clearAllFilters} className="w-full py-2.5 text-sm font-semibold text-accent border border-accent rounded-xl hover:bg-accent hover:text-white transition-colors">
          {t('catalog.clearFilters')}
        </button>
      )}
    </div>
  );

  const ProductCardSmall = ({ product, index }: { product: Product; index: number }) => {
    const discount = product.oldPrice ? getDiscount(product.oldPrice, product.price) : null;
    const badgeText = product.condition === 'nou' ? t('product.nou') : discount ? `-${discount}%` : t('product.refurbished');
    const badgeClass = product.condition === 'nou' ? 'bg-emerald-600' : discount ? 'bg-accent' : 'bg-indigo-500';
    const isPhone = product.category === 'telefoane';

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:-translate-y-1 hover:shadow-md transition-all relative"
      >
        <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-lg text-[11px] font-bold text-white ${badgeClass}`}>
          {discount ? `${t('catalog.discount')} -${discount}%` : badgeText}
        </span>
        <Link href={`/product/${product.id}`}>
          <div className="flex items-center justify-center h-36 mb-3">
            {(() => {
              const rawImg = product.images;
              let imgUrl: string | null = null;
              if (Array.isArray(rawImg)) {
                imgUrl = rawImg[0] || null;
              } else if (typeof rawImg === 'string') {
                let s: string = (rawImg as string).trim();
                if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
                s = s.replace(/\"/g, '"');
                if (s.startsWith('[')) {
                  try { const a = JSON.parse(s); imgUrl = a[0] || null; } catch { imgUrl = null; }
                } else if (s.startsWith('http')) {
                  imgUrl = s;
                } else if (s.includes(',')) {
                  const parts = s.split(',');
                  imgUrl = parts.find(p => p.trim().startsWith('http') || p.trim().startsWith('/')) || parts[0].trim() || null;
                } else if (s.startsWith('/')) {
                  imgUrl = s;
                } else {
                  imgUrl = s || null;
                }
              }
              return imgUrl ? (
                <img src={imgUrl} alt={product.name} loading="lazy" className="max-h-32 w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <svg viewBox={isPhone ? '0 0 120 160' : '0 0 200 130'} fill="none" className="max-h-28 w-auto">
                  {isPhone ? (
                    <>
                      <rect x="25" y="8" width="70" height="130" rx="12" fill="#e2e8f0" />
                      <rect x="30" y="20" width="60" height="98" rx="3" fill="#1a56db" opacity=".08" />
                      <circle cx="60" cy="128" r="4" fill="#cbd5e1" />
                    </>
                  ) : (
                    <>
                      <rect x="15" y="10" width="170" height="95" rx="6" fill="#e2e8f0" />
                      <rect x="25" y="18" width="150" height="78" rx="2" fill="#1a56db" opacity=".08" />
                      <rect x="60" y="105" width="80" height="5" rx="2" fill="#cbd5e1" />
                    </>
                  )}
                </svg>
              );
            })()}
          </div>
        </Link>
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white leading-snug mb-1 line-clamp-2">{product.name}</h3>
        </Link>
        <p className="text-xs text-slate-500 mb-2 line-clamp-1">{product.specs.procesor}, {product.specs.display}</p>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-extrabold text-primary-dark dark:text-primary">{formatPrice(product.price)}</span>
          {product.oldPrice && <span className="text-xs text-slate-400 line-through">{formatPrice(product.oldPrice)}</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => addToCart(product)} className="flex-1 bg-primary text-white py-2 rounded-xl text-xs font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5" /> {t('catalog.addToCart')}
          </button>
          <button onClick={() => isInWishlist(product.id) ? removeWishlist(product.id) : toggleWishlist(product)} className={`p-2 rounded-xl border transition-colors ${isInWishlist(product.id) ? 'border-accent text-accent' : 'border-slate-200 text-slate-400 hover:text-accent hover:border-accent'}`}>
            <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-accent' : ''}`} />
          </button>
        </div>
      </motion.div>
    );
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-[1280px] mx-auto px-5 py-3 flex items-center gap-2 text-sm text-slate-500 flex-wrap">
            <Link href="/" className="hover:text-primary">{t('nav.home')}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 dark:text-white font-medium">{t('nav.catalog')}</span>
            {searchQuery && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-primary font-medium">{t('catalog.search')}: {searchQuery}</span>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-5 py-6">
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('catalog.title')}</h1>
              <span className="text-sm text-slate-500">({totalProducts} {t('catalog.found')})</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button onClick={() => setShowSortDropdown(!showSortDropdown)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:border-primary transition-colors">
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="hidden sm:inline">{SORT_OPTIONS.find(o => o.val === sort) ? t(SORT_OPTIONS.find(o => o.val === sort)!.labelKey) : t('catalog.popular')}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                <AnimatePresence>
                  {showSortDropdown && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 py-1 min-w-[200px]">
                      {SORT_OPTIONS.map((opt) => (
                        <button key={opt.val} onClick={() => { setSort(opt.val); setPage(1); setShowSortDropdown(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${sort === opt.val ? 'text-primary font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>
                          {t(opt.labelKey)}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={() => setMobileFilters(true)} className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
                <SlidersHorizontal className="w-4 h-4" /> {t('catalog.filters')}
                {hasActiveFilters && (
                  <span className="w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {[...selectedCategories, ...selectedBrands, ...selectedConditions, ...Object.keys(specFilters)].length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategories.map((c) => {
                const cat = categoryList.find((cl) => cl.id === c);
                return (
                  <button key={c} onClick={() => toggleArray(selectedCategories, setSelectedCategories, c)} className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full hover:bg-primary/20 transition-colors">
                    {cat?.nameRo || c} <X className="w-3 h-3" />
                  </button>
                );
              })}
              {selectedBrands.map((b) => {
                const brand = brandList.find((bl) => bl.id === b);
                return (
                  <button key={b} onClick={() => toggleArray(selectedBrands, setSelectedBrands, b)} className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full hover:bg-primary/20 transition-colors">
                    {brand?.name || b} <X className="w-3 h-3" />
                  </button>
                );
              })}
              {selectedConditions.map((c) => (
                <button key={c} onClick={() => toggleArray(selectedConditions, setSelectedConditions, c)} className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full hover:bg-primary/20 transition-colors">
                  {c === 'nou' ? t('catalog.new') : t('catalog.refurbished')} <X className="w-3 h-3" />
                </button>
              ))}
              {Object.entries(specFilters).map(([key, value]) => (
                <button key={key} onClick={() => toggleSpecFilter(key, value)} className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full hover:bg-primary/20 transition-colors">
                  {value} <X className="w-3 h-3" />
                </button>
              ))}
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full hover:bg-primary/20 transition-colors">
                  {t('catalog.search')}: {searchQuery} <X className="w-3 h-3" />
                </button>
              )}
              <button onClick={clearAllFilters} className="px-3 py-1 text-xs font-semibold text-accent hover:underline">
                Șterge tot
              </button>
            </div>
          )}

          <div className="flex gap-6">
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 sticky top-24">
                {FilterSidebar()}
              </div>
            </aside>

            <AnimatePresence>
              {mobileFilters && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black/40" onClick={() => setMobileFilters(false)}>
                  <motion.div initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ type: 'spring', damping: 25 }} className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-800 p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-5">
                      <h2 className="font-bold text-lg">{t('catalog.filters')}</h2>
                      <button onClick={() => setMobileFilters(false)}><X className="w-5 h-5" /></button>
                    </div>
                    {FilterSidebar()}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 animate-pulse">
                      <div className="h-36 bg-slate-200 dark:bg-slate-700 rounded-xl mb-3" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-3/4" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-3 w-1/2" />
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredProducts.map((p, i) => (
                    <ProductCardSmall key={`${p.id}-${i}`} product={p} index={i} />
                  ))}
                </div>
              )}

              {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-slate-400 text-lg mb-2">Niciun produs nu corespunde filtrelor selectate</p>
                  {hasActiveFilters && (
                    <button onClick={clearAllFilters} className="text-primary font-semibold hover:underline">
                      Șterge filtrele
                    </button>
                  )}
                </div>
              )}

              {totalPages > 1 && !loading && (
                <div className="flex justify-center items-center gap-1.5 mt-8">
                  <button onClick={() => { setPage(Math.max(1, page - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={page === 1} className="w-10 h-10 rounded-xl font-semibold text-sm transition-colors disabled:opacity-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary">
                    ‹
                  </button>
                  {getPageNumbers().map((p, i) =>
                    typeof p === 'string' ? (
                      <span key={`dots-${i}`} className="px-2 text-slate-400">…</span>
                    ) : (
                      <button key={p} onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`w-10 h-10 rounded-xl font-semibold text-sm transition-colors ${page === p ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary'}`}>
                        {p}
                      </button>
                    )
                  )}
                  <button onClick={() => { setPage(Math.min(totalPages, page + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={page === totalPages} className="w-10 h-10 rounded-xl font-semibold text-sm transition-colors disabled:opacity-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary">
                    ›
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CatalogContent />
    </Suspense>
  );
}