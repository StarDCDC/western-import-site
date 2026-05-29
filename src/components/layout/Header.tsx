'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Heart, ShoppingCart, Phone, Menu, X, Sun, Moon, ChevronDown, LogOut, Package, Settings } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { useTheme } from '@/components/ui/ThemeProvider';
import CartDrawer from '@/components/cart/CartDrawer';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '@/components/ui/SearchBar';

const navItems = [
  { label: 'nav.laptopuri', icon: '💻', href: '/catalog?category=laptopuri' },
  { label: 'nav.telefoane', icon: '📱', href: '/catalog?category=telefoane' },
  { label: 'nav.tablete', icon: '📋', href: '/catalog?category=tablete' },
  { label: 'nav.miniPc', icon: '🖥️', href: '/catalog?category=mini-pc' },
  { label: 'nav.promotions', icon: '🔥', href: '/catalog?promo=true', highlight: true },
  { label: 'nav.reduceri', icon: '🏷️', href: '/catalog?discount=true' },

  { label: 'nav.livrare', icon: '🚚', href: '/shipping' },

  { label: 'nav.about', icon: 'ℹ️', href: '/about' },
];

export default function Header() {
  const { locale, setLocale, t } = useLanguage();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<{ user?: { name?: string; email?: string; role?: string } } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.getCount());

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    fetch('/api/auth/session').then(r => r.json()).then(s => setSession(s)).catch(() => setSession(null));
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
        <div className="max-w-[1280px] mx-auto px-3 sm:px-5 flex items-center gap-2 sm:gap-5 py-2.5 sm:py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.jpg" alt="Logo" className="h-[36px] sm:h-[42px] w-auto rounded-lg dark:hidden" />
            <img src="/logo-dark.jpg" alt="Logo" className="h-[36px] sm:h-[42px] w-auto rounded-lg hidden dark:block" />
          </Link>

          {/* Search Bar - hidden on mobile, shown in expanded header */}
          <div className="hidden sm:block flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1 ml-auto">
            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-[18px] h-[18px] bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">{session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 hidden lg:block">{session.user.name || session.user.email?.split('@')[0]}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform hidden lg:block ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-50">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{session.user.name || 'Client'}</p>
                        <p className="text-[10px] text-slate-400 truncate">{session.user.email}</p>
                      </div>
                      <Link href="/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                        <User className="w-3.5 h-3.5" /> Contul meu
                      </Link>
                      <Link href="/account/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                        <Package className="w-3.5 h-3.5" /> Comenzi
                      </Link>
                      {(session.user.role === 'ADMIN' || session.user.role === 'MODERATOR') && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs text-amber-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700">
                          <Settings className="w-3.5 h-3.5" /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={async () => { setUserMenuOpen(false); await fetch('/api/auth/signout', { method: 'POST' }); setSession(null); window.location.href = '/'; }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Deconectează-te
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                <User className="w-[18px] h-[18px] text-slate-600 dark:text-slate-400 group-hover:text-primary" />
                <span className="text-[10px] text-slate-500 group-hover:text-primary hidden sm:block">Cont</span>
              </Link>
            )}
            <Link
              href="/wishlist"
              className="relative flex items-center justify-center px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <Heart className="w-[18px] h-[18px] text-slate-600 dark:text-slate-400 group-hover:text-primary" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center justify-center px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <ShoppingCart className="w-[18px] h-[18px] text-slate-600 dark:text-slate-400 group-hover:text-primary" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <Link
              href="/contact"
              className="hidden md:flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <Phone className="w-[18px] h-[18px] text-slate-600 dark:text-slate-400 group-hover:text-primary" />
              <span className="text-[10px] text-slate-500 group-hover:text-primary">Contact</span>
            </Link>
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
              <div className="px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
                {/* Mobile Search */}
                <div className="mb-3 sm:hidden">
                  <SearchBar />
                </div>
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