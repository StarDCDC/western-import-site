// src/app/register/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { UserPlus, Mail, Lock, Eye, EyeOff, Phone, User } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [terms, setTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPass) {
      alert('Parolele nu coincid!');
      return;
    }
    alert('Înregistrare simulată — funcționalitatea va fi conectată la backend.');
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-screen flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto px-5"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <UserPlus className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Înregistrare</h1>
              <p className="text-sm text-slate-500 mt-1">Creează un cont nou Western Import</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nume complet</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ion Popescu"
                    className="w-full py-2.5 pl-10 pr-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplu.md"
                    className="w-full py-2.5 pl-10 pr-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Telefon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+373 69 000 000"
                    className="w-full py-2.5 pl-10 pr-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Parolă</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minim 8 caractere"
                    className="w-full py-2.5 pl-10 pr-10 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:border-primary"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Confirmă parola</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-2.5 pl-10 pr-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} required className="mt-1 rounded border-slate-300 text-primary" />
                <span className="text-xs text-slate-500">Sunt de acord cu <span className="text-primary">Termenii și Condițiile</span> și <span className="text-primary">Politica de Confidențialitate</span></span>
              </label>

              <button type="submit" disabled={!terms} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Creează cont
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-5">
              Ai deja cont?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Autentifică-te
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
