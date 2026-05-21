// src/components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Heart, ShoppingCart, Phone, ChevronDown, Menu, X, Tag, Percent, Sparkles } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import SearchBar from '@/components/ui/SearchBar';
import { useLanguage } from '@/components/ui/LanguageProvider';
import CartDrawer from '@/components/cart/CartDrawer';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { getCategories, getSubcategories, getBrands, type ApiCategory } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import type { Brand } from '@/lib/data';

const categoryIcons: Record<string, string> = {
  laptopuri: '💻',
  telefoane: '📱',
  'pc-monitoare': '🖥️',
  tablete: '📋',
  componente: '🔧',
  accesorii: '🔌',
};

interface HeaderCategory extends ApiCategory {
  icon: string;
}

interface MegaMenuData {
  category: HeaderCategory;
  subcats: string[];
  brands: Brand[];
}

export default function Header() {
  const { locale, setLocale, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuCat, setMegaMenuCat] = useState<string | null>(null);
  const [megaMenuData, setMegaMenuData] = useState<MegaMenuData[]>([]);
  const [categories, setCategories] = useState<HeaderCategory[]>([]);
  const [subcats, setSubcats] = useState<Record<string, string[]>>({});
  const [brandList, setBrandList] = useState<Brand[]>([]);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.getCount());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    async function loadData() {
      const [cats, subs, brds] = await Promise.all([
        getCategories(),
        getSubcategories(),
        getBrands(),
      ]);
      const headerCats = cats.map((c) => ({ ...c, icon: categoryIcons[c.slug] || '📦' }));
      setCategories(headerCats);
      setSubcats(subs);
      setBrandList(brds);

      // Pre-build mega menu data
      const megaData = headerCats.map((cat) => ({
        category: cat,
        subcats: subs[cat.slug] || [],
        brands: brds.slice(0, 6),
      }));
      setMegaMenuData(megaData);
    }
    loadData();
  }, []);

  const displayName = (cat: HeaderCategory) => {
    return locale === 'ru' && cat.nameRu ? cat.nameRu : cat.nameRo;
  };

  const getCurrentMegaData = (): MegaMenuData | null => {
    return megaMenuData.find((m) => m.category.id === megaMenuCat) || null;
  };

  return (
    <>
      {/* Topbar */}
      <div className="bg-topbar text-white text-xs py-2">
        <div className="max-w-[1280px] mx-auto px-5 flex justify-between items-center">
          <div className="flex gap-5 items-center">
            <span className="flex items-center gap-1.5 text-sky-300">
              <span>🚚</span> Transport gratuit
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-sky-300">
              <span>🛡️</span> Service certificat
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-sky-300">
              <span>↩️</span> Returnare 14 zile
            </span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setLocale('ro')}
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition ${
                locale === 'ro' ? 'bg-white/25 text-white' : 'text-sky-300 hover:bg-white/15'
              }`}
            >RO</button>
            <button
              onClick={() => setLocale('ru')}
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition ${
                locale === 'ru' ? 'bg-white/25 text-white' : 'text-sky-300 hover:bg-white/15'
              }`}
            >RU</button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-[100] bg-white/92 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 transition-shadow ${scrolled ? 'shadow-md' : ''}`}>
        <div className="max-w-[1280px] mx-auto px-5 flex items-center gap-5 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.jpg" alt="Western Import" className="h-[42px] w-auto" />
            <div className="hidden sm:block">
              <div className="text-lg font-extrabold text-primary-dark dark:text-white leading-tight">Western Import</div>
              <div className="text-[11px] text-accent font-medium -mt-0.5">Premium Electronics</div>
            </div>
          </Link>

          {/* Search */}
          <SearchBar />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link href="/login" className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
              <User className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-primary" />
              <span className="text-[10px] text-slate-500 group-hover:text-primary hidden lg:block">Cont</span>
            </Link>
            <Link href="/wishlist" className="relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
              <Heart className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-primary" />
              <span className="text-[10px] text-slate-500 group-hover:text-primary hidden lg:block">Favorite</span>
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-1 bg-accent text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <ShoppingCart className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-primary" />
              <span className="text-[10px] text-slate-500 group-hover:text-primary hidden lg:block">Coș</span>
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-1 bg-accent text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <a href="tel:+37369466585" className="hidden md:flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
              <Phone className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-primary" />
              <span className="text-[10px] text-slate-500 group-hover:text-primary">Contact</span>
            </a>
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ─── Desktop Navigation with Mega Menu ─── */}
        <nav className="hidden lg:block border-t border-slate-200 dark:border-slate-700 overflow-x-auto">
          <div className="max-w-[1280px] mx-auto px-5 flex items-center whitespace-nowrap">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => setMegaMenuCat(cat.id)}
                onMouseLeave={() => setMegaMenuCat(null)}
              >
                <Link
                  href={`/catalog?category=${cat.slug}`}
                  className="flex items-center gap-1.5 px-3.5 py-3 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors"
                >
                  <span>{cat.icon}</span>
                  {displayName(cat)}
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${megaMenuCat === cat.id ? 'rotate-180' : ''}`} />
                </Link>

                {/* ─── Mega Menu Dropdown ─── */}
                <AnimatePresence>
                  {megaMenuCat === cat.id && (() => {
                    const data = getCurrentMegaData();
                    if (!data) return null;
                    const { category: mCat, subcats: mSubcats, brands: mBrands } = data;
                    const hasContent = mSubcats.length > 0 || mBrands.length > 0;

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-b-2xl shadow-2xl z-50 overflow-hidden"
                        style={{ minWidth: hasContent ? '560px' : '280px' }}
                      >
                        <div className="flex">
                          {/* Subcategories Column */}
                          {mSubcats.length > 0 && (
                            <div className="p-5 flex-1 min-w-[200px]">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <span>{mCat.icon}</span>
                                {displayName(mCat)}
                              </h4>
                              <div className="grid grid-cols-1 gap-0.5">
                                {mSubcats.map((sub) => (
                                  <Link
                                    key={sub}
                                    href={`/catalog?category=${mCat.slug}&sub=${encodeURIComponent(sub.toLowerCase())}`}
                                    className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary hover:pl-1 py-1.5 transition-all flex items-center gap-2"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                    {sub}
                                  </Link>
                                ))}
                              </div>
                              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                <Link
                                  href={`/catalog?category=${mCat.slug}`}
                                  className="text-xs font-semibold text-primary hover:underline"
                                >
                                  Vezi toate produsele →
                                </Link>
                              </div>
                            </div>
                          )}

                          {/* Brands Column */}
                          {mBrands.length > 0 && (
                            <div className="p-5 border-l border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 w-52">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Tag className="w-3 h-3" /> Branduri populare
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {mBrands.map((b) => (
                                  <Link
                                    key={b.id}
                                    href={`/catalog?brand=${b.id}`}
                                    className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-700 rounded-lg hover:bg-primary hover:text-white border border-slate-200 dark:border-slate-600 transition-colors"
                                  >
                                    {b.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Promo Banner Column */}
                          <div className="p-5 border-l border-slate-100 dark:border-slate-700 w-48">
                            <Link
                              href={`/catalog?category=${mCat.slug}&promo=true`}
                              className="block rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-4 text-center hover:from-primary/20 hover:to-primary/10 transition-all group"
                            >
                              <Percent className="w-8 h-8 mx-auto text-primary mb-2 group-hover:scale-110 transition-transform" />
                              <p className="text-xs font-bold text-primary-dark dark:text-primary mb-0.5">Promoții</p>
                              <p className="text-[10px] text-slate-500">Până la -30%</p>
                            </Link>
                            <Link
                              href={`/catalog?category=${mCat.slug}&condition=refurbished`}
                              className="block mt-3 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 p-4 text-center hover:from-emerald-100 hover:to-emerald-50 transition-all group"
                            >
                              <Sparkles className="w-8 h-8 mx-auto text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-0.5">Refurbished</p>
                              <p className="text-[10px] text-slate-500">Calitate, preț redus</p>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>
            ))}
            <Link href="/catalog?promo=true" className="flex items-center gap-1.5 px-3.5 py-3 text-[13px] font-bold text-accent hover:text-red-700 border-b-2 border-transparent hover:border-accent transition-colors">
              🔥 Promoții
            </Link>
            <Link href="/catalog?sort=price_asc" className="flex items-center gap-1.5 px-3.5 py-3 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors">
              💳 Credit
            </Link>
            <Link href="/contact" className="flex items-center gap-1.5 px-3.5 py-3 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors">
              ℹ️ Despre
            </Link>
          </div>
        </nav>

        {/* ─── Mobile Menu ─── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <div className="px-5 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
                {categories.map((cat) => {
                  const catSubs = subcats[cat.slug] || [];
                  const isExpanded = mobileExpanded === cat.id;

                  return (
                    <div key={cat.id}>
                      <div className="flex items-center">
                        <Link
                          href={`/catalog?category=${cat.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex-1 flex items-center gap-2 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                          <span>{cat.icon}</span>
                          {displayName(cat)}
                        </Link>
                        {catSubs.length > 0 && (
                          <button
                            onClick={() => setMobileExpanded(isExpanded ? null : cat.id)}
                            className="p-2 text-slate-400"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>
                      <AnimatePresence>
                        {isExpanded && catSubs.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pl-8 overflow-hidden"
                          >
                            {catSubs.map((sub) => (
                              <Link
                                key={sub}
                                href={`/catalog?category=${cat.slug}&sub=${encodeURIComponent(sub.toLowerCase())}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary"
                              >
                                {sub}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
                <div className="border-t border-slate-100 dark:border-slate-700 pt-2 mt-2">
                  <Link href="/catalog?promo=true" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2.5 text-sm font-bold text-accent">
                    🔥 Promoții
                  </Link>
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                    ℹ️ Contact
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
