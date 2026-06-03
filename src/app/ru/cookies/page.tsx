import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getPageContent } from "@/lib/pages";
import { parseBlocks } from "@/lib/blocks";
import PageBlocks from "@/components/public/PageBlocks";

export const metadata: Metadata = {
  title: "Политика Cookie",
  description:
    "Политика cookie Western Import. Информация о типах используемых файлов cookie, их назначении и управлении.",
  alternates: {
    canonical: "/ru/cookies",
  },
  openGraph: {
    title: "Политика Cookie — Western Import",
    description: "Политика cookie Western Import.",
  },
};

export default async function CookiesRuPage() {
  const pageData = await getPageContent("cookies");

  if (pageData?.contentRu) {
    const content = pageData.contentRu;
    const isBlockContent = content.trim().startsWith('[');
    const blocks = isBlockContent ? parseBlocks(content) : [];

    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Breadcrumb items={[{ label: "Политика Cookies" }]} />
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Политика Cookies</h1>
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
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: "Политика Cookie" }]} />

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Политика Cookie
            </h1>
            <div className="w-16 h-1 bg-primary rounded-full mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
              Последнее обновление: 20 мая 2026
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                1. Что такое файлы cookie?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Файлы cookie — это небольшие текстовые файлы, сохраняемые на вашем устройстве
                (компьютер, планшет, телефон) при посещении веб-сайта. Они позволяют сайту
                распознавать ваше устройство и сохранять информацию о предыдущих посещениях
                (например, языковые предпочтения или товары в корзине).
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Эта политика объясняет типы файлов cookie, используемых на westernimport.md,
                их назначение и способы управления ими.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                2. Типы используемых файлов cookie
              </h2>

              <div className="mb-6 p-5 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    🟢 Строго необходимые cookie
                  </h3>
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                    Всегда активны
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-3">
                  Эти файлы cookie необходимы для работы сайта и не могут быть отключены.
                  Они устанавливаются только в ответ на ваши действия (авторизация, добавление
                  в корзину, настройки безопасности).
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2 pr-4 text-slate-700 dark:text-slate-300 font-semibold">Cookie</th>
                        <th className="py-2 pr-4 text-slate-700 dark:text-slate-300 font-semibold">Назначение</th>
                        <th className="py-2 text-slate-700 dark:text-slate-300 font-semibold">Срок</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600 dark:text-slate-400">
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-4 font-mono text-xs">session_id</td>
                        <td className="py-2 pr-4">Поддерживает сеанс авторизации</td>
                        <td className="py-2">Сеанс</td>
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-4 font-mono text-xs">cart</td>
                        <td className="py-2 pr-4">Сохраняет товары в корзине</td>
                        <td className="py-2">30 дней</td>
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-4 font-mono text-xs">csrf_token</td>
                        <td className="py-2 pr-4">Защищает от CSRF-атак</td>
                        <td className="py-2">Сеанс</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">theme</td>
                        <td className="py-2 pr-4">Запоминает тему (светлая/тёмная)</td>
                        <td className="py-2">1 год</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-6 p-5 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    🔵 Функциональные cookie
                  </h3>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
                    Необязательные
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-3">
                  Эти файлы cookie обеспечивают расширенные функции и персонализацию, такие как
                  сохранение выбранного языка, региона или предпочтений отображения.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2 pr-4 text-slate-700 dark:text-slate-300 font-semibold">Cookie</th>
                        <th className="py-2 pr-4 text-slate-700 dark:text-slate-300 font-semibold">Назначение</th>
                        <th className="py-2 text-slate-700 dark:text-slate-300 font-semibold">Срок</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600 dark:text-slate-400">
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-4 font-mono text-xs">lang</td>
                        <td className="py-2 pr-4">Сохраняет выбранный язык</td>
                        <td className="py-2">1 год</td>
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-4 font-mono text-xs">recently_viewed</td>
                        <td className="py-2 pr-4">Показывает недавно просмотренные товары</td>
                        <td className="py-2">30 дней</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">wishlist</td>
                        <td className="py-2 pr-4">Сохраняет избранные товары</td>
                        <td className="py-2">1 год</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-6 p-5 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    🟡 Аналитические cookie
                  </h3>
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full">
                    Необязательные
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-3">
                  Эти файлы cookie помогают нам понять, как посетители взаимодействуют с сайтом,
                  собирая анонимную информацию: просмотренные страницы, время на сайте, источник трафика.
                  Мы используем Google Analytics с анонимизацией IP.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2 pr-4 text-slate-700 dark:text-slate-300 font-semibold">Cookie</th>
                        <th className="py-2 pr-4 text-slate-700 dark:text-slate-300 font-semibold">Назначение</th>
                        <th className="py-2 text-slate-700 dark:text-slate-300 font-semibold">Срок</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600 dark:text-slate-400">
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-4 font-mono text-xs">_ga</td>
                        <td className="py-2 pr-4">Идентифицирует уникальных посетителей (анонимно)</td>
                        <td className="py-2">2 года</td>
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-4 font-mono text-xs">_ga_*</td>
                        <td className="py-2 pr-4">Поддерживает состояние сеанса аналитики</td>
                        <td className="py-2">2 года</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">_gid</td>
                        <td className="py-2 pr-4">Различает посетителей в разных сеансах</td>
                        <td className="py-2">24 часа</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    🟠 Маркетинговые cookie
                  </h3>
                  <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full">
                    Необязательные
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-3">
                  Эти файлы cookie используются для показа релевантной рекламы на других сайтах
                  и измерения эффективности наших маркетинговых кампаний.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2 pr-4 text-slate-700 dark:text-slate-300 font-semibold">Cookie</th>
                        <th className="py-2 pr-4 text-slate-700 dark:text-slate-300 font-semibold">Назначение</th>
                        <th className="py-2 text-slate-700 dark:text-slate-300 font-semibold">Срок</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600 dark:text-slate-400">
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-4 font-mono text-xs">_fbp</td>
                        <td className="py-2 pr-4">Пиксель Facebook — ремаркетинг</td>
                        <td className="py-2">3 месяца</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">_gcl_au</td>
                        <td className="py-2 pr-4">Google Ads — конверсии</td>
                        <td className="py-2">3 месяца</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                3. Как управлять файлами cookie
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Вы можете контролировать и управлять файлами cookie несколькими способами. Обратите внимание,
                что отключение некоторых файлов cookie может повлиять на функциональность сайта.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4">
                <li><strong>Баннер cookie</strong> — при первом посещении вы можете выбрать категории cookie.</li>
                <li><strong>Настройки браузера</strong> — большинство браузеров позволяют блокировать или удалять cookie.</li>
                <li><strong>Google Analytics Opt-out</strong> — установите официальный плагин Google Analytics Opt-out.</li>
                <li><strong>Network Advertising Initiative</strong> — отказ от маркетинговых cookie на networkadvertising.org/choices.</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                Инструкции для браузеров:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Google Chrome</p>
                  <p className="text-slate-600 dark:text-slate-400">Настройки → Конфиденциальность → Файлы cookie</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Mozilla Firefox</p>
                  <p className="text-slate-600 dark:text-slate-400">Параметры → Конфиденциальность → Файлы cookie</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Safari</p>
                  <p className="text-slate-600 dark:text-slate-400">Настройки → Конфиденциальность → Файлы cookie</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Microsoft Edge</p>
                  <p className="text-slate-600 dark:text-slate-400">Настройки → Файлы cookie → Управление</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                4. Изменения политики
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Western Import оставляет за собой право обновлять эту политику в любое время. Мы
                уведомим о значительных изменениях через баннер cookie или по электронной почте.
                Рекомендуем периодически просматривать эту страницу.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                5. Контакты
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Вопросы об использовании файлов cookie:{" "}
                <strong>privacy@westernimport.md</strong> | <strong>+373 69 466 585</strong>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
