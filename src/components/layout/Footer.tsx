'use client';

import Link from 'next/link';
import { Send, Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageProvider';

export default function Footer() {
  const { t, locale } = useLanguage();
  const lp = (path: string) => locale === 'ru' ? `/ru${path}` : path;

  return (
    <footer className="bg-[#091f4a] text-slate-400 mt-10">
      <div className="max-w-[1280px] mx-auto px-5 pt-12 pb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.jpg" alt="Logo" className="h-[36px] w-auto rounded-md" />
            </div>
            <p className="text-sm leading-relaxed mb-4">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              {/* Facebook */}
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              {/* Telegram */}
              <a href="https://t.me/westernimport" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <Send className="w-4 h-4" />
              </a>
              {/* TikTok */}
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4">{t('footer.navigation')}</h4>
            <ul className="space-y-2">
              <li><Link href="/catalog?category=laptopuri" className="text-sm hover:text-white transition-colors">💻 Laptopuri</Link></li>
              <li><Link href="/catalog?category=telefoane" className="text-sm hover:text-white transition-colors">📱 Telefoane</Link></li>
              <li><Link href="/catalog?category=tablete" className="text-sm hover:text-white transition-colors">📋 Tablete</Link></li>
              <li><Link href="/catalog?category=mini-pc" className="text-sm hover:text-white transition-colors">🖥️ Mini PC</Link></li>
              <li><Link href="/catalog?promo=true" className="text-sm hover:text-white transition-colors">🔥 Promoții</Link></li>
              <li><Link href="/catalog?discount=true" className="text-sm hover:text-white transition-colors">🏷️ Reduceri</Link></li>
              <li><Link href="/shipping" className="text-sm hover:text-white transition-colors">🚚 Livrare</Link></li>
              <li><Link href="/about" className="text-sm hover:text-white transition-colors">ℹ️ Despre</Link></li>
            </ul>
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
              <span className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300">Cash</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300">Transfer</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300">Credit</span>
            </div>
            <h4 className="text-white text-sm font-bold mb-3">{t('footer.contact')}</h4>
            <div className="space-y-2 text-sm">
              <a href="tel:+37369466585" className="flex items-center gap-2 hover:text-white transition-colors"><Phone className="w-4 h-4 text-sky-400" /> +373 69 466 585</a>
              <a href="mailto:info@westernimport.md" className="flex items-center gap-2 hover:text-white transition-colors"><Mail className="w-4 h-4 text-sky-400" /> info@westernimport.md</a>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-sky-400" /> Chișinău, Moldova</span>
            </div>
          </div>

          {/* Map */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4">{t('footer.location')}</h4>
            <div className="rounded-2xl overflow-hidden h-[160px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2727.5!2d28.85!3d47.02!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40c97c33b9e0f8e7%3A0x0!2sStrada%20Podgorenilor%2017%2C%20Chi%C8%99in%C4%83u%2C%20Moldova!5e0!3m2!1sro!2s!4v1700000000000!5m2!1sro!2s"
                width="100%"
                height="160"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
                title="Western Import - Podgorenilor 17, Chișinău"
              />
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
