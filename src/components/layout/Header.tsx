'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Heart, ShoppingCart, Phone, Menu, X, Search, Sun, Moon } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { useTheme } from '@/components/ui/ThemeProvider';
import CartDrawer from '@/components/cart/CartDrawer';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'nav.laptopuri', icon: '💻', href: '/catalog?category=laptopuri' },
  { label: 'nav.telefoane', icon: '📱', href: '/catalog?category=telefoane' },
  { label: 'nav.pcMonitoare', icon: '🖥️', href: '/catalog?category=pc-monitoare' },
  { label: 'nav.tablete', icon: '📋', href: '/catalog?category=tablete' },
  { label: 'nav.componente', icon: '🔧', href: '/catalog?category=componente' },
  { label: 'nav.accesorii', icon: '🔌', href: '/catalog?category=accesorii' },
  { label: 'nav.promotions', icon: '🔥', href: '/catalog?promo=true', highlight: true },
  { label: 'nav.reduceri', icon: '🏷️', href: '/catalog?discount=true' },

  { label: 'nav.livrare', icon: '🚚', href: '/shipping' },
  { label: 'nav.credit', icon: '💳', href: '/catalog?credit=true' },

  { label: 'nav.about', icon: 'ℹ️', href: '/about' },
];

export default function Header() {
  const { locale, setLocale, t } = useLanguage();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.getCount());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Topbar */}
      <div className="bg-[#091f4a] text-white text-xs py-2">
        <div className="max-w-[1280px] mx-auto px-5 flex justify-between items-center">
          <div className="flex gap-5 items-center">
            <span className="flex items-center gap-1 text-sky-300">
              <i className="fas fa-truck"></i> {t('topbar.freeShipping')}
            </span>
            <span className="hidden sm:flex items-center gap-1 text-sky-300">
              <i className="fas fa-shield-halved"></i> {t('topbar.certifiedService')}
            </span>
            <span className="hidden md:flex items-center gap-1 text-sky-300">
              <i className="fas fa-rotate-left"></i> {t('topbar.returns14')}
            </span>
          </div>
          <div className="flex gap-1 items-center">
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
            <button
              onClick={toggle}
              className="ml-1 p-1.5 rounded-md text-sky-300 hover:bg-white/15 transition-colors"
              title={theme === 'dark' ? 'Comută pe light mode' : 'Comută pe dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header
        className={`sticky top-0 z-[100] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 transition-shadow ${
          scrolled ? 'shadow-md' : ''
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-5 flex items-center gap-5 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.jpg" alt="Western Import" className="h-[42px] w-auto rounded-lg" />
            <div>
              <div className="text-lg font-extrabold text-[#0c3a8f] dark:text-white leading-tight">Western Import</div>

            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-[520px] relative">
            <input
              type="text"
              placeholder={t('nav.searchPlaceholder')}
              className="w-full px-4 py-2.5 pr-12 border-2 border-[#e2e8f0] dark:border-slate-600 rounded-xl text-sm bg-[#f8fafc] dark:bg-slate-800 focus:outline-none focus:border-[#1a56db] focus:bg-white dark:focus:bg-slate-700 transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#1a56db] text-white px-3.5 py-2 rounded-xl hover:bg-[#0c3a8f] transition-colors">
              <i className="fas fa-search text-sm"></i>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/login"
              className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <User className="w-[18px] h-[18px] text-slate-600 dark:text-slate-400 group-hover:text-primary" />
              <span className="text-[10px] text-slate-500 group-hover:text-primary hidden lg:block">Cont</span>
            </Link>
            <Link
              href="/wishlist"
              className="relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <Heart className="w-[18px] h-[18px] text-slate-600 dark:text-slate-400 group-hover:text-primary" />
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
              <ShoppingCart className="w-[18px] h-[18px] text-slate-600 dark:text-slate-400 group-hover:text-primary" />
              <span className="text-[10px] text-slate-500 group-hover:text-primary hidden lg:block">Coș</span>
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-1 bg-accent text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <a
              href="tel:+37369466585"
              className="hidden md:flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <Phone className="w-[18px] h-[18px] text-slate-600 dark:text-slate-400 group-hover:text-primary" />
              <span className="text-[10px] text-slate-500 group-hover:text-primary">Contact</span>
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block border-t border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
          <div className="max-w-[1280px] mx-auto px-5 flex items-center whitespace-nowrap">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-3 text-[13px] font-medium transition-colors border-b-2 border-transparent ${
                  item.highlight
                    ? 'text-accent hover:text-red-700 hover:border-accent font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary hover:border-primary'
                }`}
              >
                <span>{item.icon}</span>
                {t(item.label)}
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <div className="px-5 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 py-2.5 text-sm font-medium ${
                      item.highlight ? 'text-accent font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {t(item.label)}
                  </Link>
                ))}
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