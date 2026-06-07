'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/ui/LanguageProvider';

interface ContactFormProps {
  phone?: string;
  email?: string;
  address?: string;
}

export default function ContactForm({ phone, email, address }: ContactFormProps) {
  const { t, locale } = useLanguage();
  const ru = locale === 'ru';
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || 'Eroare la trimitere');
      }
    } catch {
      setError('Eroare la conexiune');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 5" /></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          {ru ? 'Сообщение отправлено!' : 'Mesaj trimis cu succes!'}
        </h3>
        <p className="text-slate-500">{ru ? 'Мы свяжемся с вами в ближайшее время.' : 'Vă vom contacta în cel mai scurt timp.'}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          required
          placeholder={ru ? 'Имя' : 'Nume'}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[var(--color-dark-elevated)] text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[var(--color-dark-elevated)] text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        />
      </div>
      <input
        placeholder={ru ? 'Телефон' : 'Telefon'}
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[var(--color-dark-elevated)] text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
      />
      <input
        placeholder={ru ? 'Тема' : 'Subiect'}
        value={form.subject}
        onChange={(e) => setForm({ ...form, subject: e.target.value })}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[var(--color-dark-elevated)] text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
      />
      <textarea
        required
        rows={5}
        placeholder={ru ? 'Сообщение' : 'Mesajul tău'}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[var(--color-dark-elevated)] text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
      />
      <button
        type="submit"
        disabled={sending}
        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
      >
        {sending ? (ru ? 'Отправка...' : 'Se trimite...') : (ru ? 'Отправить' : 'Trimite mesajul')}
      </button>
    </form>
  );
}
