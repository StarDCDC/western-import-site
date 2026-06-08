'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContactForm from '@/components/contact/ContactForm';
import ContactInfo from '@/components/contact/ContactInfo';
import { useLanguage } from '@/components/ui/LanguageProvider';

export default function ContactPage() {
  const { locale } = useLanguage();
  const isRu = locale === 'ru';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--color-light-bg)] dark:bg-[var(--color-dark-bg)] py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">
              {isRu ? 'Свяжитесь с нами' : 'Contactează-ne'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              {isRu
                ? 'Есть вопрос о товаре или хотите сделать заказ? Напишите нам, и мы свяжемся с вами как можно скорее.'
                : 'Ai o întrebare despre un produs sau vrei să faci o comandă? Scrie-ne și te vom contacta cât mai curând.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <ContactInfo locale={locale} />
            </div>
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-2xl p-6 border border-black/[0.04] dark:border-white/[0.06]">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
