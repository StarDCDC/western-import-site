import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getPageContent } from "@/lib/pages";
import { parseBlocks } from "@/lib/blocks";
import PageBlocks from "@/components/public/PageBlocks";
import { ShieldCheck, Clock, Wrench, Phone, AlertTriangle, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Гарантия",
  description:
    "Гарантийная политика Western Import. Сроки гарантии, покрытие, процедура сервиса и контакты.",
  alternates: {
    canonical: "/ru/warranty",
  },
  openGraph: {
    title: "Гарантия — Western Import",
    description: "Гарантийная политика Western Import.",
  },
};

export const dynamic = "force-dynamic";

export default async function WarrantyRuPage() {
  const pageData = await getPageContent("warranty");

  if (pageData?.contentRu) {
    const content = pageData.contentRu;
    const isBlockContent = content.trim().startsWith('[');
    const blocks = isBlockContent ? parseBlocks(content) : [];

    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 dark:bg-[var(--color-dark-bg)]">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Breadcrumb items={[{ label: "Гарантия" }]} />
            <div className="bg-white dark:bg-[var(--color-dark-surface)] rounded-2xl p-8 shadow-sm">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Гарантия</h1>
              <div className="w-16 h-1 bg-primary rounded-full mb-8" />
              {isBlockContent ? (
                <PageBlocks blocks={blocks} />
              ) : (
                <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
              )}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 dark:bg-[var(--color-dark-bg)]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: "Гарантия" }]} />

          <div className="bg-white dark:bg-[var(--color-dark-surface)] rounded-2xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Гарантия
            </h1>
            <div className="w-16 h-1 bg-primary rounded-full mb-8" />

            {/* Карточки сроков */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <div className="p-6 bg-gradient-to-br from-primary/10 to-blue-500/5 dark:from-primary/20 dark:to-blue-500/10 rounded-xl border border-primary/20">
                <ShieldCheck className="text-primary mb-3" size={32} />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Новые товары</h3>
                <p className="text-3xl font-extrabold text-primary">12 месяцев</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Полная гарантия на все новые товары, приобретённые в Western Import.
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 rounded-xl border border-slate-200 dark:border-white/[0.06]">
                <Clock className="text-slate-600 dark:text-slate-400 mb-3" size={32} />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Восстановленные товары</h3>
                <p className="text-3xl font-extrabold text-slate-600 dark:text-slate-400">6 месяцев</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Гарантия на восстановленные/протестированные товары, покрывающая основные технические неисправности.
                </p>
              </div>
            </div>

            {/* Что покрывает */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" /> Что покрывает гарантия
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Производственные дефекты аппаратных компонентов",
                  "Проблемы работы, возникшие при нормальной эксплуатации",
                  "Дефекты экрана (битые пиксели по гарантии, линии, пятна)",
                  "Проблемы питания или зарядки, не связанные с износом",
                  "Дефекты портов и разъёмов",
                  "Проблемы предустановленного ПО (ОС, драйверы)",
                  "Дефекты клавиатуры и тачпада",
                  "Дефекты динамиков, микрофона или веб-камеры",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Что НЕ покрывает */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-amber-500" /> Что НЕ покрывает гарантия
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Повреждения от падений, ударов или попадания жидкости",
                  "Преднамеренные повреждения или несанкционированные модификации",
                  "Использование товара вне указанных технических параметров",
                  "Аккумуляторы с пониженной ёмкостью вследствие нормального износа",
                  "Расходные аксессуары (чехлы, кабели, зарядные устройства не из оригинального комплекта)",
                  "Проблемы ПО, вызванные установкой программ сторонними разработчиками",
                  "Неисправности, вызванные вирусами или вредоносным ПО",
                  "Эстетические повреждения (царапины, вмятины), не влияющие на работоспособность",
                  "Ремонт, выполненный несанкционированными третьими лицами",
                  "Использование несовместимых аксессуаров",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                    <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Процедура сервиса */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Wrench size={20} className="text-primary" /> Процедура сервиса
              </h2>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: "Свяжитесь с нами",
                    desc: "Позвоните по номеру +373 69 466 585 или напишите на info@westernimport.md. Опишите проблему и укажите номер заказа.",
                  },
                  {
                    step: 2,
                    title: "Диагностика",
                    desc: "Наша команда оценит проблему и подтвердит, покрывается ли она гарантией. Мы сообщим вам ориентировочные сроки.",
                  },
                  {
                    step: 3,
                    title: "Передача товара",
                    desc: "Принесите товар в наш магазин по адресу ул. Подгорений 17, Кишинёв, или закажите вывоз курьером (бесплатно по гарантии).",
                  },
                  {
                    step: 4,
                    title: "Ремонт или замена",
                    desc: "Срок ремонта: 5–15 рабочих дней. Если товар не подлежит ремонту, мы предложим замену или возврат средств.",
                  },
                  {
                    step: 5,
                    title: "Возврат товара",
                    desc: "Мы сообщим вам, когда товар будет готов, и согласуем способ возврата. Самовывоз или доставка курьером.",
                  },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Условия гарантии */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Условия гарантии
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li>Гарантия начинается с даты покупки согласно счёту-фактуре.</li>
                <li>Оригинальный счёт или подтверждение покупки обязательны.</li>
                <li>Ремонт не продлевает гарантийный срок.</li>
                <li>Заменённые детали и компоненты переходят в собственность Western Import.</li>
                <li>Western Import не несёт ответственности за потерю данных. Сделайте резервную копию перед передачей товара.</li>
                <li>Если диагностика выявит проблему, не покрываемую гарантией, стоимость диагностики составляет 300 MDL.</li>
              </ul>
            </section>

            {/* Контакты сервиса */}
            <section className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Phone size={20} className="text-primary" /> Контакты сервиса
              </h2>
              <div className="p-5 bg-slate-50 dark:bg-[var(--color-dark-elevated)] rounded-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600 dark:text-slate-400 text-sm">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Телефон сервиса</p>
                    <p>+373 69 466 585</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Email сервиса</p>
                    <p>service@westernimport.md</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Адрес</p>
                    <p>ул. Подгорений 17, Кишинёв</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Часы работы</p>
                    <p>Понедельник–Пятница: 09:00–18:00</p>
                    <p>Суббота: 10:00–15:00</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
