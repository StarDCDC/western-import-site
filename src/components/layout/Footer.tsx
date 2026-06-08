'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { useSettings } from '@/lib/useSettings';

export default function Footer() {
  const { t, locale } = useLanguage();
  const lp = (path: string) => locale === 'ru' ? `/ru${path}` : path;
  const settings = useSettings();

  const phone = settings.phone || settings.site_phone || '+373 69 466 585';
  const email = settings.email || settings.site_email || 'info@westernimport.md';
  const address = settings.address || settings.site_address || 'Chișinău, Moldova';
  const phoneClean = phone.replace(/[\s-]/g, '');
  const facebook = settings.facebook || 'https://facebook.com';
  const instagram = settings.instagram || 'https://instagram.com';
  const telegram = settings.telegram || 'https://t.me/westernimport';
  const tiktok = settings.tiktok || 'https://tiktok.com';

  return (
    <footer className="bg-slate-900 dark:bg-[var(--color-dark-surface)] text-slate-400 dark:text-slate-400 mt-10">
      <div className="max-w-[1280px] mx-auto px-5 pt-12 pb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10">
          {/* Brand + Social */}
          <div>
            <div className="mb-4">
              <Image src="/logo-footer.jpg" alt="Western Import" width={180} height={50} sizes="180px" className="h-10 w-auto object-contain brightness-0 invert" loading="lazy" />
            </div>
            <p className="text-sm leading-relaxed mb-4">
              {t('footer.description')}
            </p>
            {/* Social — official colored brand logos */}
            <div className="flex gap-3">
              <a href={facebook} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" title="Facebook">
                <img src="/social-facebook.svg" alt="Facebook" width={36} height={36} className="w-9 h-9 rounded-lg" />
              </a>
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" title="Instagram">
                <img src="/social-instagram.svg" alt="Instagram" width={36} height={36} className="w-9 h-9 rounded-lg" />
              </a>
              <a href={telegram} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" title="Telegram">
                <img src="/social-telegram.svg" alt="Telegram" width={36} height={36} className="w-9 h-9 rounded-lg" />
              </a>
              <a href={tiktok} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" title="TikTok">
                <img src="/social-tiktok.svg" alt="TikTok" width={36} height={36} className="w-9 h-9 rounded-lg translate-y-[1px] scale-105" />
              </a>
            </div>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="text-slate-100 dark:text-slate-200 text-sm font-bold mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2">
              <li><Link href={lp("/about")} className="text-sm hover:text-slate-100 dark:text-slate-200 transition-colors">{t('footer.aboutUs')}</Link></li>
              <li><Link href={lp("/contact")} className="text-sm hover:text-slate-100 dark:text-slate-200 transition-colors">{t('footer.contact')}</Link></li>
              <li><Link href={lp("/blog")} className="text-sm hover:text-slate-100 dark:text-slate-200 transition-colors">{t('footer.blog')}</Link></li>
              <li><Link href={lp("/terms")} className="text-sm hover:text-slate-100 dark:text-slate-200 transition-colors">{t('footer.terms')}</Link></li>
              <li><Link href={lp("/shipping")} className="text-sm hover:text-slate-100 dark:text-slate-200 transition-colors">{t('footer.shipping')}</Link></li>
              <li><Link href={lp("/warranty")} className="text-sm hover:text-slate-100 dark:text-slate-200 transition-colors">{t('footer.warranty')}</Link></li>
              <li><Link href={lp("/faq")} className="text-sm hover:text-slate-100 dark:text-slate-200 transition-colors">{t('footer.faq')}</Link></li>
            </ul>
          </div>

          {/* Payment & Contact */}
          <div>
            <h4 className="text-slate-100 dark:text-slate-200 text-sm font-bold mb-4">{t('footer.payment')}</h4>
            {/* Payment — official brand logos */}
            <div className="flex gap-3 flex-wrap items-center justify-start mb-5">
              <div className="h-9 px-2 bg-white rounded flex items-center">
                <img src="/payment-visa.svg" alt="Visa" className="h-6 w-auto" />
              </div>
              <div className="h-9 px-2 bg-white rounded flex items-center">
                <img src="/payment-mastercard.svg" alt="Mastercard" className="h-6 w-auto" />
              </div>
              <div className="h-9 px-2 bg-white rounded flex items-center">
                <img src="/payment-applepay.svg" alt="Apple Pay" className="h-6 w-auto scale-110" />
              </div>
              <div className="h-9 px-2 bg-white rounded flex items-center">
                <img src="/payment-googlepay.svg" alt="Google Pay" className="h-6 w-auto" />
              </div>
            </div>
            <div className="flex gap-3">
              <a href={`tel:${phoneClean}`} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-slate-100 dark:text-slate-200 transition-colors">
                <Phone className="w-4 h-4" />
              </a>
              <a href={`mailto:${email}`} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-slate-100 dark:text-slate-200 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              <a href="https://maps.google.com/?q=Strada+Podgorenilor+17+Chisinau" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-slate-100 dark:text-slate-200 transition-colors">
                <MapPin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Map */}
          <div>
            <h4 className="text-slate-100 dark:text-slate-200 text-sm font-bold mb-4">{t('footer.location')}</h4>
            <a
              href="https://www.google.com/maps?q=Strada+Podgorenilor+17+Chisinau+Moldova"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-colors"
            >
              <iframe
                src="https://maps.google.com/maps?q=Strada+Podgorenilor+17+Chisinau+Moldova&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="180"
                style={{ border: 0, filter: 'grayscale(30%) contrast(1.1)' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Western Import — Strada Podgorenilor 17, Chișinău"
              />
            </a>
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
