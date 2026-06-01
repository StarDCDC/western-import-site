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
  // Social links are admin-editable (Setări → Social). Fall back to defaults.
  const facebook = settings.facebook || 'https://facebook.com';
  const instagram = settings.instagram || 'https://instagram.com';
  const telegram = settings.telegram || 'https://t.me/westernimport';
  const tiktok = settings.tiktok || 'https://tiktok.com';

  return (
    <footer className="bg-[#091f4a] text-slate-400 mt-10">
      <div className="max-w-[1280px] mx-auto px-5 pt-12 pb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10">
          {/* Brand + Social */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/logo-new.jpg" alt="Western Import" width={40} height={40} className="h-10 w-10 rounded-full object-cover" priority />
            </div>
            <p className="text-sm leading-relaxed mb-4">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              {/* Facebook */}
              <a href={facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#1877F2"/><path d="M29 25l.5-3.5h-3.5v-2.3c0-1 .5-1.9 2-1.9h1.7v-3s-.8-.1-1.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.5H21V25h3v8.5h3.5V25H29z" fill="#fff"/></svg>
              </a>
              {/* Instagram */}
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="url(#ig)"/><defs><radialGradient id="ig" cx="12" cy="40" r="40"><stop stopColor="#FD5"/><stop offset=".3" stopColor="#FD5"/><stop offset=".45" stopColor="#FF543E"/><stop offset=".6" stopColor="#C837AB"/><stop offset="1" stopColor="#405DE6"/></radialGradient></defs><rect x="11" y="11" width="26" height="26" rx="7" stroke="#fff" strokeWidth="2.5" fill="none"/><circle cx="24" cy="24" r="7.5" stroke="#fff" strokeWidth="2.5" fill="none"/><circle cx="33" cy="15" r="1.8" fill="#fff"/></svg>
              </a>
              {/* Telegram */}
              <a href={telegram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#26A5E4"/><path d="M10.5 23.5l7 2.6 2.7 8.7c.2.6.9.8 1.3.4l3.9-3.2c.4-.3.9-.3 1.3-.1l7 5.1c.5.4 1.2.1 1.3-.5L37.5 13c.1-.7-.5-1.2-1.1-1L10.3 22.4c-.7.3-.7 1.3.2 1.6l7 2.2" fill="#fff"/></svg>
              </a>
              {/* TikTok */}
              <a href={tiktok} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#010101"/><path d="M21 10h4.5v18c0 2.5-2 4.5-4.5 4.5s-4.5-2-4.5-4.5 2-4.5 4.5-4.5c.5 0 1 .1 1.5.2V19c-.5-.1-1-.1-1.5-.1-4.7 0-8.5 3.8-8.5 8.5s3.8 8.5 8.5 8.5 8.5-3.8 8.5-8.5V18.5c1.5 1.1 3.4 1.8 5.5 1.8V16c-3 0-5.5-2.5-5.5-5.5H26V10h-5z" fill="url(#tt)"/><defs><linearGradient id="tt" x1="20" y1="10" x2="32" y2="36"><stop stopColor="#25F4EE"/><stop offset=".5" stopColor="#FE2C55"/><stop offset="1" stopColor="#25F4EE"/></linearGradient></defs></svg>
              </a>
            </div>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2">
              <li><Link href={lp("/about")} className="text-sm hover:text-white transition-colors">{t('footer.aboutUs')}</Link></li>
              <li><Link href={lp("/contact")} className="text-sm hover:text-white transition-colors">{t('footer.contact')}</Link></li>
              <li><Link href={lp("/blog")} className="text-sm hover:text-white transition-colors">{t('footer.blog')}</Link></li>
              <li><Link href={lp("/terms")} className="text-sm hover:text-white transition-colors">{t('footer.terms')}</Link></li>
              <li><Link href={lp("/shipping")} className="text-sm hover:text-white transition-colors">{t('footer.shipping')}</Link></li>
              <li><Link href={lp("/warranty")} className="text-sm hover:text-white transition-colors">{t('footer.warranty')}</Link></li>
              <li><Link href={lp("/faq")} className="text-sm hover:text-white transition-colors">{t('footer.faq')}</Link></li>
            </ul>
          </div>

          {/* Payment & Contact */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4">{t('footer.payment')}</h4>
            <div className="flex gap-2 flex-wrap items-center mb-5">
              {/* Visa */}
              <span className="bg-white/10 px-3 py-1.5 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-auto" viewBox="0 0 48 32" fill="none"><rect width="48" height="32" rx="4" fill="#1A1F71"/><path d="M19.5 22h-3l1.9-12h3l-1.9 12zm12.8-11.7c-.6-.2-1.5-.5-2.7-.5-3 0-5.1 1.5-5.1 3.7 0 1.6 1.5 2.5 2.6 3.1 1.2.6 1.6.9 1.6 1.4 0 .8-.9 1.1-1.8 1.1-1.2 0-1.9-.2-2.9-.6l-.4-.2-.4 2.5c.7.3 2.1.6 3.5.6 3.2 0 5.2-1.5 5.2-3.8 0-1.3-.8-2.2-2.5-3-1-.5-1.7-.9-1.7-1.4 0-.5.5-1 1.7-1 1 0 1.7.2 2.2.4l.3.1.4-2.4zm7.9-.3h-2.3c-.7 0-1.3.2-1.6.9L32.1 22h3.2l.6-1.7h3.9l.4 1.7H43l-2.5-11.7h-2.8zm-2.5 7.5l1.2-3.2.4-1.1.3 1 .7 3.3h-2.6zM16.8 10l-2.8 8.2-.3-1.7c-.5-1.7-2.2-3.5-4-4.4l2.6 9.4h3.2l4.7-11.6h-3.4v.1z" fill="#fff"/><path d="M11.2 10H6.3l0 .2c3.8.9 6.3 3.2 7.3 5.8L12.5 11c-.2-.7-.7-.9-1.3-1z" fill="#F9A533"/></svg>
              </span>
              {/* Mastercard */}
              <span className="bg-white/10 px-3 py-1.5 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-auto" viewBox="0 0 48 32" fill="none"><rect width="48" height="32" rx="4" fill="#252525"/><circle cx="18" cy="16" r="9" fill="#EB001B"/><circle cx="30" cy="16" r="9" fill="#F79E1B"/><path d="M24 9.4a9 9 0 010 13.2 9 9 0 000-13.2z" fill="#FF5F00"/></svg>
              </span>
              {/* Apple Pay */}
              <span className="bg-white/10 px-3 py-1.5 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-auto" viewBox="0 0 48 32" fill="none"><rect width="48" height="32" rx="4" fill="#000"/><text x="8" y="21" fontFamily="system-ui" fontSize="13" fontWeight="600" fill="#fff">Pay</text><path d="M14.5 11.5c-.3.4-.8.7-1.3.7 0-.5.2-1 .5-1.4.3-.3.9-.6 1.3-.7.1.5-.1 1-.5 1.4zm.4.7c-.7 0-1.2.4-1.5.4s-.8-.4-1.3-.4c-1 0-2 .8-2 2.3 0 1.5 1 3 1.8 3 .4 0 .7-.3 1.2-.3.5 0 .7.3 1.2.3.8 0 1.4-1.1 1.6-1.6-.7-.3-1-1-1-1.7 0-.6.4-1.1.8-1.4-.4-.5-.8-.6-1.1-.6z" fill="#fff"/></svg>
              </span>
              {/* Google Pay */}
              <span className="bg-white/10 px-3 py-1.5 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-auto" viewBox="0 0 48 32" fill="none"><rect width="48" height="32" rx="4" fill="#fff"/><text x="5" y="20" fontFamily="system-ui" fontSize="11" fontWeight="500" fill="#5F6368">G</text><text x="14" y="20" fontFamily="system-ui" fontSize="11" fontWeight="500" fill="#4285F4">o</text><text x="21" y="20" fontFamily="system-ui" fontSize="11" fontWeight="500" fill="#EA4335">o</text><text x="28" y="20" fontFamily="system-ui" fontSize="11" fontWeight="500" fill="#FBBC05">g</text><text x="35" y="20" fontFamily="system-ui" fontSize="11" fontWeight="500" fill="#4285F4">le</text></svg>
              </span>
            </div>
            <div className="flex gap-3">
              <a href={`tel:${phoneClean}`} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
              </a>
              <a href={`mailto:${email}`} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              <a href="https://maps.google.com/?q=Strada+Podgorenilor+17+Chisinau" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white transition-colors">
                <MapPin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Map */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4">{t('footer.location')}</h4>
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
