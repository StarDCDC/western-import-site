import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// Helper to create page blocks
type Block = Record<string, unknown>;

function h(text: string, icon = "star"): Block {
  return { type: "heading", text, icon };
}
function p(text: string): Block {
  return { type: "paragraph", text };
}
function q(text: string): Block {
  return { type: "quote", text };
}
function stats(items: Array<{ icon: string; value: string; label: string }>): Block {
  return { type: "stats", items };
}
function cards(columns: number, items: Array<{ icon: string; color: string; title: string; text: string }>): Block {
  return { type: "cards", columns, items };
}
function team(items: Array<{ initials: string; name: string; role: string; gradient: string }>): Block {
  return { type: "team", items };
}

// ─── ABOUT ──────────────────────────────────────────────────────────
const aboutRo: Block[] = [
  h("Povestea noastră", "star"),
  p("Western Import s-a născut în 2023 dintr-o simplă observație: moldovenii merită acces la electronică de calitate la prețuri corecte, fără compromisuri. Am pornit de la un magazin mic pe o stradă liniștită din Chișinău, cu un laptop pe masă și o determinare uriașă."),
  p("De ce „Western\"? Pentru că aducem produse din occident — laptopuri, telefoane, monitoare și componente — seleculate cu grijă, testate minuțios și oferite cu garanție reală. Nu vindem „înghesuit\", nu vindem „la noroc\". Fiecare produs trece prin mâinile noastre înainte să ajungă la tine."),
  p("Astăzi, după 3 ani pe piață, suntem mândri de fiecare client mulțumit. Nu suntem cel mai mare magazin din Moldova — și nici nu dorim să fim. Preferăm să fim cel mai de încredere."),
  h("Misiune și valori", "target"),
  q("„Să oferim fiecărui moldovean acces la tehnologie de calitate, la un preț corect, susținut de un serviciu clienți de excepție.\""),
  cards(2, [
    { icon: "shield", color: "blue", title: "Integritate", text: "Ce promitem, livrăm. Fără surprize ascunse, fără prețuri manipulative." },
    { icon: "award", color: "green", title: "Calitate", text: "Fiecare produs e testat înainte de vânzare. Nu facem compromisuri." },
    { icon: "heart", color: "purple", title: "Transparență", text: "Stările produselor sunt descrise clar. Știm ce vindem și de unde vine." },
    { icon: "users", color: "amber", title: "Comunitate", text: "Clienții noștri sunt vecini, prieteni, colegi. Îi tratăm ca atare." },
  ]),
  h("Western Import în cifre", "trending-up"),
  stats([
    { icon: "users", value: "1000+", label: "Clienți mulțumiți" },
    { icon: "package", value: "500+", label: "Produse în catalog" },
    { icon: "clock", value: "3", label: "Ani pe piață" },
  ]),
  h("De ce Western Import?"),
  cards(2, [
    { icon: "award", color: "primary", title: "Calitate verificată", text: "Fiecare produs e testat individual de tehnicienii noștri. Nu primim produse direct din cutie — le deschidem, verificăm și doar apoi le oferim clienților." },
    { icon: "trending-up", color: "green", title: "Prețuri corecte", text: "Negociem direct cu furnizorii din UE și SUA. Fără intermediari inutili, fără adaosuri ascunse. Prețul pe care îl vezi e cel mai bun pe care îl putem oferi." },
    { icon: "shield", color: "blue", title: "Garanție reală", text: "12 luni pentru produse noi, 6 luni pentru refurbished. Nu fugim de responsabilități — avem service propriu și răspundem la telefon." },
    { icon: "users", color: "purple", title: "Suport dedicat", text: "Nu suntem un magazin anonim. Vorbești cu oameni reali, care cunosc produsele și te ajută să alegi ce ți se potrivește. Răspundem în maxim 2 ore." },
  ]),
  h("Echipa", "users"),
  team([
    { initials: "VI", name: "Victor I.", role: "Fondator & CEO", gradient: "from-primary to-blue-400" },
    { initials: "AM", name: "Andrei M.", role: "Tehnician șef", gradient: "from-green-400 to-emerald-500" },
    { initials: "EC", name: "Elena C.", role: "Suport clienți", gradient: "from-purple-400 to-pink-500" },
  ]),
];

const aboutRu: Block[] = [
  h("Наша история", "star"),
  p("Western Import родился в 2023 году из простого наблюдения: молдаване заслуживают доступа к качественной электронике по справедливым ценам, без компромиссов. Мы начали с маленького магазина на тихой улице в Кишинёве, с одним ноутбуком на столе и огромной решимостью."),
  p("Почему «Western»? Потому что мы привозим товары с Запада — ноутбуки, телефоны, мониторы и комплектующие — тщательно отобранные, скрупулёзно протестированные и предлагаемые с реальной гарантией."),
  p("Сегодня, после 3 лет на рынке, мы гордимся каждым довольным клиентом. Мы не самый большой магазин в Молдове — и не стремимся им быть. Мы предпочитаем быть самыми надёжными."),
  h("Миссия и ценности", "target"),
  q("«Обеспечить каждому молдаванину доступ к качественной технологии по справедливой цене, подкреплённой исключительной поддержкой клиентов.»"),
  cards(2, [
    { icon: "shield", color: "blue", title: "Добросовестность", text: "Что обещаем — то доставляем. Без скрытых сюрпризов." },
    { icon: "award", color: "green", title: "Качество", text: "Каждый товар проверяется перед продажей. Мы не идём на компромиссы." },
    { icon: "heart", color: "purple", title: "Прозрачность", text: "Состояние товаров описано чётко. Мы знаем, что продаём." },
    { icon: "users", color: "amber", title: "Сообщество", text: "Наши клиенты — соседи, друзья, коллеги. Мы относимся к ним соответственно." },
  ]),
  h("Western Import в цифрах", "trending-up"),
  stats([
    { icon: "users", value: "1000+", label: "Довольных клиентов" },
    { icon: "package", value: "500+", label: "Товаров в каталоге" },
    { icon: "clock", value: "3", label: "Года на рынке" },
  ]),
  h("Почему Western Import?"),
  cards(2, [
    { icon: "award", color: "primary", title: "Проверенное качество", text: "Каждый товар проходит индивидуальное тестирование нашими техниками." },
    { icon: "trending-up", color: "green", title: "Справедливые цены", text: "Мы ведём переговоры напрямую с поставщиками из ЕС и США." },
    { icon: "shield", color: "blue", title: "Реальная гарантия", text: "12 месяцев для новых, 6 месяцев для восстановленных." },
    { icon: "users", color: "purple", title: "Выделенная поддержка", text: "Вы общаетесь с реальными людьми. Отвечаем максимум за 2 часа." },
  ]),
  h("Команда", "users"),
  team([
    { initials: "ВИ", name: "Виктор И.", role: "Основатель и CEO", gradient: "from-primary to-blue-400" },
    { initials: "АМ", name: "Андрей М.", role: "Главный техник", gradient: "from-green-400 to-emerald-500" },
    { initials: "ЕС", name: "Елена К.", role: "Поддержка клиентов", gradient: "from-purple-400 to-pink-500" },
  ]),
];

// ─── TERMS ──────────────────────────────────────────────────────────
const termsRo: Block[] = [
  h("1. Dispoziții generale", "shield"),
  p("Prezentul document stabilește termenii și condițiile de utilizare a site-ului westernimport.md, proprietatea SRL Western Import, înregistrată în Chișinău, Republica Moldova, sediul social str. Podgorenilor 17, Chișinău."),
  p("Accesarea și utilizarea Site-ului implică acceptarea integrală a prezentului document. Western Import își rezervă dreptul de a modifica acești termeni în orice moment."),
  p("Vârsta minimă pentru efectuarea de achiziții este de 18 ani."),
  h("2. Conturi utilizatori", "users"),
  p("Pentru a plasa comenzi pe Site, utilizatorul trebuie să creeze un cont furnizând date personale reale și complete: nume complet, adresă de e-mail, număr de telefon și adresă de livrare."),
  p("• Utilizatorul este singurul responsabil pentru păstrarea confidențialității datelor de autentificare.\n• Orice activitate realizată din contul utilizatorului este considerată ca fiind efectuată de acesta.\n• Western Import își rezervă dreptul de a suspenda sau șterge conturi care încalcă acești termeni.\n• Datele personale sunt procesate în conformitate cu Politica de Confidențialitate."),
  h("3. Produse și prețuri", "package"),
  p("Prețurile afișate pe Site sunt exprimate în Lei moldovenești (MDL) și includ TVA. Western Import depune eforturi rezonabile pentru a menține prețurile actualizate, însă pot exista erori punctuale."),
  p("• În cazul unei erori evidente de preț, Western Import poate anula comanda și va notifica clientul în maximum 24 de ore.\n• Fotografille produselor au caracter informativ; nuanțele de culoare pot diferi.\n• Stocul este actualizat în timp real.\n• Promoțiile sunt valabile în perioada specificată și nu se cumulează decât dacă este menționat explicit."),
  h("4. Procesul de comandă", "clock"),
  p("Plasarea unei comenzi presupune: selectarea produselor, adăugarea în coș, completarea datelor de livrare, alegerea metodei de plată și confirmarea."),
  p("• După confirmare, clientul primește un e-mail cu detaliile comenzii.\n• Comanda devine definitivă după confirmarea de către Western Import.\n• Western Import poate refuza o comandă în caz de suspiciune de fraudă.\n• Clientul poate anula o comandă gratuit înainte de expediere."),
  h("5. Metode de plată", "zap"),
  p("Western Import acceptă următoarele metode de plată:"),
  p("• Numerar la livrare — plata se efectuează curierului la primirea coletului.\n• Card bancar online — Visa, MasterCard, procesare securizată.\n• Transfer bancar — datele de plată vor fi trimise pe e-mail după confirmarea comenzii."),
  p("Plățile online sunt procesate prin conexiuni securizate (SSL/TLS). Datele cardului bancar nu sunt stocate pe serverele noastre."),
  h("6. Livrare", "truck"),
  p("Detalii complete despre metodele și termenele de livrare sunt disponibile pe pagina Livrare și Returnare."),
  p("• Riscul transferului de proprietate trece la client în momentul predării produsului.\n• Clientul trebuie să verifice integritatea coletului la primire.\n• Livrarea se face exclusiv pe teritoriul Republicii Moldova."),
  h("7. Returnare și rambursare", "globe"),
  p("Conform legislației Republicii Moldova, clientul are dreptul de a returna produsul în termen de 14 zile calendaristice de la primire, fără motivare, cu condiția ca produsul să fie în starea originală."),
  p("• Costurile de returnare sunt suportate de client, cu excepția produselor defecte.\n• Rambursarea se efectuează în maximum 14 zile lucrătoare.\n• Produsele personalizate sau sigilate desigilate nu pot fi returnate."),
  h("8. Proprietate intelectuală", "award"),
  p("Tot conținutul Site-ului este proprietatea Western Import sau a licențiatorilor săi și este protejat de legislația privind drepturile de autor."),
  p("• Reproducerea, distribuirea sau utilizarea conținutului fără acord scris este interzisă.\n• Numele „Western Import\", logo-ul și sloganurile sunt mărci ale companiei."),
  h("9. Limitarea răspunderii", "shield"),
  p("Western Import nu oferă garanții privind disponibilitatea neîntreruptă a Site-ului, absența erorilor sau compatibilitatea cu orice dispozitiv."),
  p("Răspunderea totală a Western Import față de client nu va depăși valoarea comenzii respective."),
  h("10. Forța majoră", "zap"),
  p("Western Import nu va fi responsabilă pentru întârzieri cauzate de evenimente independente de voința sa: dezastre naturale, pandemii, conflicte, greve, restricții guvernamentale."),
  h("11. Legi aplicabile", "globe"),
  p("Prezentul document este guvernat de legislația Republicii Moldova. Orice litigiu va fi soluționat pe cale amiabilă, iar în lipsa unui acord, prin instanțele competente din Chișinău."),
  h("12. Contact", "headphones"),
  p("• E-mail: info@westernimport.md\n• Telefon: +373 69 466 585\n• Adresă: str. Podgorenilor 17, Chișinău, Republica Moldova\n• Program: Luni–Vineri: 09:00–18:00, Sâmbătă: 10:00–15:00"),
];

const termsRu: Block[] = [
  h("1. Общие положения", "shield"),
  p("Настоящий документ устанавливает условия использования сайта westernimport.md, принадлежащего SRL Western Import, Кишинёв, Республика Молдова, ул. Подгоренийлор 17."),
  p("Доступ и использование Сайта означает полное согласие с настоящим документом."),
  p("Минимальный возраст для покупок — 18 лет."),
  h("2. Аккаунты пользователей", "users"),
  p("Для оформления заказов необходимо создать аккаунт с реальными данными: ФИО, e-mail, телефон, адрес доставки."),
  p("• Пользователь несёт ответственность за сохранность данных авторизации.\n• Western Import оставляет за собой право блокировать аккаунты, нарушающие условия."),
  h("3. Товары и цены", "package"),
  p("Цены указаны в молдавских леях (MDL) и включают НДС. Мы стремимся поддерживать актуальные цены, но возможны ошибки."),
  p("• При явной ошибке в цене Western Import может отменить заказ.\n• Фотографии товаров носят информационный характер.\n• Акции действительны в указанный период."),
  h("4. Процесс заказа", "clock"),
  p("Оформление заказа: выбор товаров → корзина → данные доставки → оплата → подтверждение."),
  h("5. Способы оплаты", "zap"),
  p("• Наличные при получении\n• Банковская карта онлайн (Visa, MasterCard)\n• Банковский перевод"),
  p("Онлайн-платежи обрабатываются через защищённые соединения (SSL/TLS)."),
  h("6. Доставка", "truck"),
  p("Доставка осуществляется только по территории Республики Молдова."),
  h("7. Возврат и возмещение", "globe"),
  p("Согласно законодательству РМ, клиент может вернуть товар в течение 14 календарных дней без объяснения причин."),
  h("8. Интеллектуальная собственность", "award"),
  p("Все материалы Сайта защищены авторским правом. Воспроизведение без разрешения запрещено."),
  h("9. Ограничение ответственности", "shield"),
  p("Western Import не гарантирует бесперебойную работу Сайта. Ответственность ограничена суммой заказа."),
  h("10. Форс-мажор", "zap"),
  p("Western Import не несёт ответственности за задержки, вызванные форс-мажорными обстоятельствами."),
  h("11. Применимое законодательство", "globe"),
  p("Документ регулируется законодательством Республики Молдова."),
  h("12. Контакты", "headphones"),
  p("• E-mail: info@westernimport.md\n• Телефон: +373 69 466 585\n• Адрес: ул. Подгоренийлор 17, Кишинёв"),
];

// ─── SHIPPING ───────────────────────────────────────────────────────
const shippingRo: Block[] = [
  h("Livrare și Returnare", "truck"),
  cards(3, [
    { icon: "truck", color: "primary", title: "Curier Chișinău", text: "Gratuit — Livrare în 1–2 zile lucrătoare" },
    { icon: "package", color: "primary", title: "Curier național", text: "Gratuit — Livrare în 2–5 zile lucrătoare" },
    { icon: "globe", color: "primary", title: "Ridicare din magazin", text: "Gratuit — str. Podgorenilor 17, Chișinău" },
  ]),
  h("Tabel livrare", "truck"),
  p("| Metodă | Zonă | Cost | Termen |\n| Curier | Chișinău | Gratuit | 1–2 zile |\n| Curier | Republica Moldova | Gratuit | 2–5 zile |\n| Ridicare | Magazin Chișinău | Gratuit | Aceeași zi* |"),
  p("* Ridicarea din magazin este disponibilă după confirmarea comenzii de către operator (maximum 2 ore)."),
  h("Detalii despre livrare", "clock"),
  p("• Comenzile plasate până la ora 14:00 (luni–vineri) sunt expediate în aceeași zi.\n• Comenzile plasate vineri după 14:00, sâmbătă sau duminică sunt expediate luni.\n• La livrare, curierul așteaptă maximum 15 minute. Replanificarea costă 100 MDL.\n• Livrare gratuită oriunde în Moldova, indiferent de suma comenzii.\n• Verificați coletul la primire. Dacă observați deteriorări, semnați proces-verbal cu curierul.\n• Livrarea se face doar pe teritoriul Republicii Moldova."),
  h("Returnare și rambursare", "globe"),
  p("Conform legislației Republicii Moldova, aveți dreptul de a returna produsele în termen de 14 zile calendaristice de la data primirii coletului."),
  p("Condiții de returnare:\n• Produsul trebuie să fie în starea originală, neutilizat și nedeteriorat.\n• Ambalajul trebuie să fie complet și intact, inclusiv accesorii și instrucțiuni.\n• Factura sau dovada achiziției trebuie inclusă în colet.\n• Produsele cu software activat sau conturi create nu pot fi returnate.\n• Accesoriile desigilate (căști, încărcătoare etc.) nu pot fi returnate din motive de igienă."),
  p("Procedura de returnare:\n1. Contactați-ne la +373 69 466 585 sau info@westernimport.md pentru un număr RMA.\n2. Pregătiți produsul în ambalajul original cu toate accesoriile și factura.\n3. Adresați-vă la sediu sau programați ridicarea prin curier (150 MDL, suportat de client).\n4. Echipa noastră va inspecta produsul în maximum 3 zile lucrătoare.\n5. Rambursarea se va face prin aceeași metodă de plată, în maximum 14 zile lucrătoare."),
  p("Produse care NU pot fi returnate:\n• Software desigilat sau licențe activate\n• Produse personalizate sau gravate\n• Consumabile desigilate (cartușe, tonere, baterii)\n• Produse cu defecțiuni cauzate de utilizare incorectă"),
  h("Garanție", "shield"),
  p("Toate produsele beneficiază de garanție. Pentru detalii complete, consultați pagina de garanție."),
];

const shippingRu: Block[] = [
  h("Доставка и возврат", "truck"),
  cards(3, [
    { icon: "truck", color: "primary", title: "Курьер Кишинёв", text: "Бесплатно — Доставка 1–2 рабочих дня" },
    { icon: "package", color: "primary", title: "Курьер по стране", text: "Бесплатно — Доставка 2–5 рабочих дней" },
    { icon: "globe", color: "primary", title: "Самовывоз", text: "Бесплатно — ул. Подгоренийлор 17, Кишинёв" },
  ]),
  h("Таблица доставки", "truck"),
  p("| Способ | Зона | Стоимость | Срок |\n| Курьер | Кишинёв | Бесплатно | 1–2 дня |\n| Курьер | Вся Молдова | Бесплатно | 2–5 дней |\n| Самовывоз | Магазин | Бесплатно | В тот же день* |"),
  h("Условия доставки", "clock"),
  p("• Заказы до 14:00 (пн–пт) отправляются в тот же день.\n• Бесплатная доставка по всей Молдове.\n• Проверяйте посылку при получении."),
  h("Возврат и возмещение", "globe"),
  p("Вы можете вернуть товар в течение 14 календарных дней с момента получения."),
  p("Условия возврата:\n• Товар должен быть в оригинальном состоянии\n• Упаковка должна быть полной и неповреждённой\n• Необходим чек или подтверждение покупки"),
  h("Гарантия", "shield"),
  p("Все товары имеют гарантию. Подробности на странице гарантии."),
];

// ─── WARRANTY ───────────────────────────────────────────────────────
const warrantyRo: Block[] = [
  h("Garanție", "shield"),
  cards(2, [
    { icon: "shield", color: "primary", title: "Produse noi", text: "12 luni — Garanție completă pentru toate produsele noi achiziționate de la Western Import." },
    { icon: "clock", color: "amber", title: "Produse refurbished", text: "6 luni — Garanție pentru produsele refurbished/testate, acoperind defecțiunile tehnice majore." },
  ]),
  h("Ce acoperă garanția", "check-circle"),
  p("• Defecțiuni de fabricație ale componentelor hardware\n• Probleme de funcționare apărute în condiții normale de utilizare\n• Defecțiuni ale ecranului (pixeli morți, linii, spoturi)\n• Probleme de alimentare sau încărcare nelegate la uzură\n• Defecțiuni ale porturilor și conectoarelor\n• Probleme software preinstalat (sistem de operare, drivere)\n• Defecțiuni ale tastaturii și trackpad-ului\n• Defecțiuni ale difuzoarelor, microfonului sau camerei web"),
  h("Ce NU acoperă garanția", "x-circle"),
  p("• Deteriorări cauzate de căderi, lovituri sau expunere la lichide\n• Deteriorări intenționate sau modificări neautorizate\n• Utilizarea produsului în afara parametrilor tehnici\n• Baterii cu capacitate redusă din uzură normală\n• Accesorii consumabile din afara kitului original\n• Probleme software cauzate de instalări ulterioare\n• Defecțiuni cauzate de viruși\n• Deteriorări estetice care nu afectează funcționalitatea\n• Reparații efectuate de terțe părți neautorizate\n• Utilizarea de accesorii necompatibile"),
  h("Procedura de service", "zap"),
  p("Pas 1: Contactați-ne — Sunați la +373 69 466 585 sau scrieți pe info@westernimport.md. Descrieți problema și furnizați numărul comenzii."),
  p("Pas 2: Diagnosticare — Echipa noastră va evalua problema și vă va confirma dacă este acoperită de garanție."),
  p("Pas 3: Predare produs — Aduceți produsul la sediul nostru din str. Podgorenilor 17 sau programați ridicarea prin curier (gratuit în garanție)."),
  p("Pas 4: Reparație sau înlocuire — Timpul de reparare: 5–15 zile lucrătoare. Dacă produsul nu poate fi reparat, vă oferim un produs echivalent sau rambursarea."),
  p("Pas 5: Returnare produs — Vă notificăm când produsul este gata și stabiliți modalitatea de returnare."),
  h("Termeni și condiții garanție", "shield"),
  p("• Garanția începe de la data achiziției, conform facturii.\n• Factura originală sau dovada achiziției este obligatorie.\n• Reparația nu prelungește perioada de garanție.\n• Piețele și componentele înlocuite devin proprietatea Western Import.\n• Western Import nu este responsabilă pentru pierderea datelor. Faceți backup înainte de predare.\n• Dacă problema nu este acoperită de garanție, costul diagnosticului este de 300 MDL."),
  h("Contact service", "headphones"),
  p("• Telefon service: +373 69 466 585\n• E-mail service: service@westernimport.md\n• Adresă: str. Podgorenilor 17, Chișinău\n• Program: Luni–Vineri: 09:00–18:00, Sâmbătă: 10:00–15:00"),
];

const warrantyRu: Block[] = [
  h("Гарантия", "shield"),
  cards(2, [
    { icon: "shield", color: "primary", title: "Новые товары", text: "12 месяцев — Полная гарантия на все новые товары." },
    { icon: "clock", color: "amber", title: "Восстановленные товары", text: "6 месяцев — Гарантия на восстановленные/протестированные товары." },
  ]),
  h("Что покрывает гарантия", "check-circle"),
  p("• Производственные дефекты аппаратных компонентов\n• Проблемы при нормальной эксплуатации\n• Дефекты экрана\n• Проблемы с питанием\n• Дефекты портов и разъёмов\n• Проблемы с предустановленным ПО"),
  h("Что НЕ покрывает гарантия", "x-circle"),
  p("• Повреждения от падений, ударов, жидкости\n• Намеренные повреждения\n• Использование вне технических параметров\n• Износ батареи\n• Повреждения вирусами\n• Ремонт неавторизованными лицами"),
  h("Процедура сервиса", "zap"),
  p("Шаг 1: Свяжитесь с нами — +373 69 466 585 или service@westernimport.md"),
  p("Шаг 2: Диагностика — Наша команда оценит проблему."),
  p("Шаг 3: Передача товара — ул. Подгоренийлор 17 или курьером (бесплатно по гарантии)."),
  p("Шаг 4: Ремонт или замена — 5–15 рабочих дней."),
  p("Шаг 5: Возврат товара — Уведомим вас, когда товар готов."),
  h("Условия гарантии", "shield"),
  p("• Гарантия начинается с даты покупки.\n• Оригинальный чек обязателен.\n• Ремонт не продлевает гарантию.\n• Резервное копирование данных — ответственность клиента.\n• Диагностика вне гарантии — 300 MDL."),
  h("Контакты сервиса", "headphones"),
  p("• Телефон: +373 69 466 585\n• E-mail: service@westernimport.md\n• Адрес: ул. Подгоренийлор 17, Кишинёв\n• Часы работы: Пн–Пт 09:00–18:00, Сб 10:00–15:00"),
];

// ─── PRIVACY ────────────────────────────────────────────────────────
const privacyRo: Block[] = [
  h("1. Introducere", "shield"),
  p("SRL Western Import respectă confidențialitatea datelor dumneavoastră personale și se angajează să le protejeze. Această Politică explică cum colectăm, utilizăm, stocăm și protejăm informațiile personale."),
  p("Prezenta politică este elaborată în conformitate cu GDPR și legislația Republicii Moldova privind protecția datelor cu caracter personal."),
  h("2. Ce date personale colectăm", "users"),
  p("Date furnizate de dumneavoastră:\n• Date de identitate: nume, prenume\n• Date de contact: adresă de e-mail, număr de telefon\n• Date de livrare: adresă completă\n• Date financiare: informații de plată (procesate exclusiv prin furnizorii de plăți)\n• Date de cont: parolă (stocată criptat), preferințe"),
  p("Date colectate automat:\n• Date tehnice: adresă IP, tip browser, sistem de operare\n• Date de navigare: pagini vizitate, timp pe pagină, sursa de trafic\n• Cookies și tehnologii similare"),
  h("3. Scopul colectării datelor", "target"),
  p("• Procesarea comenzilor: gestionarea, expedierea și livrarea produselor\n• Comunicare: confirmări de comandă, notificări de livrare\n• Gestionarea contului: istoric comenzi, favorite, setări\n• Suport clienți: întrebări, reclamații, returnări\n• Marketing: newsletter și oferte (doar cu acord prealabil)\n• Analiză și îmbunătățire a experienței\n• Securitate: prevenirea fraudei\n• Conformitate legală: obligații fiscale și contabile"),
  h("4. Baza legală a procesării", "shield"),
  p("• Executarea contractului — procesarea comenzilor (Art. 6(1)(b) GDPR)\n• Consimțământul — newsletter, cookies de marketing\n• Interesul legitim — analiza traficului, prevenirea fraudei\n• Obligația legală — facturi, evidențe contabile"),
  h("5. Drepturile dumneavoastră", "heart"),
  p("• Dreptul de acces — puteți solicita o copie a datelor personale\n• Dreptul de rectificare — corectarea datelor inexacte\n• Dreptul la ștergere („dreptul de a fi uitat\")\n• Dreptul la restricționarea procesării\n• Dreptul la portabilitate — exportul datelor\n• Dreptul de opoziție\n• Dreptul de a retrage consimțământul oricând"),
  p("Pentru a exercita aceste drepturi, contactați-ne la privacy@westernimport.md. Vom răspunde în maximum 30 de zile."),
  h("6. Cookies", "zap"),
  p("Site-ul utilizează cookies pentru a îmbunătăți experiența de navigare, a analiza traficul și a afișa conținut personalizat. Detalii în Politica Cookies."),
  h("7. Cu cine împărtășim datele", "users"),
  p("Nu vindem, nu închiriăm și nu comercializăm datele dumneavoastră. Le putem împărtăși cu:\n• Furnizori de servicii de livrare (doar date necesare livrării)\n• Procesatori de plăți (tranzacții securizate)\n• Instrumente de analiză (Google Analytics, date anonimizate)\n• Autorități publice (doar obligații legale)"),
  h("8. Stocarea și protecția datelor", "shield"),
  p("• Criptarea conexiunilor prin SSL/TLS (HTTPS)\n• Parole stocate sub formă hash (bcrypt)\n• Acces restricționat la datele personale\n• Backup-uri zilnice criptate\n• Audit periodic de securitate"),
  p("Păstrăm datele atât timp cât este necesar sau cât cere legislația (date fiscale: minimum 5 ani)."),
  h("9. Datele copiilor", "heart"),
  p("Site-ul nu este destinat persoanelor sub 18 ani și nu colectăm conștient date de la minori."),
  h("10. Ofițerul pentru protecția datelor (DPO)", "headphones"),
  p("E-mail: privacy@westernimport.md\nTelefon: +373 69 466 585\nAdresă: SRL Western Import, str. Podgorenilor 17, MD-2001, Chișinău, Republica Moldova"),
];

const privacyRu: Block[] = [
  h("1. Введение", "shield"),
  p("SRL Western Import уважает конфиденциальность ваших персональных данных. Настоящая Политика объясняет, как мы собираем, используем и защищаем вашу информацию."),
  h("2. Какие данные мы собираем", "users"),
  p("Данные, предоставленные вами: имя, e-mail, телефон, адрес доставки, платёжная информация.\nДанные, собираемые автоматически: IP-адрес, тип браузера, страницы посещений."),
  h("3. Цель сбора данных", "target"),
  p("• Обработка заказов и доставка\n• Коммуникация и поддержка\n• Управление аккаунтом\n• Маркетинг (только с согласия)\n• Анализ и улучшение сервиса\n• Безопасность и соблюдение закона"),
  h("4. Правовые основания", "shield"),
  p("• Исполнение договора\n• Согласие\n• Законный интерес\n• Юридическая обязанность"),
  h("5. Ваши права", "heart"),
  p("• Право доступа к данным\n• Право на исправление\n• Право на удаление\n• Право на ограничение обработки\n• Право на переносимость\n• Право на возражение\n• Право отозвать согласие"),
  p("Свяжитесь с нами: privacy@westernimport.md"),
  h("6. Cookies", "zap"),
  p("Сайт использует cookies для улучшения навигации и анализа трафика."),
  h("7. С кем мы делимся данными", "users"),
  p("Мы не продаём ваши данные. Делимся только со службами доставки, платёжными системами и аналитикой (анонимно)."),
  h("8. Хранение и защита данных", "shield"),
  p("• SSL/TLS шифрование\n• Хеширование паролей (bcrypt)\n• Ограниченный доступ\n• Ежедневное резервное копирование"),
  h("9. Данные детей", "heart"),
  p("Сайт не предназначен для лиц моложе 18 лет."),
  h("10. Ответственный за защиту данных", "headphones"),
  p("E-mail: privacy@westernimport.md\nТелефон: +373 69 466 585\nАдрес: SRL Western Import, ул. Подгоренийлор 17, Кишинёв"),
];

// ─── COOKIES ────────────────────────────────────────────────────────
const cookiesRo: Block[] = [
  h("1. Ce sunt cookies", "zap"),
  p("Cookies-urile sunt fișiere text mici stocate pe dispozitivul dumneavoastră atunci când vizitați un site web. Ele ajută site-ul să vă recunoască și să îmbunătățească experiența de navigare."),
  h("2. Cum folosim cookies", "target"),
  p("• Cookies esențiale: necesare pentru funcționarea Site-ului (autentificare, coș de cumpărături, securitate)\n• Cookies de performanță: analizează modul de utilizare a Site-ului (Google Analytics)\n• Cookies de funcționalitate: rețin preferințele (limbă, monedă, regiune)\n• Cookies de marketing: afișează reclame relevante"),
  h("3. Cum puteți gestiona cookies", "shield"),
  p("• Bannerul de cookies — la prima vizită puteți alege ce categorii acceptați\n• Setările browserului — majoritatea permit blocarea sau ștergerea cookies\n• Google Analytics Opt-out — addon-ul oficial\n• Network Advertising Initiative — opt-out de la cookies de marketing"),
  p("Instrucțiuni pe browser:\n• Google Chrome: Setări → Confidențialitate și securitate → Cookies\n• Mozilla Firefox: Opțiuni → Confidențialitate → Cookies\n• Safari: Preferințe → Confidențialitate → Cookies\n• Microsoft Edge: Setări → Cookies → Gestionare cookies"),
  h("4. Cookies terțe", "users"),
  p("Site-ul poate conține cookies de la terțe părți (Google Analytics, rețele de publicitate). Acestea sunt supuse politicilor de confidențialitate ale respectivilor furnizori."),
  h("5. Modificări", "globe"),
  p("Western Import poate actualiza această Politică Cookies periodic. Vă recomandăm să o consultați regulat."),
  h("6. Contact", "headphones"),
  p("Pentru întrebări: privacy@westernimport.md\nTelefon: +373 69 466 585"),
];

const cookiesRu: Block[] = [
  h("1. Что такое cookies", "zap"),
  p("Cookies — небольшие текстовые файлы, сохраняемые на вашем устройстве при посещении сайта. Они помогают сайту вас распознавать и улучшать навигацию."),
  h("2. Как мы используем cookies", "target"),
  p("• Основные cookies: авторизация, корзина, безопасность\n• Cookies производительности: Google Analytics\n• Cookies функциональности: язык, валюта, регион\n• Cookies маркетинга: релевантная реклама"),
  h("3. Управление cookies", "shield"),
  p("• Баннер cookies — выберите категории при первом посещении\n• Настройки браузера — блокировка и удаление\n• Google Analytics Opt-out\n• Network Advertising Initiative"),
  h("4. Сторонние cookies", "users"),
  p("Сайт может содержать cookies от третьих лиц (Google Analytics, рекламные сети)."),
  h("5. Изменения", "globe"),
  p("Western Import может обновлять данную политику. Рекомендуем проверять её регулярно."),
  h("6. Контакты", "headphones"),
  p("E-mail: privacy@westernimport.md\nТелефон: +373 69 466 585"),
];

// ─── FAQ (placeholder) ──────────────────────────────────────────────
const faqRo: Block[] = [
  h("Întrebări frecvente", "zap"),
  p("Întrebările frecvente sunt gestionate dinamic din admin. Adaugă întrebări și răspunsuri din secțiunea FAQ a panoului de administrare."),
];

const faqRu: Block[] = [
  h("Часто задаваемые вопросы", "zap"),
  p("FAQ управляется динамически из админ-панели."),
];

// ─── SEED ───────────────────────────────────────────────────────────
const allPages = [
  { slug: "about", titleRo: "Despre Noi", titleRu: "О нас", blocksRo: aboutRo, blocksRu: aboutRu },
  { slug: "terms", titleRo: "Termeni și Condiții", titleRu: "Условия и положения", blocksRo: termsRo, blocksRu: termsRu },
  { slug: "shipping", titleRo: "Livrare și Returnare", titleRu: "Доставка и возврат", blocksRo: shippingRo, blocksRu: shippingRu },
  { slug: "warranty", titleRo: "Garanție", titleRu: "Гарантия", blocksRo: warrantyRo, blocksRu: warrantyRu },
  { slug: "privacy", titleRo: "Politica de Confidențialitate", titleRu: "Политика конфиденциальности", blocksRo: privacyRo, blocksRu: privacyRu },
  { slug: "cookies", titleRo: "Politica Cookies", titleRu: "Политика Cookies", blocksRo: cookiesRo, blocksRu: cookiesRu },
  { slug: "faq", titleRo: "Întrebări Frecvente", titleRu: "Часто задаваемые вопросы", blocksRo: faqRo, blocksRu: faqRu },
];

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return NextResponse.json({ success: false, error: 'Neautorizat' }, { status: 401 });
    if (error === 'forbidden') return NextResponse.json({ success: false, error: 'Acces refuzat' }, { status: 403 });

    const results: string[] = [];

    for (const page of allPages) {
      const existing = await prisma.page.findUnique({ where: { slug: page.slug } });

      const data = {
        titleRo: page.titleRo,
        titleRu: page.titleRu,
        contentRo: JSON.stringify(page.blocksRo),
        contentRu: JSON.stringify(page.blocksRu),
        isPublished: true,
      };

      if (existing) {
        await prisma.page.update({ where: { slug: page.slug }, data });
        results.push(`✅ Updated: ${page.slug}`);
      } else {
        await prisma.page.create({ data: { slug: page.slug, ...data } });
        results.push(`✅ Created: ${page.slug}`);
      }
    }

    return NextResponse.json({ success: true, message: `Seed complet: ${allPages.length} pagini`, results });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: 'Eroare la seed' }, { status: 500 });
  }
}
