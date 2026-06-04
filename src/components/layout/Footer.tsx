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
    <footer className="bg-slate-900 dark:bg-white text-slate-400 dark:text-slate-500 mt-10">
      <div className="max-w-[1280px] mx-auto px-5 pt-12 pb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10">
          {/* Brand + Social */}
          <div>
            <div className="mb-4">
              <Image src="/logo-footer.png" alt="Western Import" width={180} height={50} className="h-10 w-auto object-contain" priority />
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
                <img src="/social-tiktok.svg" alt="TikTok" width={36} height={36} className="w-9 h-9 rounded-lg" />
              </a>
            </div>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="text-slate-100 dark:text-slate-800 text-sm font-bold mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2">
              <li><Link href={lp("/about")} className="text-sm hover:text-slate-100 dark:text-slate-800 transition-colors">{t('footer.aboutUs')}</Link></li>
              <li><Link href={lp("/contact")} className="text-sm hover:text-slate-100 dark:text-slate-800 transition-colors">{t('footer.contact')}</Link></li>
              <li><Link href={lp("/blog")} className="text-sm hover:text-slate-100 dark:text-slate-800 transition-colors">{t('footer.blog')}</Link></li>
              <li><Link href={lp("/terms")} className="text-sm hover:text-slate-100 dark:text-slate-800 transition-colors">{t('footer.terms')}</Link></li>
              <li><Link href={lp("/shipping")} className="text-sm hover:text-slate-100 dark:text-slate-800 transition-colors">{t('footer.shipping')}</Link></li>
              <li><Link href={lp("/warranty")} className="text-sm hover:text-slate-100 dark:text-slate-800 transition-colors">{t('footer.warranty')}</Link></li>
              <li><Link href={lp("/faq")} className="text-sm hover:text-slate-100 dark:text-slate-800 transition-colors">{t('footer.faq')}</Link></li>
            </ul>
          </div>

          {/* Payment & Contact */}
          <div>
            <h4 className="text-slate-100 dark:text-slate-800 text-sm font-bold mb-4">{t('footer.payment')}</h4>
            {/* Payment — official brand logos */}
            <div className="flex gap-3 flex-wrap items-center justify-start mb-5">
              <img src="/payment-visa.svg" alt="Visa" width={56} height={35} className="h-8 w-auto rounded" />
              <img src="/payment-mastercard.svg" alt="Mastercard" width={56} height={35} className="h-8 w-auto rounded" />
              <img src="/payment-applepay.svg" alt="Apple Pay" width={56} height={35} className="h-8 w-auto rounded" />
              <img src="/payment-googlepay.svg" alt="Google Pay" width={56} height={35} className="h-8 w-auto rounded" />
            </div>
            <div className="flex gap-3">
              <a href={`tel:${phoneClean}`} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-slate-100 dark:text-slate-800 transition-colors">
                <Phone className="w-4 h-4" />
              </a>
              <a href={`mailto:${email}`} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-slate-100 dark:text-slate-800 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              <a href="https://maps.google.com/?q=Strada+Podgorenilor+17+Chisinau" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-slate-100 dark:text-slate-800 transition-colors">
                <MapPin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Map */}
          <div>
            <h4 className="text-slate-100 dark:text-slate-800 text-sm font-bold mb-4">{t('footer.location')}</h4>
            <div className="rounded-2xl overflow-hidden h-[180px] bg-slate-800">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2727.5!2d28.85!3d47.02!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40c97c33b9e0f8e7%3A0x0!2sStrada%20Podgorenilor%2017%2C%20Chi%C8%99in%C4%83u%2C%20Moldova!5e0!3m2!1sro!2s!4v1700000000000!5m2!1sro!2s"
                width="100%"
                height="180"
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
