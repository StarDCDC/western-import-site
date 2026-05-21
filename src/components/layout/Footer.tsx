// src/components/layout/Footer.tsx
'use client';

import Link from 'next/link';
import { Send, MapPin, Phone, Mail } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageProvider';
import LiveVisitorsCounter from '@/components/ui/LiveVisitorsCounter';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-topbar text-slate-400 mt-10">
      <div className="max-w-[1280px] mx-auto px-5 pt-12 pb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pb-10">
          {/* About */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img 
                src="/logo.jpg" 
                alt="Western Import" 
                className="h-[42px] w-auto" 
              />
              <span className="text-white text-base font-bold">Western Import</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Laptopuri, telefoane și electronică premium la prețuri accesibile. Garanție reală și livrare în toată Moldova.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
              </a>
              <a href="https://t.me/westernimport" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4">Companie</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm hover:text-white transition-colors">Despre Noi</Link></li>
              <li><Link href="/contact" className="text-sm hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/blog" className="text-sm hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/terms" className="text-sm hover:text-white transition-colors">Termeni și Condiții</Link></li>
              <li><Link href="/privacy" className="text-sm hover:text-white transition-colors">Confidențialitate</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4">Asistență</h4>
            <ul className="space-y-2">
              <li><Link href="/shipping" className="text-sm hover:text-white transition-colors">Livrare și Returnare</Link></li>
              <li><Link href="/warranty" className="text-sm hover:text-white transition-colors">Garanție</Link></li>
              <li><Link href="/cookies" className="text-sm hover:text-white transition-colors">Politica Cookies</Link></li>
              <li><Link href="/favorites" className="text-sm hover:text-white transition-colors">Favorite</Link></li>
              <li><Link href="/compare" className="text-sm hover:text-white transition-colors">Comparare</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4">Categorii</h4>
            <ul className="space-y-2">
              <li><Link href="/catalog?category=laptopuri" className="text-sm hover:text-white transition-colors">Laptopuri</Link></li>
              <li><Link href="/catalog?category=telefoane" className="text-sm hover:text-white transition-colors">Telefoane</Link></li>
              <li><Link href="/catalog?category=pc-monitoare" className="text-sm hover:text-white transition-colors">PC & Monitoare</Link></li>
              <li><Link href="/catalog?category=tablete" className="text-sm hover:text-white transition-colors">Tablete</Link></li>
              <li><Link href="/catalog?category=componente" className="text-sm hover:text-white transition-colors">Componente</Link></li>
              <li><Link href="/catalog?category=accesorii" className="text-sm hover:text-white transition-colors">Accesorii</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4">Contact</h4>
            <div className="space-y-2.5 text-sm">
              <a href="tel:+37369466585" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" /> +373 69 466 585
              </a>
              <a href="mailto:info@westernimport.md" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" /> info@westernimport.md
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" /> Chișinău, Moldova
              </div>
            </div>
            <h4 className="text-white text-sm font-bold mt-5 mb-3">Metode de plată</h4>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300">Visa</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300">MasterCard</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300">Maestro</span>
            </div>
          </div>

          {/* Map */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4">Locația</h4>
            <div className="rounded-2xl overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2712.5!2d28.85!3d47.01!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40c97d115e5c49d5%3A0x2f0e2b0e1ae6f12e!2sStrada%20Podgorenilor%2017%2C%20Chi%C8%99in%C4%83u%2C%20Moldova!5e0!3m2!1sro!2smd!4v1"
                width="100%"
                height="140"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
                title="Locația Western Import"
              />
            </div>
            <div className="mt-3 text-sm space-y-1">
              <p className="text-slate-400 font-semibold">Program de lucru</p>
              <p className="text-slate-500">🕐 Luni-Vineri: 09:00 - 18:00</p>
              <p className="text-slate-500">🕐 Sâmbătă: 10:00 - 16:00</p>
              <p className="text-red-400 font-medium">Duminică: ÎNCHIS</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Western Import. Toate drepturile rezervate.</span>
          <LiveVisitorsCounter />
        </div>
      </div>
    </footer>
  );
}
