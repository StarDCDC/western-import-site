import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContactForm from '@/components/contact/ContactForm';
import ContactInfo from '@/components/contact/ContactInfo';
import LocaleSetter from '@/components/ui/LocaleSetter';

export const metadata: Metadata = {
  title: 'Контакты — Western Import',
  description: 'Свяжитесь с нами по любому вопросу или для заказа.',
};

export default function ContactRuPage() {
  return (
    <>
      <LocaleSetter locale="ru" />
      <Header />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">
              Свяжитесь с нами
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto">
              Есть вопрос о товаре или хотите сделать заказ? Напишите нам, и мы свяжемся с вами как можно скорее.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <ContactInfo locale="ru" />
            </div>
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
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
