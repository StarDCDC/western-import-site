// src/app/catalog/CatalogClient.tsx — client UI. Initial data is provided by the
// server (page.tsx) so the first paint already shows products (no fetch waterfall).
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

export interface CatalogInitial {
  products: Product[];
  total: number;
  totalPages: number;
  categories: ApiCategory[];
  brands: Brand[];
}

function CatalogContent({ initial }: { initial: CatalogInitial }) {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filters are comma-separated in the URL (e.g. ?category=id1,id2) — split into
  // arrays so multiple selections survive a URL round-trip (was collapsing to one).
  // Resolve slug-based values (from header links) to category IDs so sidebar checkboxes match.
  const resolveCategoryTokens = (tokens: string[]): string[] =>
    tokens.map(t => {
      const bySlug = initial.categories.find(c => c.slug === t);
      return bySlug?.id || t;
    });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category') ? resolveCategoryTokens(searchParams.get('category')!.split(',')) : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brand') ? searchParams.get('brand')!.split(',') : []
  );
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    searchParams.get('condition') ? searchParams.get('condition')!.split(',') : []
  );
  const [priceMin, setPriceMin] = useState(Number(searchParams.get('minPrice')) || 0);
  const [priceMax, setPriceMax] = useState(Number(searchParams.get('maxPrice')) || 50000);
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'popular');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [perPage, setPerPage] = useState(20);
  // searchQuery is LOCAL ONLY to this component. We write it to URL only via debounce.
  // We NEVER read search from URL into searchQuery — that was causing the input reset loop.
  const [searchQuery, setSearchQuery] = useState('');
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchChangeSource = useRef<'input' | 'url' | null>(null);
  const urlUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const priceDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [debouncedPriceMin, setDebouncedPriceMin] = useState(priceMin);
  const [debouncedPriceMax, setDebouncedPriceMax] = useState(priceMax);
  const [mobileFilters, setMobileFilters] = useState(false);
  // Collapsible filter sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    search: true,
    category: true,
    brand: true,
    condition: true,
    price: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [categoryList, setCategoryList] = useState<ApiCategory[]>(initial.categories);
  const [brandList, setBrandList] = useState<Brand[]>(initial.brands);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initial.products);
  const [allLoadedProducts, setAllLoadedProducts] = useState<Product[]>(initial.products);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(initial.total);
  const [totalPages, setTotalPages] = useState(initial.totalPages);
  const [loading, setLoading] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  // Skip the first client product fetch only if the server actually provided a list;
  // if SSR returned empty (e.g. DB hiccup), let the client fetch as a fallback.
  const firstProductsLoad = useRef(initial.products.length > 0);
  const perPageRef = perPage;

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
    const newCats = cat ? resolveCategoryTokens(cat.split(',')) : [];
    if (JSON.stringify(selectedCategories) !== JSON.stringify(newCats)) {
      setSelectedCategories(newCats);
    }
    const brand = searchParams.get('brand');
    const newBrands = brand ? brand.split(',') : [];
    if (JSON.stringify(selectedBrands) !== JSON.stringify(newBrands)) {
      setSelectedBrands(newBrands);
    }
    const cond = searchParams.get('condition');
    const newConds = cond ? cond.split(',') : [];
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

  // Load categories and brands — skip if the server already provided them.
  useEffect(() => {
    if (initial.categories.length > 0 || initial.brands.length > 0) return;
    async function loadFilters() {
      const [cats, brds] = await Promise.all([getCategories(), getBrands()]);
      setCategoryList(cats);
      setBrandList(brds);
    }
    loadFilters();
  }, [initial.categories.length, initial.brands.length]);

  // Load spec filter options when base filters change
  useEffect(() => {
    const t = setTimeout(async () => {
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
    }, 300);
    return () => clearTimeout(t);
  }, [selectedCategories, selectedBrands, selectedConditions, priceMin, priceMax, searchQuery]);

  // Debounce price changes so we only fetch after user stops dragging
  useEffect(() => {
    if (priceDebounce.current) clearTimeout(priceDebounce.current);
    priceDebounce.current = setTimeout(() => {
      setDebouncedPriceMin(priceMin);
      setDebouncedPriceMax(priceMax);
    }, 400);
    return () => { if (priceDebounce.current) clearTimeout(priceDebounce.current); };
  }, [priceMin, priceMax]);

  // Fetch products when filters change (the first run is skipped — SSR provided it).
  useEffect(() => {
    if (firstProductsLoad.current) {
      firstProductsLoad.current = false;
      return;
    }
    async function loadProducts() {
      setLoading(true);
      try {
        const result = await getProducts({
          category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
          brand: selectedBrands.length > 0 ? selectedBrands.join(',') : undefined,
          condition: selectedConditions.length > 0 ? selectedConditions.join(',') : undefined,
          minPrice: debouncedPriceMin > 0 ? debouncedPriceMin : undefined,
          maxPrice: debouncedPriceMax < 50000 ? debouncedPriceMax : undefined,
          sort,
          page,
          limit: perPage,
          search: searchQuery || undefined,
          ...specFilters,
        });
        setFilteredProducts(result.products);
        setAllLoadedProducts(result.products);
        setTotalProducts(result.total);
        setTotalPages(result.totalPages);
      } catch {} finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [selectedCategories, selectedBrands, selectedConditions, debouncedPriceMin, debouncedPriceMax, sort, page, searchQuery, specFilters, perPage]);

  // Reset page when perPage changes
  useEffect(() => {
    setPage(1);
  }, [perPage]);

  useEffect(() => {
    updateURL({
      category: selectedCategories,
      brand: selectedBrands,
      condition: selectedConditions,
      minPrice: debouncedPriceMin,
      maxPrice: debouncedPriceMax,
      sort,
      page,
      search: searchQuery,
    });
  }, [selectedCategories, selectedBrands, selectedConditions, debouncedPriceMin, debouncedPriceMax, sort, page, updateURL]);

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

  const FilterSection = ({ sectionKey, title, children }: { sectionKey: string; title: string; children: React.ReactNode }) => (
    <div className="border-b border-slate-100 dark:border-white/[0.06] pb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between py-2 text-sm font-bold text-slate-800 dark:text-white"
      >
        <span>{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${openSections[sectionKey] ? 'rotate-180' : ''}`} />
      </button>
      {openSections[sectionKey] && (
        <div className="mt-1">{children}</div>
      )}
    </div>
  );

  const FilterSidebar = () => (
    <div className="space-y-1">
      <FilterSection sectionKey="search" title={t('catalog.search')}>
        <input
          type="text"
          placeholder={t('catalog.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[var(--color-dark-elevated)] text-sm focus:outline-none focus:border-primary"
        />
      </FilterSection>

      <FilterSection sectionKey="category" title={t('catalog.category')}>
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
      </FilterSection>

      <FilterSection sectionKey="brand" title={t('catalog.brand')}>
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
      </FilterSection>

      <FilterSection sectionKey="condition" title={t('catalog.condition')}>
        <div className="space-y-2">
          {[{ val: 'nou', labelKey: 'catalog.new' }, { val: 'refurbished', labelKey: 'catalog.refurbished' }, { val: 'folosit', labelKey: 'catalog.used' }].map((c) => (
            <label key={c.val} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" checked={selectedConditions.includes(c.val)} onChange={() => toggleArray(selectedConditions, setSelectedConditions, c.val)} className="rounded border-slate-300 text-primary focus:ring-primary" />
              {t(c.labelKey)}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Spec filters */}
      {!loadingSpecFilters && SPEC_FILTER_FIELDS.map(({ key, label }) => {
        const options = specFilterOptions[key];
        if (!options || Object.keys(options).length === 0) return null;
        return (
          <FilterSection key={key} sectionKey={`spec_${key}`} title={label}>
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
          </FilterSection>
        );
      })}

      <FilterSection sectionKey="price" title={t('catalog.price')}>
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
      </FilterSection>

      {hasActiveFilters && (
        <button onClick={clearAllFilters} className="w-full py-2.5 text-sm font-semibold text-accent border border-accent rounded-xl hover:bg-accent hover:text-white transition-colors mt-4">
          {t('catalog.clearFilters')}
        </button>
      )}
    </div>
  );

  const ProductCardSmall = ({ product, listMode = false }: { product: Product; listMode?: boolean }) => {
    const discount = product.oldPrice ? getDiscount(product.oldPrice, product.price) : null;
    const badgeText = product.condition === 'nou' ? t('product.nou') : discount ? `-${discount}%` : t('product.refurbished');
    const badgeClass = product.condition === 'nou' ? 'bg-emerald-600' : discount ? 'bg-accent' : 'bg-indigo-500';
    const isPhone = product.category === 'telefoane';

    // Parse product images
    const getImages = (): string[] => {
      const rawImg = product.images;
      const parseOne = (s: string): string[] => {
        s = s.trim();
        if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
        s = s.replace(/\"/g, '"');
        if (s.startsWith('[')) { try { return JSON.parse(s); } catch { return []; } }
        if (s.includes(',')) return s.split(',').map(x => x.trim()).filter(Boolean);
        return s ? [s] : [];
      };
      if (Array.isArray(rawImg)) return rawImg as string[];
      if (typeof rawImg === 'string') return parseOne(rawImg);
      return [];
    };
    const images = getImages();
    const imgUrl = images[0] || null;
    const img2Url = images[1] || null;

    // LIST MODE — horizontal card: image left, text+price right
    if (listMode) {
      return (
        <div className="bg-white dark:bg-[var(--color-dark-elevated)] border border-slate-200 dark:border-white/[0.06] rounded-2xl hover:shadow-md transition-all relative flex flex-row gap-0 overflow-hidden">
          {/* Badge */}
          <span className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[11px] font-bold text-white z-10 ${badgeClass}`}>
            {discount ? `${t('catalog.discount')} -${discount}%` : badgeText}
          </span>

          {/* Image — left side, fixed width */}
          <Link href={`/product/${product.id}`} prefetch={false} className="flex-shrink-0 w-[200px] sm:w-[240px]">
            <div className="relative w-full h-full min-h-[160px] overflow-hidden bg-slate-50 dark:bg-slate-700/50 group/img">
              {imgUrl ? (
                <>
                  <img
                    src={imgUrl}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover/img:opacity-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  {img2Url && (
                    <img
                      src={img2Url}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover/img:opacity-100"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-600">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M20 5H4V19L13.292 9.706a1 1 0 011.414 0L20 15.01V5zM2 3.993A1 1 0 012.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 01-.992.993H2.992A.993.993 0 012 20.007V3.993zM8 11a2 2 0 110-4 2 2 0 010 4z"/></svg>
                </div>
              )}
            </div>
          </Link>

          {/* Content — right side */}
          <div className="flex flex-col flex-1 min-w-0 p-4 sm:p-5">
            <Link href={`/product/${product.id}`} prefetch={false}>
              <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white leading-snug mb-1 line-clamp-2">{product.name}</h3>
            </Link>
            <p className="text-xs text-slate-500 mb-2 line-clamp-1">{product.specs?.procesor}{product.specs?.display ? `, ${product.specs.display}` : ''}</p>

            {/* Spacer */}
            <div className="flex-1 min-h-1" />

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-lg sm:text-xl font-extrabold text-primary-dark dark:text-primary">{formatPrice(product.price)}</span>
              {product.oldPrice && <span className="text-xs text-slate-400 line-through">{formatPrice(product.oldPrice)}</span>}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={() => addToCart(product)} className="flex-1 bg-primary text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5">
                <ShoppingCart className="w-4 h-4" /> {t('catalog.addToCart')}
              </button>
              <button onClick={() => isInWishlist(product.id) ? removeWishlist(product.id) : toggleWishlist(product)} className={`p-2.5 rounded-xl border transition-colors ${isInWishlist(product.id) ? 'border-accent text-accent' : 'border-slate-200 text-slate-400 hover:text-accent hover:border-accent'}`}>
                <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-accent' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // GRID MODE — original card layout
    return (
      <div
        className="bg-white dark:bg-[var(--color-dark-elevated)] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-2 sm:p-4 hover:-translate-y-1 hover:shadow-md transition-all relative flex flex-row sm:flex-col gap-2 sm:gap-0"
      >
        {/* Badge */}
        <span className={`absolute top-1.5 left-1.5 sm:top-3 sm:left-3 px-1.5 py-0.5 sm:px-2 rounded text-[9px] sm:text-[11px] font-bold text-white z-10 ${badgeClass}`}>
          {discount ? `${t('catalog.discount')} -${discount}%` : badgeText}
        </span>

        {/* Image — fixed size square on mobile, full width on desktop */}
        <Link href={`/product/${product.id}`} prefetch={false} className="flex-shrink-0 w-[100px] sm:w-full">
          <div className="relative w-[100px] h-[100px] sm:w-full sm:aspect-[4/3] sm:h-auto overflow-hidden rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-700/50 mb-0 sm:mb-3 group/img">
            {imgUrl ? (
              <>
                <img
                  src={imgUrl}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover/img:opacity-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                {img2Url && (
                  <img
                    src={img2Url}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover/img:opacity-100"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-600">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M20 5H4V19L13.292 9.706a1 1 0 011.414 0L20 15.01V5zM2 3.993A1 1 0 012.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 01-.992.993H2.992A.993.993 0 012 20.007V3.993zM8 11a2 2 0 110-4 2 2 0 010 4z"/></svg>
              </div>
            )}
          </div>
        </Link>

        {/* Content — right side on mobile, below on desktop */}
        <div className="flex flex-col flex-1 min-w-0 sm:mt-0">
          <Link href={`/product/${product.id}`} prefetch={false}>
            <h3 className="text-[11px] sm:text-sm font-semibold text-slate-800 dark:text-white leading-snug mb-0.5 sm:mb-1 line-clamp-2">{product.name}</h3>
          </Link>
          <p className="hidden sm:block text-xs text-slate-500 mb-1 sm:mb-2 line-clamp-1">{product.specs?.procesor}{product.specs?.display ? `, ${product.specs.display}` : ''}</p>

          {/* Spacer */}
          <div className="flex-1 min-h-1" />

          {/* Price */}
          <div className="flex items-baseline gap-1 sm:gap-2 mb-1.5 sm:mb-3">
            <span className="text-xs sm:text-lg font-extrabold text-primary-dark dark:text-primary">{formatPrice(product.price)}</span>
            {product.oldPrice && <span className="text-[10px] sm:text-xs text-slate-400 line-through">{formatPrice(product.oldPrice)}</span>}
          </div>

          {/* Actions */}
          <div className="flex gap-1.5 sm:gap-2">
            <button onClick={() => addToCart(product)} className="flex-1 bg-primary text-white py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-1">
              <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {t('catalog.addToCart')}
            </button>
            <button onClick={() => isInWishlist(product.id) ? removeWishlist(product.id) : toggleWishlist(product)} className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-colors ${isInWishlist(product.id) ? 'border-accent text-accent' : 'border-slate-200 text-slate-400 hover:text-accent hover:border-accent'}`}>
              <Heart className={`w-3.5 h-3.5 ${isInWishlist(product.id) ? 'fill-accent' : ''}`} />
            </button>
          </div>
        </div>
      </div>
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
      <main className="flex-1 bg-slate-50 dark:bg-[var(--color-dark-bg)] min-h-screen">
        <div className="bg-white dark:bg-[var(--color-dark-surface)] border-b border-slate-200 dark:border-white/[0.06]">
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

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Per Page selector */}
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                className="px-3 py-2 bg-white dark:bg-[var(--color-dark-elevated)] border border-slate-200 dark:border-white/[0.06] rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
              >
                {[20, 24, 28].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>

              {/* View mode toggle */}
              <div className="hidden sm:flex items-center bg-white dark:bg-[var(--color-dark-elevated)] border border-slate-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-slate-400 hover:text-primary'}`}
                  title="Grilă"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zm8 0A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zm-8 8A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zm8 0A1.5 1.5 0 0110.5 9h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 13.5v-3z"/></svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-slate-400 hover:text-primary'}`}
                  title="Listă"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M2.5 12a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5z"/></svg>
                </button>
              </div>

              <div className="relative">
                <button onClick={() => setShowSortDropdown(!showSortDropdown)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[var(--color-dark-elevated)] border border-slate-200 dark:border-white/[0.06] rounded-xl text-sm font-medium hover:border-primary transition-colors">
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="hidden sm:inline">{SORT_OPTIONS.find(o => o.val === sort) ? t(SORT_OPTIONS.find(o => o.val === sort)!.labelKey) : t('catalog.popular')}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                <AnimatePresence>
                  {showSortDropdown && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute right-0 top-full mt-1 bg-white dark:bg-[var(--color-dark-elevated)] border border-slate-200 dark:border-white/[0.06] rounded-xl shadow-lg z-20 py-1 min-w-[200px]">
                      {SORT_OPTIONS.map((opt) => (
                        <button key={opt.val} onClick={() => { setSort(opt.val); setPage(1); setShowSortDropdown(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${sort === opt.val ? 'text-primary font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>
                          {t(opt.labelKey)}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={() => setMobileFilters(true)} className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[var(--color-dark-elevated)] border border-slate-200 dark:border-white/[0.06] rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 shrink-0">
                <SlidersHorizontal className="w-4 h-4 shrink-0" /> <span className="hidden xs:inline shrink-0">{locale === 'ru' ? 'Фильтры' : 'Filtre'}</span>
                {hasActiveFilters && (
                  <span className="min-w-[18px] h-[18px] bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1 shrink-0">
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
              <div className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-2xl p-5 border border-slate-200 dark:border-white/[0.06] sticky top-24">
                {FilterSidebar()}
              </div>
            </aside>

            <AnimatePresence>
              {mobileFilters && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black/40" onClick={() => setMobileFilters(false)}>
                  <motion.div initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ type: 'spring', damping: 25 }} className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-[var(--color-dark-elevated)] p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-5">
                      <h2 className="font-bold text-lg">{t('catalog.filters')}</h2>
                      <button onClick={() => setMobileFilters(false)}><X className="w-5 h-5" /></button>
                    </div>
                    {/* View mode toggle in mobile filters */}
                    <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-200 dark:border-white/[0.06]">
                      <span className="text-xs text-slate-500">{locale === 'ru' ? 'Вид:' : 'Vizualizare:'}</span>
                      <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                        <button onClick={() => setViewMode('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-slate-400 hover:text-primary'}`}>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zm8 0A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zm-8 8A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zm8 0A1.5 1.5 0 0110.5 9h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 13.5v-3z"/></svg>
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-slate-400 hover:text-primary'}`}>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M2.5 12a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5z"/></svg>
                        </button>
                      </div>
                    </div>
                    {FilterSidebar()}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1">
              {loading ? (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-4 list-mode"}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={`bg-white dark:bg-[var(--color-dark-elevated)] border border-slate-200 dark:border-white/[0.06] rounded-2xl animate-pulse ${viewMode === 'list' ? 'h-[160px]' : 'p-4'}`}>
                      {viewMode === 'list' ? (
                        <div className="flex h-full">
                          <div className="w-[200px] bg-slate-200 dark:bg-slate-700" />
                          <div className="flex-1 p-4 space-y-2">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="h-36 bg-slate-200 dark:bg-slate-700 rounded-xl mb-3" />
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-3/4" />
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-3 w-1/2" />
                          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-4 list-mode"}>
                  {filteredProducts.map((p, i) => (
                    <ProductCardSmall key={`${p.id}-${i}`} product={p} listMode={viewMode === 'list'} />
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
                  <button onClick={() => { setPage(Math.max(1, page - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={page === 1} className="w-10 h-10 rounded-xl font-semibold text-sm transition-colors disabled:opacity-40 bg-white dark:bg-[var(--color-dark-elevated)] border border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-300 hover:border-primary">
                    ‹
                  </button>
                  {getPageNumbers().map((p, i) =>
                    typeof p === 'string' ? (
                      <span key={`dots-${i}`} className="px-2 text-slate-400">…</span>
                    ) : (
                      <button key={p} onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`w-10 h-10 rounded-xl font-semibold text-sm transition-colors ${page === p ? 'bg-primary text-white' : 'bg-white dark:bg-[var(--color-dark-elevated)] border border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-300 hover:border-primary'}`}>
                        {p}
                      </button>
                    )
                  )}
                  <button onClick={() => { setPage(Math.min(totalPages, page + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={page === totalPages} className="w-10 h-10 rounded-xl font-semibold text-sm transition-colors disabled:opacity-40 bg-white dark:bg-[var(--color-dark-elevated)] border border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-300 hover:border-primary">
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

export default function CatalogClient({ initial }: { initial: CatalogInitial }) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CatalogContent initial={initial} />
    </Suspense>
  );
}