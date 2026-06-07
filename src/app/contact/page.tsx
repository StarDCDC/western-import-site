import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContactForm from '@/components/contact/ContactForm';
import ContactInfo from '@/components/contact/ContactInfo';

export const metadata: Metadata = {
  title: 'Contact — Western Import',
  description: 'Contactează-ne pentru orice întrebare sau comandă.',
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">
              Contactează-ne
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto">
              Ai o întrebare despre un produs sau vrei să faci o comandă? Scrie-ne și te vom contacta cât mai curând.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <ContactInfo locale="ro" />
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
