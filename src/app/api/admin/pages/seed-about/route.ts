import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return NextResponse.json({ success: false, error: 'Neautorizat' }, { status: 401 });
    if (error === 'forbidden') return NextResponse.json({ success: false, error: 'Acces refuzat' }, { status: 403 });

    const blocksRo = [
      { type: "heading", text: "Povestea noastră", icon: "star" },
      { type: "paragraph", text: "Western Import s-a născut în 2023 dintr-o simplă observație: moldovenii merită acces la electronică de calitate la prețuri corecte, fără compromisuri. Am pornit de la un magazin mic pe o stradă liniștită din Chișinău, cu un laptop pe masă și o determinare uriașă." },
      { type: "paragraph", text: "De ce „Western\"? Pentru că aducem produse din occident — laptopuri, telefoane, monitoare și componente — seleculate cu grijă, testate minuțios și oferite cu garanție reală. Nu vindem „înghesuit\", nu vindem „la noroc\". Fiecare produs trece prin mâinile noastre înainte să ajungă la tine." },
      { type: "paragraph", text: "Astăzi, după 3 ani pe piață, suntem mândri de fiecare client mulțumit. Nu suntem cel mai mare magazin din Moldova — și nici nu dorim să fim. Preferăm să fim cel mai de încredere." },
      { type: "heading", text: "Misiune și valori", icon: "target" },
      { type: "quote", text: "„Să oferim fiecărui moldovean acces la tehnologie de calitate, la un preț corect, susținut de un serviciu clienți de excepție.\"" },
      { type: "cards", columns: 2, items: [
        { icon: "shield", color: "blue", title: "Integritate", text: "Ce promitem, livrăm. Fără surprize ascunse, fără prețuri manipulative." },
        { icon: "award", color: "green", title: "Calitate", text: "Fiecare produs e testat înainte de vânzare. Nu facem compromisuri." },
        { icon: "heart", color: "purple", title: "Transparență", text: "Stările produselor sunt descrise clar. Știm ce vindem și de unde vine." },
        { icon: "users", color: "amber", title: "Comunitate", text: "Clienții noștri sunt vecini, prieteni, colegi. Îi tratăm ca atare." },
      ]},
      { type: "heading", text: "Western Import în cifre", icon: "trending-up" },
      { type: "stats", items: [
        { icon: "users", value: "1000+", label: "Clienți mulțumiți" },
        { icon: "package", value: "500+", label: "Produse în catalog" },
        { icon: "clock", value: "3", label: "Ani pe piață" },
      ]},
      { type: "heading", text: "De ce Western Import?" },
      { type: "cards", columns: 2, items: [
        { icon: "award", color: "primary", title: "Calitate verificată", text: "Fiecare produs e testat individual de tehnicienii noștri. Nu primim produse direct din cutie — le deschidem, verificăm și doar apoi le oferim clienților." },
        { icon: "trending-up", color: "green", title: "Prețuri corecte", text: "Negociem direct cu furnizorii din UE și SUA. Fără intermediari inutili, fără adaosuri ascunse. Prețul pe care îl vezi e cel mai bun pe care îl putem oferi." },
        { icon: "shield", color: "blue", title: "Garanție reală", text: "12 luni pentru produse noi, 6 luni pentru refurbished. Nu fugim de responsabilități — avem service propriu și răspundem la telefon." },
        { icon: "users", color: "purple", title: "Suport dedicat", text: "Nu suntem un magazin anonim. Vorbești cu oameni reali, care cunosc produsele și te ajută să alegi ce ți se potrivește. Răspundem în maxim 2 ore." },
      ]},
      { type: "heading", text: "Echipa", icon: "users" },
      { type: "team", items: [
        { initials: "VI", name: "Victor I.", role: "Fondator & CEO", gradient: "from-primary to-blue-400" },
        { initials: "AM", name: "Andrei M.", role: "Tehnician șef", gradient: "from-green-400 to-emerald-500" },
        { initials: "EC", name: "Elena C.", role: "Suport clienți", gradient: "from-purple-400 to-pink-500" },
      ]},
    ];

    const blocksRu = [
      { type: "heading", text: "Наша история", icon: "star" },
      { type: "paragraph", text: "Western Import родился в 2023 году из простого наблюдения: молдаване заслуживают доступа к качественной электронике по справедливым ценам, без компромиссов. Мы начали с маленького магазина на тихой улице в Кишинёве, с одним ноутбуком на столе и огромной решимостью." },
      { type: "paragraph", text: "Почему «Western»? Потому что мы привозим товары с Запада — ноутбуки, телефоны, мониторы и комплектующие — тщательно отобранные, скрупулёзно протестированные и предлагаемые с реальной гарантией." },
      { type: "paragraph", text: "Сегодня, после 3 лет на рынке, мы гордимся каждым довольным клиентом. Мы не самый большой магазин в Молдове — и не стремимся им быть. Мы предпочитаем быть самыми надёжными." },
      { type: "heading", text: "Миссия и ценности", icon: "target" },
      { type: "quote", text: "«Обеспечить каждому молдаванину доступ к качественной технологии по справедливой цене, подкреплённой исключительной поддержкой клиентов.»" },
      { type: "cards", columns: 2, items: [
        { icon: "shield", color: "blue", title: "Добросовестность", text: "Что обещаем — то доставляем. Без скрытых сюрпризов, без манипулятивных цен." },
        { icon: "award", color: "green", title: "Качество", text: "Каждый товар проверяется перед продажей. Мы не идём на компромиссы." },
        { icon: "heart", color: "purple", title: "Прозрачность", text: "Состояние товаров описано чётко. Мы знаем, что продаём и откуда это." },
        { icon: "users", color: "amber", title: "Сообщество", text: "Наши клиенты — соседи, друзья, коллеги. Мы относимся к ним соответственно." },
      ]},
      { type: "heading", text: "Western Import в цифрах", icon: "trending-up" },
      { type: "stats", items: [
        { icon: "users", value: "1000+", label: "Довольных клиентов" },
        { icon: "package", value: "500+", label: "Товаров в каталоге" },
        { icon: "clock", value: "3", label: "Года на рынке" },
      ]},
      { type: "heading", text: "Почему Western Import?" },
      { type: "cards", columns: 2, items: [
        { icon: "award", color: "primary", title: "Проверенное качество", text: "Каждый товар проходит индивидуальное тестирование нашими техниками." },
        { icon: "trending-up", color: "green", title: "Справедливые цены", text: "Мы ведём переговоры напрямую с поставщиками из ЕС и США." },
        { icon: "shield", color: "blue", title: "Реальная гарантия", text: "12 месяцев для новых товаров, 6 месяцев для восстановленных." },
        { icon: "users", color: "purple", title: "Выделенная поддержка", text: "Вы общаетесь с реальными людьми, которые знают товары." },
      ]},
      { type: "heading", text: "Команда", icon: "users" },
      { type: "team", items: [
        { initials: "ВИ", name: "Виктор И.", role: "Основатель и CEO", gradient: "from-primary to-blue-400" },
        { initials: "АМ", name: "Андрей М.", role: "Главный техник", gradient: "from-green-400 to-emerald-500" },
        { initials: "ЕС", name: "Елена К.", role: "Поддержка клиентов", gradient: "from-purple-400 to-pink-500" },
      ]},
    ];

    const existing = await prisma.page.findUnique({ where: { slug: "about" } });

    if (existing) {
      await prisma.page.update({
        where: { slug: "about" },
        data: {
          contentRo: JSON.stringify(blocksRo),
          contentRu: JSON.stringify(blocksRu),
        },
      });
    } else {
      await prisma.page.create({
        data: {
          slug: "about",
          titleRo: "Despre Noi",
          titleRu: "О нас",
          contentRo: JSON.stringify(blocksRo),
          contentRu: JSON.stringify(blocksRu),
          isPublished: true,
        },
      });
    }

    return NextResponse.json({ success: true, message: "About page seeded with block content (RO + RU)" });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: 'Eroare la seed' }, { status: 500 });
  }
}
