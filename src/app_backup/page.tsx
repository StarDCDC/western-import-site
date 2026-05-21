// src/app/page.tsx
'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategorySlider from '@/components/home/CategorySlider';
import ProductGrid from '@/components/home/ProductGrid';
import BrandCarousel from '@/components/home/BrandCarousel';
import RecentlyViewed from '@/components/home/RecentlyViewed';
import FlashSaleCountdown from '@/components/home/FlashSaleCountdown';
import { motion } from 'framer-motion';
import { Truck, Shield, Zap, Headphones, Mail } from 'lucide-react';
import { subscribeNewsletter } from '@/lib/api';

const features = [
  { icon: <Truck className="w-7 h-7" />, title: 'Transport Gratuit', desc: 'Livrare gratuită în toată Moldova pentru comenzi peste 3000 MDL' },
  { icon: <Shield className="w-7 h-7" />, title: 'Garanție Reală', desc: 'Toate produsele au garanție de la 3 la 24 luni' },
  { icon: <Zap className="w-7 h-7" />, title: 'Livrare Rapidă', desc: 'Livrare în 24-48 ore în Chișinău și 2-5 zile în raioane' },
  { icon: <Headphones className="w-7 h-7" />, title: 'Suport 24/7', desc: 'Echipa noastră te ajută cu orice întrebare sau problemă' },
];

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subError, setSubError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubError('');
    const ok = await subscribeNewsletter(email);
    if (ok) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    } else {
      setSubError('Nu am putut abona. Încearcă din nou.');
      setTimeout(() => setSubError(''), 3000);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <HeroSection />
        <CategorySlider />
        <ProductGrid />
        <FlashSaleCountdown />
        <RecentlyViewed />
        <BrandCarousel />

        {/* Why Us */}
        <section className="py-12">
          <div className="max-w-[1280px] mx-auto px-5">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white text-center mb-8">De ce Western Import?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center text-primary">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-12 bg-gradient-to-br from-primary-dark to-primary text-white">
          <div className="max-w-[1280px] mx-auto px-5 text-center">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-xl md:text-2xl font-bold mb-2">Abonează-te la Newsletter</h2>
            <p className="text-sm opacity-80 mb-6 max-w-md mx-auto">Primește cele mai noi oferte și promoții direct pe email. Fii primul care află!</p>
            <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md mx-auto flex-col sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Adresa ta de email"
                required
                className="flex-1 px-4 py-3 rounded-xl bg-white/15 border border-white/30 text-white placeholder:text-white/60 text-sm focus:outline-none focus:border-white/60"
              />
              <button type="submit" className="px-6 py-3 bg-white text-primary-dark rounded-xl font-semibold text-sm hover:bg-slate-100 transition-colors shrink-0">
                {subscribed ? '✓ Abonat!' : 'Abonează-te'}
              </button>
            </form>
            {subError && <p className="text-sm mt-2 text-red-200">{subError}</p>}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
