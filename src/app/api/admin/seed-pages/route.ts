// src/app/api/admin/seed-pages/route.ts — One-time seed of company pages into admin/pages
// Admin-only. Creates/upserts: about, contact, terms, shipping, warranty, cookies
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

const PAGES = [
  {
    slug: 'about',
    titleRo: 'Despre Noi',
    titleRu: 'О нас',
    contentRo: '<h2>Povestea noastră</h2><p>Western Import s-a născut în 2023 dintr-o simplă observație: moldovenii merită acces la electronică de calitate la prețuri corecte, fără compromisuri. Am pornit de la un magazin mic pe o stradă liniștită din Chișinău, cu un laptop pe masă și o determinare uriașă.</p><p>De ce „Western"? Pentru că aducem produse din occident — laptopuri, telefoane, monitoare și componente — seleculate cu grijă, testate minuțios și oferite cu garanție reală.</p><p>Astăzi, după 3 ani pe piață, suntem mândri de fiecare client mulțumit. Nu suntem cel mai mare magazin din Moldova — și nici nu dorim să fim. Preferăm să fim cel mai de încredere.</p><h2>Misiune și valori</h2><p style="font-size:18px;font-style:italic;padding:20px;background:rgba(37,99,235,0.05);border-radius:12px">„Să oferim fiecărui moldovean acces la tehnologie de calitate, la un preț corect, susținut de un serviciu clienți de excepție."</p><h2>Western Import în cifre</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;text-align:center;margin-bottom:24px"><div style="padding:20px;background:#f8fafc;border-radius:12px"><p style="font-size:28px;font-weight:800">1000+</p><p style="font-size:14px">Clienți mulțumiți</p></div><div style="padding:20px;background:#f8fafc;border-radius:12px"><p style="font-size:28px;font-weight:800">500+</p><p style="font-size:14px">Produse în catalog</p></div><div style="padding:20px;background:#f8fafc;border-radius:12px"><p style="font-size:28px;font-weight:800">3</p><p style="font-size:14px">Ani pe piață</p></div></div><h2>De ce Western Import?</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px"><div style="padding:20px;border:1px solid #e2e8f0;border-radius:12px"><h3>Calitate verificată</h3><p>Fiecare produs e testat individual de tehnicienii noștri.</p></div><div style="padding:20px;border:1px solid #e2e8f0;border-radius:12px"><h3>Prețuri corecte</h3><p>Negociem direct cu furnizorii din UE și SUA. Fără intermediari.</p></div><div style="padding:20px;border:1px solid #e2e8f0;border-radius:12px"><h3>Garanție reală</h3><p>12 luni pentru produse noi, 6 luni pentru refurbished. Service propriu.</p></div><div style="padding:20px;border:1px solid #e2e8f0;border-radius:12px"><h3>Suport dedicat</h3><p>Vorbești cu oameni reali, care cunosc produsele. Răspundem în maxim 2 ore.</p></div></div>',
    contentRu: '<h2>Наша история</h2><p>Western Import родился в 2023 году из простого наблюдения: молдаване заслуживают доступа к качественной электронике по справедливым ценам. Мы начали с маленького магазина на тихой улице в Кишинёве.</p><p>Почему «Western»? Потому что мы привозим продукцию с Запада — ноутбуки, телефоны, мониторы и компоненты — тщательно отобранные, протестированные и с реальной гарантией.</p><p>Спустя 3 года на рынке мы гордимся каждым довольным клиентом. Мы не самый большой магазин — и не стремимся быть таковым. Предпочитаем быть самыми надёжными.</p><h2>Миссия и ценности</h2><p style="font-size:18px;font-style:italic;padding:20px;background:rgba(37,99,235,0.05);border-radius:12px">«Предоставить каждому молдаванину доступ к качественным технологиям по справедливой цене, подкреплённым исключительным обслуживанием.»</p><h2>Western Import в цифрах</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;text-align:center;margin-bottom:24px"><div style="padding:20px;background:#f8fafc;border-radius:12px"><p style="font-size:28px;font-weight:800">1000+</p><p>Довольных клиентов</p></div><div style="padding:20px;background:#f8fafc;border-radius:12px"><p style="font-size:28px;font-weight:800">500+</p><p>Товаров в каталоге</p></div><div style="padding:20px;background:#f8fafc;border-radius:12px"><p style="font-size:28px;font-weight:800">3</p><p>Года на рынке</p></div></div><h2>Почему Western Import?</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px"><div style="padding:20px;border:1px solid #e2e8f0;border-radius:12px"><h3>Проверенное качество</h3><p>Каждый товар тестируется нашими техниками.</p></div><div style="padding:20px;border:1px solid #e2e8f0;border-radius:12px"><h3>Справедливые цены</h3><p>Прямые переговоры с поставщиками из ЕС и США.</p></div><div style="padding:20px;border:1px solid #e2e8f0;border-radius:12px"><h3>Реальная гарантия</h3><p>12 месяцев для новых, 6 месяцев для восстановленных.</p></div><div style="padding:20px;border:1px solid #e2e8f0;border-radius:12px"><h3>Поддержка</h3><p>Отвечаем в течение 2 часов.</p></div></div>',
    isPublished: true,
  },
  {
    slug: 'contact',
    titleRo: 'Contact',
    titleRu: 'Контакты',
    contentRo: '<h2>Contactează-ne</h2><div style="display:grid;gap:16px;margin-bottom:24px"><div style="display:flex;align-items:center;gap:12px;padding:12px;background:#f8fafc;border-radius:12px"><strong>📞 Telefon:</strong> <a href="tel:+37369466585">+373 69 466 585</a> — Luni - Sâmbătă, 10:00 - 18:00</div><div style="display:flex;align-items:center;gap:12px;padding:12px;background:#f8fafc;border-radius:12px"><strong>📧 Email:</strong> <a href="mailto:info@westernimport.md">info@westernimport.md</a> — Răspundem în 24h</div><div style="display:flex;align-items:center;gap:12px;padding:12px;background:#f8fafc;border-radius:12px"><strong>📍 Adresă:</strong> Strada Podgorenilor 17, Chișinău, Moldova</div></div><h2>Program Magazin</h2><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">Luni - Vineri</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600">10:00 - 18:00</td></tr><tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">Sâmbătă</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600">10:00 - 18:00</td></tr><tr><td style="padding:8px">Duminică</td><td style="padding:8px;text-align:right;font-weight:600">10:00 - 16:00</td></tr></table>',
    contentRu: '<h2>Свяжитесь с нами</h2><div style="display:grid;gap:16px;margin-bottom:24px"><div style="display:flex;align-items:center;gap:12px;padding:12px;background:#f8fafc;border-radius:12px"><strong>📞 Телефон:</strong> <a href="tel:+37369466585">+373 69 466 585</a> — Понедельник - Суббота, 10:00 - 18:00</div><div style="display:flex;align-items:center;gap:12px;padding:12px;background:#f8fafc;border-radius:12px"><strong>📧 Email:</strong> <a href="mailto:info@westernimport.md">info@westernimport.md</a> — Отвечаем в течение 24ч</div><div style="display:flex;align-items:center;gap:12px;padding:12px;background:#f8fafc;border-radius:12px"><strong>📍 Адрес:</strong> ул. Подгоренилор 17, Кишинёв, Молдова</div></div><h2>График работы</h2><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">Понедельник - Пятница</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600">10:00 - 18:00</td></tr><tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">Суббота</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600">10:00 - 18:00</td></tr><tr><td style="padding:8px">Воскресенье</td><td style="padding:8px;text-align:right;font-weight:600">10:00 - 16:00</td></tr></table>',
    isPublished: true,
  },
  {
    slug: 'terms',
    titleRo: 'Termeni și Condiții',
    titleRu: 'Условия и положения',
    contentRo: '<h2>Termeni și Condiții</h2><p>Prin utilizarea acestui site, sunteți de acord cu următorii termeni și condiții.</p><h2>Comenzi</h2><p>Toate comenzile sunt supuse confirmării. Western Import își rezervă dreptul de a refuza sau anula comenzi în caz de erori de preț sau stoc.</p><h2>Prețuri</h2><p>Toate prețurile sunt exprimate în MDL și includ TVA. Prețurile pot fi modificate fără notificare prealabilă.</p><h2>Proprietate intelectuală</h2><p>Conținutul acestui site (text, imagini, logo-uri) este proprietatea Western Import și nu poate fi reprodus fără permisiune.</p>',
    contentRu: '<h2>Условия и положения</h2><p>Используя этот сайт, вы соглашаетесь со следующими условиями.</p><h2>Заказы</h2><p>Все заказы подлежат подтверждению. Western Import оставляет за собой право отказать или отменить заказы в случае ошибок в цене или наличии.</p><h2>Цены</h2><p>Все цены указаны в MDL и включают НДС. Цены могут быть изменены без предварительного уведомления.</p><h2>Интеллектуальная собственность</h2><p>Содержание этого сайта является собственностью Western Import и не может быть воспроизведено без разрешения.</p>',
    isPublished: true,
  },
  {
    slug: 'shipping',
    titleRo: 'Livrare și Returnare',
    titleRu: 'Доставка и возврат',
    contentRo: '<h2>Metode de livrare</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px"><div style="padding:20px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0"><h3 style="font-weight:bold;margin-bottom:4px">Curier Chișinău</h3><p style="font-size:14px">Gratuit</p><p style="font-size:12px;margin-top:4px">Livrare în 1–2 zile lucrătoare</p></div><div style="padding:20px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0"><h3 style="font-weight:bold;margin-bottom:4px">Curier național</h3><p style="font-size:14px">Gratuit</p><p style="font-size:12px;margin-top:4px">Livrare în 2–5 zile lucrătoare</p></div><div style="padding:20px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0"><h3 style="font-weight:bold;margin-bottom:4px">Ridicare din magazin</h3><p style="font-size:14px">Gratuit</p><p style="font-size:12px;margin-top:4px">str. Podgorenilor 17, Chișinău</p></div></div><h2>Returnare și rambursare</h2><p>Aveți dreptul de a returna produsele în termen de <strong>14 zile calendaristice</strong>.</p><ul><li>Produsul trebuie să fie în starea originală, neutilizat.</li><li>Ambalajul trebuie să fie complet și intact.</li><li>Rambursarea în maximum 14 zile lucrătoare.</li></ul>',
    contentRu: '<h2>Способы доставки</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px"><div style="padding:20px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0"><h3 style="font-weight:bold;margin-bottom:4px">Курьер Кишинёв</h3><p style="font-size:14px">Бесплатно</p><p style="font-size:12px;margin-top:4px">1–2 рабочих дня</p></div><div style="padding:20px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0"><h3 style="font-weight:bold;margin-bottom:4px">Курьер по стране</h3><p style="font-size:14px">Бесплатно</p><p style="font-size:12px;margin-top:4px">2–5 рабочих дней</p></div><div style="padding:20px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0"><h3 style="font-weight:bold;margin-bottom:4px">Самовывоз</h3><p style="font-size:14px">Бесплатно</p><p style="font-size:12px;margin-top:4px">ул. Подгоренилор 17, Кишинёв</p></div></div><h2>Возврат и возмещение</h2><p>Вы имеете право вернуть товар в течение <strong>14 календарных дней</strong>.</p><ul><li>Товар должен быть в оригинальном состоянии.</li><li>Упаковка должна быть полной и неповреждённой.</li><li>Возмещение в течение 14 рабочих дней.</li></ul>',
    isPublished: true,
  },
  {
    slug: 'warranty',
    titleRo: 'Garanție',
    titleRu: 'Гарантия',
    contentRo: '<h2>Perioade de garanție</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px"><div style="padding:24px;background:rgba(37,99,235,0.1);border-radius:12px;border:1px solid rgba(37,99,235,0.2)"><h3 style="font-size:20px;font-weight:bold;margin-bottom:8px">Produse noi</h3><p style="font-size:28px;font-weight:800;color:#2563eb">12 luni</p><p style="font-size:14px;margin-top:8px">Garanție completă pentru toate produsele noi.</p></div><div style="padding:24px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0"><h3 style="font-size:20px;font-weight:bold;margin-bottom:8px">Produse refurbished</h3><p style="font-size:28px;font-weight:800;color:#64748b">6 luni</p><p style="font-size:14px;margin-top:8px">Garanție pentru defecțiuni tehnice majore.</p></div></div><h2>Ce acoperă garanția</h2><ul><li>Defecțiuni de fabricație</li><li>Probleme de funcționare în condiții normale</li><li>Defecțiuni ale ecranului</li><li>Probleme de alimentare sau încărcare</li><li>Defecțiuni ale porturilor și conectoarelor</li></ul><h2>Contact service</h2><ul><li><strong>Telefon:</strong> +373 69 466 585</li><li><strong>E-mail:</strong> service@westernimport.md</li><li><strong>Adresă:</strong> str. Podgorenilor 17, Chișinău</li></ul>',
    contentRu: '<h2>Сроки гарантии</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px"><div style="padding:24px;background:rgba(37,99,235,0.1);border-radius:12px;border:1px solid rgba(37,99,235,0.2)"><h3 style="font-size:20px;font-weight:bold;margin-bottom:8px">Новые товары</h3><p style="font-size:28px;font-weight:800;color:#2563eb">12 месяцев</p><p style="font-size:14px;margin-top:8px">Полная гарантия на все новые товары.</p></div><div style="padding:24px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0"><h3 style="font-size:20px;font-weight:bold;margin-bottom:8px">Восстановленные товары</h3><p style="font-size:28px;font-weight:800;color:#64748b">6 месяцев</p><p style="font-size:14px;margin-top:8px">Гарантия на основные технические неисправности.</p></div></div><h2>Что покрывает гарантия</h2><ul><li>Производственные дефекты</li><li>Проблемы работы в нормальных условиях</li><li>Дефекты экрана</li><li>Проблемы питания или зарядки</li><li>Дефекты портов и разъёмов</li></ul><h2>Контакты сервиса</h2><ul><li><strong>Телефон:</strong> +373 69 466 585</li><li><strong>Email:</strong> service@westernimport.md</li><li><strong>Адрес:</strong> ул. Подгоренилор 17, Кишинёв</li></ul>',
    isPublished: true,
  },
  {
    slug: 'cookies',
    titleRo: 'Politica Cookies',
    titleRu: 'Политика Cookies',
    contentRo: '<h2>Politica Cookies</h2><p>Acest site utilizează cookies pentru a îmbunătăți experiența de navigare. Cookies sunt fișiere mici stocate pe dispozitivul dumneavoastră.</p><h2>Ce cookies folosim</h2><ul><li><strong>Esențiale:</strong> Necesare pentru funcționarea site-ului.</li><li><strong>Analiză:</strong> Ne ajută să înțelegem cum folosiți site-ul.</li><li><strong>Marketing:</strong> Folosite pentru reclame relevante.</li></ul><p>Puteți gestiona preferințele de cookies în setările browserului.</p>',
    contentRu: '<h2>Политика Cookies</h2><p>Этот сайт использует cookies для улучшения опыта навигации. Cookies — это небольшие файлы, хранящиеся на вашем устройстве.</p><h2>Какие cookies мы используем</h2><ul><li><strong>Основные:</strong> Необходимы для работы сайта.</li><li><strong>Аналитика:</strong> Помогают понять, как вы используете сайт.</li><li><strong>Маркетинг:</strong> Используются для релевантной рекламы.</li></ul><p>Вы можете управлять настройками cookies в настройках браузера.</p>',
    isPublished: true,
  },
];

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return Response.json({ success: false, error: 'Neautorizat' }, { status: error === 'forbidden' ? 403 : 401 });

  let created = 0;
  let updated = 0;

  for (const page of PAGES) {
    const existing = await prisma.page.findUnique({ where: { slug: page.slug } });
    if (existing) {
      await prisma.page.update({
        where: { slug: page.slug },
        data: {
          titleRo: page.titleRo,
          titleRu: page.titleRu,
          contentRo: page.contentRo,
          contentRu: page.contentRu,
          isPublished: page.isPublished,
        },
      });
      updated++;
    } else {
      await prisma.page.create({ data: page });
      created++;
    }
  }

  return Response.json({
    success: true,
    message: `${created} pagini create, ${updated} actualizate. Total: ${PAGES.length}`,
    pages: PAGES.map(p => p.slug),
  });
}
