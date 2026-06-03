import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getPageContent } from "@/lib/pages";
import { parseBlocks } from "@/lib/blocks";
import PageBlocks from "@/components/public/PageBlocks";
import { Truck, RotateCcw, Package, Clock, ShieldCheck, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Доставка и возврат",
  description:
    "Информация о доставке и возврате товаров Western Import. Курьер Кишинёв, доставка по стране, самовывоз.",
  alternates: {
    canonical: "/ru/shipping",
  },
  openGraph: {
    title: "Доставка и возврат — Western Import",
    description: "Информация о доставке и возврате товаров Western Import.",
  },
};

export default async function ShippingRuPage() {
  const pageData = await getPageContent("shipping");

  if (pageData?.contentRu) {
    const content = pageData.contentRu;
    const isBlockContent = content.trim().startsWith('[');
    const blocks = isBlockContent ? parseBlocks(content) : [];

    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Breadcrumb items={[{ label: "Доставка и возврат" }]} />
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Доставка и возврат</h1>
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
          <Breadcrumb items={[{ label: "Доставка и возврат" }]} />

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Доставка и возврат
            </h1>
            <div className="w-16 h-1 bg-primary rounded-full mb-8" />

            {/* Карточки доставки */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <Truck className="text-primary mb-3" size={28} />
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Курьер Кишинёв</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Бесплатно</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Доставка за 1–2 рабочих дня</p>
              </div>
              <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <Package className="text-primary mb-3" size={28} />
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Курьер по стране</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Бесплатно</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Доставка за 2–5 рабочих дней</p>
              </div>
              <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <MapPin className="text-primary mb-3" size={28} />
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Самовывоз</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Бесплатно</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">ул. Подгорений 17, Кишинёв</p>
              </div>
            </div>

            {/* Таблица стоимости доставки */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Truck size={20} className="text-primary" /> Таблица доставки
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800">
                      <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Метод</th>
                      <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Зона</th>
                      <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Стоимость</th>
                      <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Срок</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 dark:text-slate-400">
                    <tr className="border-t border-slate-200 dark:border-slate-700">
                      <td className="py-3 px-4">Курьер</td>
                      <td className="py-3 px-4">Кишинёв</td>
                      <td className="py-3 px-4">Бесплатно <span className="text-xs text-green-600 dark:text-green-400">(бесплатная доставка повсюду)</span></td>
                      <td className="py-3 px-4">1–2 дня</td>
                    </tr>
                    <tr className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <td className="py-3 px-4">Курьер</td>
                      <td className="py-3 px-4">Республика Молдова</td>
                      <td className="py-3 px-4">Бесплатно</td>
                      <td className="py-3 px-4">2–5 дней</td>
                    </tr>
                    <tr className="border-t border-slate-200 dark:border-slate-700">
                      <td className="py-3 px-4">Самовывоз</td>
                      <td className="py-3 px-4">Магазин Кишинёв</td>
                      <td className="py-3 px-4 text-green-600 dark:text-green-400 font-semibold">Бесплатно</td>
                      <td className="py-3 px-4">В тот же день*</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                * Самовывоз доступен после подтверждения заказа оператором (максимум 2 часа).
              </p>
            </section>

            {/* Детали доставки */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock size={20} className="text-primary" /> Детали доставки
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li>Заказы, оформленные до 14:00 (понедельник–пятница), отправляются в тот же день.</li>
                <li>Заказы, оформленные в пятницу после 14:00, в субботу или воскресенье, отправляются в понедельник.</li>
                <li>При доставке курьер ожидает максимум 15 минут. Перенос доставки стоит 100 MDL.</li>
                <li>Доставка <strong>бесплатная</strong> по всей Молдове, независимо от суммы заказа.</li>
                <li>Пожалуйста, проверьте посылку при получении. При обнаружении повреждений составьте акт с курьером.</li>
                <li>Доставка осуществляется только на территории Республики Молдова.</li>
              </ul>
            </section>

            {/* Возврат */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <RotateCcw size={20} className="text-primary" /> Возврат и возмещение
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Согласно законодательству Республики Молдова, вы имеете право вернуть товар в течение
                <strong> 14 календарных дней</strong> с момента получения посылки.
              </p>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                Условия возврата
              </h3>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4">
                <li>Товар должен быть в оригинальном состоянии, без использования и повреждений.</li>
                <li>Упаковка должна быть полной и неповреждённой, включая аксессуары и инструкции.</li>
                <li>В посылку необходимо вложить счёт-фактуру или подтверждение покупки.</li>
                <li>Товары с активированным ПО или созданными аккаунтами возврату не подлежат.</li>
                <li>Распакованные аксессуары (наушники, зарядные устройства и т.д.) не подлежат возврату по гигиеническим соображениям.</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                Процедура возврата
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4">
                <li>Свяжитесь с нами по телефону <strong>+373 69 466 585</strong> или по email <strong>info@westernimport.md</strong>, чтобы получить номер авторизации возврата (RMA).</li>
                <li>Подготовьте товар в оригинальной упаковке со всеми аксессуарами и счётом.</li>
                <li>Принесите товар в наш магазин или закажите вывоз курьером (стоимость: 150 MDL, оплачивается клиентом).</li>
                <li>После получения наша команда осмотрит товар в течение максимум 3 рабочих дней.</li>
                <li>Возмещение будет произведено тем же способом оплаты, который использовался при покупке, в течение максимум 14 рабочих дней.</li>
              </ol>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                Товары, которые НЕ подлежат возврату
              </h3>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li>Вскрытое программное обеспечение или активированные лицензии.</li>
                <li>Персонализированные или гравированные товары.</li>
                <li>Распакованные расходные материалы (картриджи, тонеры, батареи).</li>
                <li>Товары с дефектами, вызванными неправильной эксплуатацией.</li>
              </ul>
            </section>

            {/* Ссылка на гарантию */}
            <section className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <ShieldCheck size={20} className="text-primary" /> Гарантия
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Все товары имеют гарантию. Подробности на{" "}
                <Link href="/ru/warranty" className="text-primary hover:underline">
                  странице гарантии
                </Link>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
