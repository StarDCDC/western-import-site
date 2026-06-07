// src/components/contact/ContactInfo.tsx
'use client';

import { useSettings } from '@/lib/useSettings';
import Link from 'next/link';

export default function ContactInfo({ locale }: { locale: string }) {
  const isRu = locale === 'ru';
  const settings = useSettings();

  const phone = settings.phone || settings.site_phone || '+373 69 466 585';
  const email = settings.email || settings.site_email || 'info@westernimport.md';
  const address = settings.address || settings.site_address || 'str. Podgorenilor 17, Chișinău';
  const schedule = settings.schedule || 'Lun-Sâm: 09:00 - 18:00';
  const facebook = settings.facebook || '';
  const instagram = settings.instagram || '';
  const telegram = settings.telegram || '';
  const tiktok = settings.tiktok || '';
  const whatsapp = settings.whatsapp || '';
  const viber = settings.viber || '';

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          {isRu ? 'Контактная информация' : 'Informații de contact'}
        </h2>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">{isRu ? 'Телефон' : 'Telefon'}</p>
              <a href={`tel:${phone.replace(/[\s-]/g, '')}`} className="text-sm font-semibold text-slate-800 dark:text-white hover:text-primary">{phone}</a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Email</p>
              <a href={`mailto:${email}`} className="text-sm font-semibold text-slate-800 dark:text-white hover:text-primary">{email}</a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">{isRu ? 'Адрес' : 'Adresă'}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">{isRu ? 'График работы' : 'Program'}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{schedule}</p>
            </div>
          </div>
        </div>

        {/* Social Media */}
        {(facebook || instagram || telegram || tiktok || whatsapp || viber) && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
            <p className="text-xs text-slate-400 font-medium mb-3">Social Media</p>
            <div className="flex flex-wrap gap-2">
              {facebook && <a href={facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"><img src="/social-facebook.svg" alt="" className="w-4 h-4" />Facebook</a>}
              {instagram && <a href={instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"><img src="/social-instagram.svg" alt="" className="w-4 h-4" />Instagram</a>}
              {telegram && <a href={telegram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"><img src="/social-telegram.svg" alt="" className="w-4 h-4" />Telegram</a>}
              {tiktok && <a href={tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"><img src="/social-tiktok.svg" alt="" className="w-4 h-4" />TikTok</a>}
              {whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300">💬 WhatsApp</a>}
              {viber && <a href={viber} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300">📞 Viber</a>}
            </div>
          </div>
        )}
      </div>

      {/* Map — static image + Google Maps link */}
      <a
        href="https://www.google.com/maps?q=Strada+Podgorenilor+17+Chisinau+Moldova"
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-[260px] relative group cursor-pointer"
      >
        <img src="/map-location.png" alt="Western Import — str. Podgorenilor 17, Chișinău" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-center pb-4">
          <span className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            📍 {isRu ? 'Открыть в Google Maps' : 'Deschide în Google Maps'}
          </span>
        </div>
      </a>
    </div>
  );
}
