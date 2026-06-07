import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getPageContent } from "@/lib/pages";
import { parseBlocks } from "@/lib/blocks";
import PageBlocks from "@/components/public/PageBlocks";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description:
    "Политика конфиденциальности Western Import. Информация о сборе, использовании и защите персональных данных в соответствии с GDPR.",
};

export const dynamic = "force-dynamic";

export default async function PrivacyRuPage() {
  const pageData = await getPageContent("privacy");

  if (pageData?.contentRu) {
    const content = pageData.contentRu;
    const isBlockContent = content.trim().startsWith('[');
    const blocks = isBlockContent ? parseBlocks(content) : [];

    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 dark:bg-[var(--color-dark-bg)]">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Breadcrumb items={[{ label: "Политика конфиденциальности" }]} />
            <div className="bg-white dark:bg-[var(--color-dark-surface)] rounded-2xl p-8 shadow-sm">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Политика конфиденциальности</h1>
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
          <Breadcrumb items={[{ label: "Политика конфиденциальности" }]} />

          <div className="bg-white dark:bg-[var(--color-dark-surface)] rounded-2xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Политика конфиденциальности
            </h1>
            <div className="w-16 h-1 bg-primary rounded-full mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
              Последнее обновление: 20 мая 2026 г.
            </p>

            {/* 1. Введение */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                1. Введение
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                SRL Western Import («мы», «наш») уважает конфиденциальность ваших персональных данных
                и обязуется их защищать. Настоящая Политика конфиденциальности объясняет, как мы
                собираем, используем, храним и защищаем персональную информацию при посещении сайта
                westernimport.md («Сайт») и при покупке товаров.
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Настоящая политика разработана в соответствии с Регламентом (ЕС) 2016/679 (GDPR),
                Законом Республики Молдова № 133 от 08.07.2011 о защите персональных данных и
                применимым законодательством.
              </p>
            </section>

            {/* 2. Собираемые данные */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                2. Какие персональные данные мы собираем
              </h2>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                2.1 Данные, предоставленные вами
              </h3>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4">
                <li><strong>Идентификационные данные:</strong> имя, фамилия</li>
                <li><strong>Контактные данные:</strong> адрес электронной почты, номер телефона</li>
                <li><strong>Адрес доставки:</strong> полный адрес (улица, номер, квартира, город, почтовый индекс)</li>
                <li><strong>Финансовые данные:</strong> платёжная информация (обрабатывается исключительно платёжными провайдерами)</li>
                <li><strong>Данные аккаунта:</strong> пароль (хранится в зашифрованном виде), настройки</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                2.2 Данные, собираемые автоматически
              </h3>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4">
                <li><strong>Технические данные:</strong> IP-адрес, тип браузера, операционная система</li>
                <li><strong>Данные навигации:</strong> посещённые страницы, время на сайте, источник трафика</li>
                <li><strong>Файлы cookie:</strong> см. раздел 6 (Политика cookie)</li>
              </ul>
            </section>

            {/* 3. Цель сбора */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                3. Цель сбора данных
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li><strong>Обработка заказов:</strong> управление, отправка и доставка товаров.</li>
                <li><strong>Коммуникация:</strong> подтверждения заказов, уведомления о доставке.</li>
                <li><strong>Управление аккаунтом:</strong> история заказов, избранное, настройки.</li>
                <li><strong>Поддержка клиентов:</strong> ответы на вопросы, обработка жалоб и возвратов.</li>
                <li><strong>Маркетинг:</strong> рассылка новостей и персонализированных предложений только с вашего согласия.</li>
                <li><strong>Анализ и улучшение:</strong> понимание использования Сайта для улучшения опыта.</li>
                <li><strong>Безопасность:</strong> предотвращение мошенничества и защита Сайта.</li>
                <li><strong>Соблюдение законодательства:</strong> выполнение налоговых и бухгалтерских обязательств.</li>
              </ul>
            </section>

            {/* 4. Правовые основания */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                4. Правовые основания обработки
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li><strong>Исполнение договора</strong> — обработка заказов и доставка товаров (ст. 6(1)(b) GDPR).</li>
                <li><strong>Согласие</strong> — рассылка, маркетинговые cookie (ст. 6(1)(a) GDPR).</li>
                <li><strong>Законный интерес</strong> — анализ трафика, предотвращение мошенничества (ст. 6(1)(f) GDPR).</li>
                <li><strong>Правовое обязательство</strong> — выставление счетов, ведение бухгалтерии (ст. 6(1)(c) GDPR).</li>
              </ul>
            </section>

            {/* 5. Ваши права */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                5. Ваши права
              </h2>
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-[var(--color-dark-elevated)] rounded-lg">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Право доступа</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Вы можете запросить копию персональных данных, которые мы о вас храним.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[var(--color-dark-elevated)] rounded-lg">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Право на исправление</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Вы можете запросить исправление неточных или дополнение неполных данных.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[var(--color-dark-elevated)] rounded-lg">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Право на удаление («право быть забытым»)</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Вы можете запросить удаление персональных данных, за исключением случаев, предусмотренных законом.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[var(--color-dark-elevated)] rounded-lg">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Право на переносимость</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Вы можете запросить экспорт данных в структурированном, машиночитаемом формате.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[var(--color-dark-elevated)] rounded-lg">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Право отозвать согласие</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Вы можете отозвать согласие в любое время без влияния на законность предыдущей обработки.
                  </p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-4">
                Для реализации прав свяжитесь с нами: <strong>privacy@westernimport.md</strong>.
                Ответ в течение 30 дней. Вы также имеете право подать жалобу в Национальный орган
                по защите персональных данных Республики Молдова.
              </p>
            </section>

            {/* 6. Cookies */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                6. Файлы cookie
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Сайт использует файлы cookie для улучшения навигации, анализа трафика и отображения
                персонализированного контента. Подробности доступны в{" "}
                <a href="/cookies" className="text-primary hover:underline">Политике cookie</a>.
              </p>
            </section>

            {/* 7. Получатели */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                7. С кем мы делимся данными
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li><strong>Службы доставки</strong> — только данные, необходимые для доставки.</li>
                <li><strong>Платёжные процессоры</strong> — для безопасной обработки транзакций.</li>
                <li><strong>Инструменты аналитики</strong> — Google Analytics (анонимизированные данные).</li>
                <li><strong>Государственные органы</strong> — только в случаях, предусмотренных законом.</li>
              </ul>
            </section>

            {/* 8. Хранение и безопасность */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                8. Хранение и защита данных
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li>Шифрование соединений через SSL/TLS (HTTPS).</li>
                <li>Пароли хранятся в хешированном виде (bcrypt).</li>
                <li>Ограниченный доступ к персональным данным — только авторизованный персонал.</li>
                <li>Ежедневное зашифрованное резервное копирование.</li>
                <li>Периодический аудит безопасности.</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400 mt-3">
                Мы храним персональные данные столько, сколько необходимо для целей сбора или
                сколько требует законодательство (например, финансовые данные — минимум 5 лет).
              </p>
            </section>

            {/* 9. DPO */}
            <section className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                9. Ответственный за защиту данных (DPO)
              </h2>
              <div className="p-4 bg-slate-50 dark:bg-[var(--color-dark-elevated)] rounded-lg">
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>Электронная почта:</strong> privacy@westernimport.md<br />
                  <strong>Телефон:</strong> +373 69 466 585<br />
                  <strong>Адрес:</strong> SRL Western Import, ул. Штефан чел Маре 1, MD-2001, Кишинёв, Республика Молдова
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
