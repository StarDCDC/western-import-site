import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getPageContent, getLocalizedContent } from "@/lib/pages";
import { Users, Target, Heart, Shield, Award, TrendingUp, Star, Package, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "О нас",
  description:
    "О Western Import — история, миссия, ценности и команда магазина премиальной электроники в Кишинёве.",
};

export default async function AboutRuPage() {
  const pageData = await getPageContent("about");

  // If DB has RU content, render it dynamically
  if (pageData?.contentRu) {
    const { title, content } = getLocalizedContent(pageData, 'ru');
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Breadcrumb items={[{ label: title }]} />
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{title}</h1>
              <div className="w-16 h-1 bg-primary rounded-full mb-8" />
              <div
                className="prose prose-slate dark:prose-invert max-w-none
                  prose-headings:text-slate-900 dark:prose-headings:text-white
                  prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-slate-600 dark:prose-p:text-slate-400
                  prose-a:text-primary hover:prose-a:underline
                  prose-strong:text-slate-800 dark:prose-strong:text-slate-200
                  prose-li:text-slate-600 dark:prose-li:text-slate-400
                  prose-ul:my-2 prose-ol:my-2"
                dangerouslySetInnerHTML={{ __html: content || "" }}
              />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Fallback: original hardcoded content
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: "О нас" }]} />

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              О Western Import
            </h1>
            <div className="w-16 h-1 bg-primary rounded-full mb-8" />

            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Star size={20} className="text-primary" /> Наша история
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Western Import родился в 2023 году из простого наблюдения: молдаване заслуживают
                доступа к качественной электронике по справедливым ценам, без компромиссов. Мы начали
                с маленького магазина на тихой улице в Кишинёве, с одним ноутбуком на столе и огромной
                решимостью.
              </p>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Почему «Western»? Потому что мы привозим товары с Запада — ноутбуки, телефоны,
                мониторы и комплектующие — тщательно отобранные, скрупулёзно протестированные и
                предлагаемые с реальной гарантией. Мы не продаём «наугад». Каждый товар проходит
                через наши руки, прежде чем попасть к вам.
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Сегодня, после 3 лет на рынке, мы гордимся каждым довольным клиентом. Мы не самый
                большой магазин в Молдове — и не стремимся им быть. Мы предпочитаем быть самыми
                надёжными.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Target size={20} className="text-primary" /> Миссия и ценности
              </h2>
              <div className="p-5 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 mb-6">
                <p className="text-slate-700 dark:text-slate-300 text-lg italic">
                  «Обеспечить каждому молдаванину доступ к качественной технологии по справедливой
                  цене, подкреплённой исключительной поддержкой клиентов.»
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Shield size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Добросовестность</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Что обещаем — то доставляем. Без скрытых сюрпризов, без манипулятивных цен.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <Award size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Качество</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Каждый товар проверяется перед продажей. Мы не идём на компромиссы.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <Heart size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Прозрачность</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Состояние товаров описано чётко. Мы знаем, что продаём и откуда это.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <Users size={20} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Сообщество</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Наши клиенты — соседи, друзья, коллеги. Мы относимся к ним соответственно.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" /> Western Import в цифрах
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Users size={28} className="text-primary mx-auto mb-2" />
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">1000+</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Довольных клиентов</p>
                </div>
                <div className="text-center p-5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Package size={28} className="text-primary mx-auto mb-2" />
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">500+</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Товаров в каталоге</p>
                </div>
                <div className="text-center p-5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Clock size={28} className="text-primary mx-auto mb-2" />
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">3</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Года на рынке</p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Почему Western Import?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Award size={24} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">Проверенное качество</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Каждый товар проходит индивидуальное тестирование нашими техниками. Мы открываем,
                    проверяем и только потом предлагаем клиентам.
                  </p>
                </div>
                <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
                    <TrendingUp size={24} className="text-green-500" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">Справедливые цены</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Мы ведём переговоры напрямую с поставщиками из ЕС и США. Без ненужных посредников,
                    без скрытых наценок. Цена, которую вы видите — лучшая, которую мы можем предложить.
                  </p>
                </div>
                <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                    <Shield size={24} className="text-blue-500" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">Реальная гарантия</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    12 месяцев для новых товаров, 6 месяцев для восстановленных. Мы не уклоняемся
                    от ответственности — у нас собственный сервис и мы отвечаем на звонки.
                  </p>
                </div>
                <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                    <Users size={24} className="text-purple-500" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">Выделенная поддержка</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Мы не анонимный магазин. Вы общаетесь с реальными людьми, которые знают товары
                    и помогут выбрать подходящее. Отвечаем максимум за 2 часа.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Users size={20} className="text-primary" /> Команда
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-400 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">
                    ВИ
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Виктор И.</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Основатель и CEO</p>
                </div>
                <div className="text-center p-5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">
                    АМ
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Андрей М.</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Главный техник</p>
                </div>
                <div className="text-center p-5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">
                    ЕС
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Елена К.</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Поддержка клиентов</p>
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
