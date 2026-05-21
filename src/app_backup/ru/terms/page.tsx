import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "Условия и положения",
  description:
    "Условия и положения использования сайта Western Import. Информация о заказах, оплате, доставке, возврате и правах потребителя.",
};

export default function TermsRuPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: "Условия и положения" }]} />

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Условия и положения
            </h1>
            <div className="w-16 h-1 bg-primary rounded-full mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
              Последнее обновление: 20 мая 2026 г.
            </p>

            {/* 1. Общие положения */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                1. Общие положения
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Настоящий документ устанавливает условия и положения использования сайта
                westernimport.md (далее — «Сайт»), принадлежащего SRL Western Import,
                зарегистрированной в Кишинёве, Республика Молдова, CIF/IDNO 1022600012345,
                юридический адрес: ул. Штефан чел Маре 1, Кишинёв.
              </p>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Доступ и использование Сайта подразумевают полное согласие с настоящим документом.
                Western Import оставляет за собой право изменять эти условия в любое время.
                Изменения вступают в силу с даты их публикации на Сайте.
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Минимальный возраст для совершения покупок — 18 лет. Несовершеннолетние пользователи
                могут использовать Сайт только под наблюдением и с согласия родителей или законных
                представителей.
              </p>
            </section>

            {/* 2. Аккаунты */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                2. Учётные записи пользователей
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Для оформления заказов на Сайте пользователь должен создать учётную запись,
                предоставив достоверные и полные персональные данные: полное имя, адрес электронной
                почты, номер телефона и адрес доставки.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-3">
                <li>Пользователь несёт sole ответственность за сохранение конфиденциальности данных аутентификации.</li>
                <li>Любая активность из учётной записи считается совершённой её владельцем.</li>
                <li>Western Import оставляет за собой право приостанавливать или удалять аккаунты, нарушающие данные условия.</li>
                <li>Персональные данные обрабатываются в соответствии с Политикой конфиденциальности.</li>
              </ul>
            </section>

            {/* 3. Товары и цены */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                3. Товары и цены
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Цены на Сайте указаны в молдавских леях (MDL) и включают НДС. Western Import
                прилагает разумные усилия для поддержания актуальных цен, однако возможны
                единичные ошибки.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-3">
                <li>В случае явной ошибки в цене Western Import может отменить заказ и уведомить клиента в течение 24 часов.</li>
                <li>Фотографии товаров носят информационный характер; оттенки цвета могут отличаться от реального товара.</li>
                <li>Наличие обновляется в реальном времени. Если заказанный товар недоступен, клиент будет уведомлён.</li>
                <li>Акции действительны в указанный период и не суммируются, если не указано иное.</li>
              </ul>
            </section>

            {/* 4. Заказы */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                4. Процесс заказа
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Оформление заказа на Сайте включает следующие шаги: выбор товаров, добавление
                в корзину, заполнение данных доставки, выбор способа оплаты и подтверждение заказа.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-3">
                <li>После подтверждения клиент получает электронное письмо с деталями заказа.</li>
                <li>Заказ становится окончательным после подтверждения Western Import и обработки оплаты.</li>
                <li>Western Import может отказать в заказе при подозрении на мошенничество.</li>
                <li>Клиент может отменить заказ бесплатно до отправки товара.</li>
              </ul>
            </section>

            {/* 5. Оплата */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                5. Способы оплаты
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Western Import принимает следующие способы оплаты:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-3">
                <li><strong>Наличные при получении</strong> — оплата курьеру при получении посылки.</li>
                <li><strong>Банковская карта онлайн</strong> — Visa, MasterCard, безопасная обработка.</li>
                <li><strong>Банковский перевод</strong> — реквизиты отправляются по электронной почте после подтверждения.</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400">
                Онлайн-платежи обрабатываются через безопасные соединения (SSL/TLS). Данные банковской
                карты не хранятся на наших серверах.
              </p>
            </section>

            {/* 6. Доставка */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                6. Доставка
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Подробная информация о способах и сроках доставки доступна на странице{" "}
                <Link href="/shipping" className="text-primary hover:underline">
                  Доставка и возврат
                </Link>.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li>Риск переходит к клиенту в момент передачи товара курьеру.</li>
                <li>Клиент обязан проверить целостность посылки при получении.</li>
                <li>Доставка осуществляется только на территории Республики Молдова.</li>
              </ul>
            </section>

            {/* 7. Возврат */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                7. Возврат и возмещение
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Согласно законодательству Республики Молдова, клиент имеет право вернуть товар в
                течение 14 календарных дней с момента получения без объяснения причин, при условии,
                что товар находится в оригинальном состоянии, не использовался и в неповреждённой упаковке.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-3">
                <li>Расходы на возврат несёт клиент, за исключением дефектных товаров.</li>
                <li>Возмещение осуществляется в течение 14 рабочих дней с момента получения возвращённого товара.</li>
                <li>Персонализированные или вскрытые запечатанные товары не подлежат возврату.</li>
              </ul>
            </section>

            {/* 8. Интеллектуальная собственность */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                8. Интеллектуальная собственность
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Всё содержимое Сайта — включая тексты, изображения, логотипы, графические элементы,
                программный код — является собственностью Western Import или её лицензиаров и
                защищено законодательством об авторском праве.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li>Воспроизведение, распространение или использование контента без письменного согласия запрещено.</li>
                <li>Название «Western Import», логотип и слоганы являются торговыми марками компании.</li>
              </ul>
            </section>

            {/* 9. Ограничение ответственности */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                9. Ограничение ответственности
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Western Import прилагает разумные усилия для обеспечения точности информации на
                Сайте, но не даёт явных или подразумеваемых гарантий относительно:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-3">
                <li>Непрерывной доступности Сайта.</li>
                <li>Отсутствия ошибок или вирусов.</li>
                <li>Совместимости Сайта с любым устройством или браузером.</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400">
                Общая ответственность Western Import перед клиентом не превышает стоимость
                соответствующего заказа.
              </p>
            </section>

            {/* 10. Применимое право */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                10. Применимое право и юрисдикция
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Настоящий документ регулируется законодательством Республики Молдова. Любые споры
                решаются в досудебном порядке, а при невозможности — в компетентных судах Кишинёва.
              </p>
            </section>

            {/* 11. Контакты */}
            <section className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                11. Контакты
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li><strong>Электронная почта:</strong> info@westernimport.md</li>
                <li><strong>Телефон:</strong> +373 69 466 585</li>
                <li><strong>Адрес:</strong> ул. Штефан чел Маре 1, Кишинёв, Республика Молдова</li>
                <li><strong>График работы:</strong> Понедельник–Пятница: 09:00–18:00, Суббота: 10:00–15:00</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
