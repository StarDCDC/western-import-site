'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Heart, ShoppingCart, Phone, Menu, X, Sun, Moon, ChevronDown, LogOut, Package, Settings } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { useTheme } from '@/components/ui/ThemeProvider';
import CartDrawer from '@/components/cart/CartDrawer';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '@/components/ui/SearchBar';

const navItems: { label: string; icon: string; href: string; highlight?: boolean }[] = [
  { label: 'nav.home', icon: '', href: '/' },
  { label: 'nav.laptopuri', icon: '', href: '/catalog?category=laptopuri' },
  { label: 'nav.telefoane', icon: '', href: '/catalog?category=telefoane' },
  { label: 'nav.tablete', icon: '', href: '/catalog?category=tablete' },
  { label: 'nav.miniPc', icon: '', href: '/catalog?category=mini-pc' },
  { label: 'nav.reduceri', icon: '', href: '/catalog?discount=true' },
  { label: 'nav.livrare', icon: '', href: '/shipping' },
  { label: 'nav.about', icon: '', href: '/about' },
];

export default function Header() {
  const { locale, setLocale, t } = useLanguage();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<{ user?: { name?: string; email?: string; role?: string } } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.getCount());

  useEffect(() => {
    setMounted(true);
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 10);
      if (currentY > lastScrollY && currentY > 80) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      setLastScrollY(currentY);
    };
    window.addEventListener('scroll', onScroll);
    fetch('/api/auth/session').then(r => r.json()).then(s => setSession(s)).catch(() => setSession(null));
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY]);

  return (
    <>

      {/* Header */}
      <header
        className={`sticky top-1 z-[100] bg-slate-800/95 backdrop-blur-xl transition-all duration-300 rounded-2xl mx-2 sm:mx-4 lg:mx-6 shadow-sm dark:bg-[var(--color-dark-surface)]/95 ${
          scrolled ? 'shadow-lg' : ''
        } ${!headerVisible ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'}`}
      >
        <div className="max-w-[1280px] mx-auto px-3 sm:px-5 flex items-center gap-2 sm:gap-5 py-2.5 sm:py-3">
          {/* Logo */}
          {/* Desktop/Tablet Logo — logo mare */}
          <Link href="/" className="hidden sm:flex items-center gap-2.5 shrink-0">
            <div className="h-[44px] w-auto max-w-[180px]">
              <Image src="/logo-dark.jpg" alt="Western Import" width={180} height={44} sizes="180px" className="h-[44px] w-auto object-contain" priority />
            </div>
          </Link>

          {/* Mobile logo — logo mare compact */}
          <Link href="/" className="sm:hidden shrink-0">
            <div className="h-[34px] w-auto max-w-[140px]">
              <Image src="/logo-dark.jpg" alt="Western Import" width={140} height={34} sizes="140px" className="h-[34px] w-auto object-contain" />
            </div>
          </Link>

          {/* Search Bar - hidden on mobile, shown in expanded header */}
          <div className="hidden sm:block flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* Desktop Actions (sm+) */}
          <div className="hidden sm:flex items-center gap-1 ml-auto">
            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 dark:hover:bg-slate-100 transition-colors"
                >
                  <div className="w-[18px] h-[18px] bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">{session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'}</span>
                  </div>
                  <span className="text-[10px] text-slate-300 dark:text-slate-600 hidden lg:block">{session.user.name || session.user.email?.split('@')[0]}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform hidden lg:block ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[var(--color-dark-elevated)] border border-slate-200 dark:border-white/[0.06] rounded-xl shadow-lg py-1 z-50">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-white/[0.06]">
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
                        onClick={async () => { setUserMenuOpen(false); try { await fetch('/api/auth/signout', { method: 'POST' }); } catch {} setSession(null); window.location.href = '/?signedout=1'; }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Deconectează-te
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="flex items-center justify-center px-2 py-1.5 rounded-xl hover:bg-white/10 dark:hover:bg-slate-100 transition-colors group" aria-label="Login">
                <User className="w-[18px] h-[18px] text-slate-300 dark:text-slate-600 group-hover:text-sky-400 dark:group-hover:text-primary" />
              </Link>
            )}
            <Link
              href="/wishlist"
              className="relative flex items-center justify-center px-2 py-1.5 rounded-xl hover:bg-white/10 dark:hover:bg-slate-100 transition-colors group"
              aria-label="Wishlist"
            >
              <Heart className="w-[18px] h-[18px] text-slate-300 dark:text-slate-600 group-hover:text-sky-400 dark:group-hover:text-primary" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center justify-center px-2 py-1.5 rounded-xl hover:bg-white/10 dark:hover:bg-slate-100 transition-colors group"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-[18px] h-[18px] text-slate-300 dark:text-slate-600 group-hover:text-sky-400 dark:group-hover:text-primary" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <Link
              href="/contact"
              className="hidden md:flex items-center justify-center px-2 py-1.5 rounded-xl hover:bg-white/10 dark:hover:bg-slate-100 transition-colors group"
              aria-label="Contact phone"
            >
              <Phone className="w-[18px] h-[18px] text-slate-300 dark:text-slate-600 group-hover:text-sky-400 dark:group-hover:text-primary" />
            </Link>
            {/* Language + Theme toggle (desktop) */}
            <div className="hidden md:flex items-center gap-1 ml-1 pl-2 border-l border-slate-200 dark:border-white/[0.06]">
              <button
                onClick={() => setLocale('ro')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
                  locale === 'ro' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >RO</button>
              <button
                onClick={() => setLocale('ru')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
                  locale === 'ru' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >RU</button>
              <button
                onClick={toggle}
                className="p-1.5 rounded-md text-slate-400 hover:bg-white/10 dark:hover:bg-slate-100 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Actions (sm and below) - only logo circle + hamburger with badges */}
          <div className="flex sm:hidden items-center gap-2 ml-auto">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-xl hover:bg-white/10 dark:hover:bg-slate-100 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5 text-slate-300 dark:text-slate-600" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl hover:bg-white/10 dark:hover:bg-slate-100"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block overflow-x-auto no-scrollbar">
          <div className="max-w-[1280px] mx-auto px-5 flex items-center whitespace-nowrap gap-1.5 py-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium rounded-xl transition-all ${
                  item.highlight
                    ? 'text-white bg-red-600 hover:bg-red-700 shadow-sm shadow-red-500/30 font-bold'
                    : 'text-slate-300 dark:text-slate-700 bg-white/10 dark:bg-slate-100/70 hover:bg-primary/10 hover:text-primary dark:hover:text-primary'
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
              className="lg:hidden overflow-hidden border-t border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[var(--color-dark-surface)]"
            >
              <div className="px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
                {/* Mobile Search */}
                <div className="mb-3">
                  <SearchBar />
                </div>
                {/* Mobile Quick Actions */}
                <div className="flex gap-2 mb-3 pb-3 border-b border-slate-200 dark:border-white/[0.06]">
                  <Link href="/login" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition text-sm">
                    <User className="w-4 h-4" /> {locale === 'ru' ? 'Аккаунт' : 'Cont'}
                  </Link>
                  <Link href="/wishlist" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition text-sm relative">
                    <Heart className="w-4 h-4" /> {locale === 'ru' ? 'Избранное' : 'Favorite'}
                    {mounted && wishlistCount > 0 && (
                      <span className="bg-accent text-white text-[10px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center">{wishlistCount}</span>
                    )}
                  </Link>
                </div>
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 py-2.5 text-sm font-medium ${
                      item.highlight ? 'text-accent font-bold' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {t(item.label)}
                  </Link>
                ))}
                {/* Mobile Language + Theme */}
                <div className="flex items-center gap-2 pt-3 mt-2 border-t border-slate-200 dark:border-white/[0.06]">
                  <button
                    onClick={() => setLocale('ro')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      locale === 'ro' ? 'bg-primary/10 text-primary' : 'text-slate-400 bg-slate-100 dark:bg-slate-700'
                    }`}
                  >RO</button>
                  <button
                    onClick={() => setLocale('ru')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      locale === 'ru' ? 'bg-primary/10 text-primary' : 'text-slate-400 bg-slate-100 dark:bg-slate-700'
                    }`}
                  >RU</button>
                  <button
                    onClick={toggle}
                    className="ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    {theme === 'dark' ? (locale === 'ru' ? 'Светлая' : 'Light') : (locale === 'ru' ? 'Тёмная' : 'Dark')}
                  </button>
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