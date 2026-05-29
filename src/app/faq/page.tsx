'use client';

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  questionRu: string | null;
  answerRu: string | null;
  order: number;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { locale, t } = useLanguage();

  useEffect(() => {
    fetch("/api/faq")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setFaqs(json.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const title = locale === 'ru' ? 'Часто задаваемые вопросы' : 'Întrebări frecvente';
  const subtitle = locale === 'ru'
    ? 'Найдите ответы на самые распространенные вопросы ниже.'
    : 'Găsești răspunsuri la cele mai comune întrebări mai jos.';
  const noFaqs = locale === 'ru' ? 'Пока нет часто задаваемых вопросов.' : 'Momentan nu sunt întrebări frecvente.';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: locale === 'ru' ? 'FAQ' : 'FAQ' }]} />

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {title}
            </h1>
            <div className="w-16 h-1 bg-primary rounded-full mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              {subtitle}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent" />
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-lg">{noFaqs}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div
                  key={faq.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="font-medium text-slate-900 dark:text-white pr-4">{locale === 'ru' && faq.questionRu ? faq.questionRu : faq.question}</span>
                    <ChevronDown
                      size={20}
                      className={`text-slate-400 flex-shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openIndex === i && (
                    <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                      {locale === 'ru' && faq.answerRu ? faq.answerRu : faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
