// src/app/contact/page.tsx
'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="max-w-[1280px] mx-auto px-5 py-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Contact</h1>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-2 mb-5">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Trimite un mesaj</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Nume *</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:border-primary"
                      placeholder="Numele tău"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:border-primary"
                      placeholder="email@exemplu.md"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Telefon</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:border-primary"
                      placeholder="+373 69 000 000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Subiect *</label>
                    <input
                      required
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:border-primary"
                      placeholder="Despre ce e vorba?"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Mesaj *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:border-primary resize-none"
                    placeholder="Scrie mesajul tău aici..."
                  />
                </div>
                <button type="submit" className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2">
                  <Send className="w-4 h-4" /> Trimite mesajul
                </button>
                {sent && <p className="text-green-600 text-sm font-medium">✓ Mesajul a fost trimis cu succes!</p>}
              </form>
            </motion.div>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Informații Contact</h3>
                <div className="space-y-4">
                  <a href="tel:+37369466585" className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">+373 69 466 585</div>
                      <div className="text-xs text-slate-400">Luni - Sâmbătă, 10:00 - 18:00</div>
                    </div>
                  </a>
                  <a href="mailto:info@westernimport.md" className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">info@westernimport.md</div>
                      <div className="text-xs text-slate-400">Răspundem în 24h</div>
                    </div>
                  </a>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Chișinău, Moldova</div>
                      <div className="text-xs text-slate-400">Strada Podgorenilor 17</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Program Magazin</h3>
                <div className="space-y-2 text-sm">
                  {[
                    ['Luni', '10:00 - 18:00'],
                    ['Marți', '10:00 - 18:00'],
                    ['Miercuri', '10:00 - 18:00'],
                    ['Joi', '10:00 - 18:00'],
                    ['Vineri', '10:00 - 18:00'],
                    ['Sâmbătă', '10:00 - 18:00'],
                    ['Duminică', '10:00 - 16:00'],
                  ].map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="text-slate-500">{day}</span>
                      <span className={`font-medium ${hours === 'ÎNCHIS' ? 'text-accent' : 'text-slate-800 dark:text-white'}`}>{hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-white mb-3">Urmărește-ne</h3>
                <div className="flex gap-3">
                  <a href="https://facebook.com" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-sm font-medium">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Facebook
                  </a>
                  <a href="https://instagram.com" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-600 hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors text-sm font-medium">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg> Instagram
                  </a>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2712.5!2d28.85!3d47.01!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40c97d115e5c49d5%3A0x2f0e2b0e1ae6f12e!2sStrada%20Podgorenilor%2017%2C%20Chi%C8%99in%C4%83u%2C%20Moldova!5e0!3m2!1sro!2smd!4v1"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Locația Western Import"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
