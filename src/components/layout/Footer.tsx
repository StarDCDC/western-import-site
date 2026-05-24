'use client';

import Link from 'next/link';
import { Send } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageProvider';

export default function Footer() {
  const { t, locale } = useLanguage();

  // Helper to prefix paths with /ru/ when in Russian mode
  const lp = (path: string) => locale === 'ru' ? `/ru${path}` : path;
  return (
    <footer className="bg-[#091f4a] text-slate-400 mt-10">
      <div className="max-w-[1280px] mx-auto px-5 pt-12 pb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.jpg" alt="Western Import" className="h-[36px] w-auto rounded-md" />
              <span className="text-white text-base font-bold">Western Import</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://t.me/westernimport" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <Send className="w-4 h-4" />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <i className="fab fa-tiktok"></i>
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2">
              <li><Link href={lp("/about")} className="text-sm hover:text-white transition-colors">{t('footer.aboutUs')}</Link></li>
              <li><Link href={lp("/contact")} className="text-sm hover:text-white transition-colors">{t('footer.contact')}</Link></li>
              <li><Link href={lp("/blog")} className="text-sm hover:text-white transition-colors">{t('footer.blog')}</Link></li>
              <li><Link href={lp("/terms")} className="text-sm hover:text-white transition-colors">{t('footer.terms')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4">{t('footer.support')}</h4>
            <ul className="space-y-2">
              <li><Link href={lp("/shipping")} className="text-sm hover:text-white transition-colors">{t('footer.shipping')}</Link></li>
              <li><Link href={lp("/warranty")} className="text-sm hover:text-white transition-colors">{t('footer.warranty')}</Link></li>
              <li><Link href={lp("/faq")} className="text-sm hover:text-white transition-colors">{t('footer.faq')}</Link></li>
            </ul>
          </div>

          {/* Payment & Contact */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4">{t('footer.payment')}</h4>
            <div className="flex gap-2 flex-wrap mb-5">
              <span className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300">Visa</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300">MasterCard</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300">Cash</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300">Transfer</span>
            </div>
            <h4 className="text-white text-sm font-bold mb-3">{t('footer.contact')}</h4>
            <div className="space-y-2 text-sm">
              <span className="flex items-center gap-2"><i className="fas fa-phone text-sky-400 w-4"></i> +373 69 466 585</span>
              <span className="flex items-center gap-2"><i className="fas fa-envelope text-sky-400 w-4"></i> info@westernimport.md</span>
              <span className="flex items-center gap-2"><i className="fas fa-location-dot text-sky-400 w-4"></i> Chișinău, Moldova</span>
            </div>
          </div>

          {/* Map */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4">{t('footer.location')}</h4>
            <div className="rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#0c3a8f] h-[140px] flex items-center justify-center">
              <span className="flex items-center gap-2 text-sky-400 text-xs">
                <i className="fas fa-map-marker-alt"></i> Chișinău, Moldova
              </span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Western Import. {t('footer.rights')}.
        </div>
      </div>
    </footer>
  );
}