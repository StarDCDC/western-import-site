import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'freemen92@gmail.com' },
    update: {},
    create: {
      email: 'freemen92@gmail.com',
      name: 'Admin Western Import',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '+37369466585',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create categories
  const cats = [
    { nameRo: 'Laptopuri', nameRu: 'Ноутбуки', slug: 'laptopuri', order: 1 },
    { nameRo: 'Telefoane', nameRu: 'Телефоны', slug: 'telefoane', order: 2 },
    { nameRo: 'Mini PC', nameRu: 'Мини ПК', slug: 'mini-pc', order: 3 },
    { nameRo: 'Tablete', nameRu: 'Планшеты', slug: 'tablete', order: 4 },
  ];

  for (const cat of cats) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categories created:', cats.length);

  // Create brands
  const brandList = [
    { name: 'Samsung', slug: 'samsung' },
    { name: 'Apple', slug: 'apple' },
    { name: 'Lenovo', slug: 'lenovo' },
    { name: 'HP', slug: 'hp' },
    { name: 'Dell', slug: 'dell' },
    { name: 'Acer', slug: 'acer' },
    { name: 'MSI', slug: 'msi' },
    { name: 'Razer', slug: 'razer' },
    { name: 'Gigabyte', slug: 'gigabyte' },
    { name: 'Microsoft', slug: 'microsoft' },
    { name: 'Motorola', slug: 'motorola' },
    { name: 'Panasonic', slug: 'panasonic' },
  ];

  for (const brand of brandList) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
  }
  console.log('✅ Brands created:', brandList.length);

  // Get category and brand IDs
  const laptopCat = await prisma.category.findUnique({ where: { slug: 'laptopuri' } });
  const phoneCat = await prisma.category.findUnique({ where: { slug: 'telefoane' } });
  const pcCat = await prisma.category.findUnique({ where: { slug: 'mini-pc' } });

  const acerBrand = await prisma.brand.findUnique({ where: { slug: 'acer' } });
  const lenovoBrand = await prisma.brand.findUnique({ where: { slug: 'lenovo' } });
  const dellBrand = await prisma.brand.findUnique({ where: { slug: 'dell' } });
  const msiBrand = await prisma.brand.findUnique({ where: { slug: 'msi' } });
  const appleBrand = await prisma.brand.findUnique({ where: { slug: 'apple' } });

  // Create products
  const products = [
    {
      name: 'Acer Nitro V',
      slug: 'acer-nitro-v',
      descriptionRo: 'Laptop gaming performant cu procesor AMD Ryzen 7 260 și placa video NVIDIA RTX 5070. Display de 16" cu 180Hz pentru o experiență de gaming fluidă.',
      descriptionRu: 'Мощный игровой ноутбук с процессором AMD Ryzen 7 260 и видеокартой NVIDIA RTX 5070. Дисплей 16" с 180Hz.',
      price: 29500,
      oldPrice: 32700,
      stock: 5,
      condition: 'NEW',
      categoryId: laptopCat!.id,
      brandId: acerBrand!.id,
      images: '[]',
      specs: JSON.stringify({ procesor: 'Ryzen 7 260', display: '16.0" 180Hz', ram: '16GB', stocare: '1TB SSD', gpu: 'RTX 5070', os: 'Windows 11' }),
      isFeatured: true,
    },
    {
      name: 'Lenovo ThinkPad X1 Yoga Gen 5',
      slug: 'lenovo-thinkpad-x1-yoga-gen-5',
      descriptionRo: 'ThinkPad X1 Yoga Gen 5 — laptop business premium cu ecran tactil și conectivitate LTE.',
      descriptionRu: 'ThinkPad X1 Yoga Gen 5 — премиальный бизнес-ноутбук с сенсорным экраном и LTE.',
      price: 6200,
      oldPrice: 6990,
      stock: 3,
      condition: 'REFURBISHED',
      categoryId: laptopCat!.id,
      brandId: lenovoBrand!.id,
      images: '[]',
      specs: JSON.stringify({ procesor: 'i5-10210U', display: '14" Touch', ram: '8GB', stocare: '128GB SSD', gpu: 'Intel UHD', os: 'Windows 10 Pro' }),
      isFeatured: true,
    },
    {
      name: 'Lenovo IdeaPad 3 15ITL05',
      slug: 'lenovo-ideapad-3-15itl05',
      descriptionRo: 'Laptop accesibil pentru uz zilnic — navigare, documente, streaming.',
      descriptionRu: 'Доступный ноутбук для повседневного использования.',
      price: 2990,
      oldPrice: 3699,
      stock: 8,
      condition: 'REFURBISHED',
      categoryId: laptopCat!.id,
      brandId: lenovoBrand!.id,
      images: '[]',
      specs: JSON.stringify({ procesor: 'i3-1115G4', display: '15.6" FHD', ram: '4GB', stocare: '128GB SSD', os: 'Windows 11' }),
      isFeatured: false,
    },
    {
      name: 'Lenovo ThinkPad P15',
      slug: 'lenovo-thinkpad-p15',
      descriptionRo: 'Workstation profesional cu NVIDIA Quadro T1000 — ideal pentru CAD, 3D modeling.',
      descriptionRu: 'Профессиональная рабочая станция с NVIDIA Quadro T1000.',
      price: 10990,
      oldPrice: 13500,
      stock: 2,
      condition: 'REFURBISHED',
      categoryId: laptopCat!.id,
      brandId: lenovoBrand!.id,
      images: '[]',
      specs: JSON.stringify({ procesor: 'i7-10750H', display: '15.6" FHD', ram: '16GB', stocare: '512GB SSD', gpu: 'Quadro T1000', os: 'Windows 10 Pro' }),
      isFeatured: true,
    },
    {
      name: 'Dell Latitude 5421',
      slug: 'dell-latitude-5421',
      descriptionRo: 'Dell Latitude robust și performant. i7 Gen 11 cu 16GB RAM — ideal pentru mediul corporate.',
      descriptionRu: 'Надёжный и производительный Dell Latitude. i7 Gen 11 с 16GB RAM.',
      price: 6900,
      oldPrice: 7200,
      stock: 4,
      condition: 'REFURBISHED',
      categoryId: laptopCat!.id,
      brandId: dellBrand!.id,
      images: '[]',
      specs: JSON.stringify({ procesor: 'i7-11850H', display: '14" FHD', ram: '16GB', stocare: '256GB SSD', os: 'Windows 11 Pro' }),
      isFeatured: false,
    },
    {
      name: 'MSI Thin GF63 12VF',
      slug: 'msi-thin-gf63-12vf',
      descriptionRo: 'Laptop gaming cu RTX 4060 și ecran 144Hz. Performanță excelentă pentru jocurile moderne.',
      descriptionRu: 'Игровой ноутбук с RTX 4060 и экраном 144Hz.',
      price: 14500,
      oldPrice: 14990,
      stock: 3,
      condition: 'REFURBISHED',
      categoryId: laptopCat!.id,
      brandId: msiBrand!.id,
      images: '[]',
      specs: JSON.stringify({ procesor: 'i5-12450H', display: '15.6" FHD 144Hz', ram: '16GB', stocare: '512GB SSD', gpu: 'RTX 4060', os: 'Windows 11' }),
      isFeatured: true,
    },
    {
      name: 'MacBook Pro 16" 2019',
      slug: 'macbook-pro-16-2019',
      descriptionRo: 'MacBook Pro 16" cu ecran Retina spectaculos. Ideal pentru design, video editing și muzică.',
      descriptionRu: 'MacBook Pro 16" с великолепным дисплеем Retina. Идеально для дизайна и видеомонтажа.',
      price: 9500,
      oldPrice: 11900,
      stock: 2,
      condition: 'REFURBISHED',
      categoryId: laptopCat!.id,
      brandId: appleBrand!.id,
      images: '[]',
      specs: JSON.stringify({ procesor: 'i7-9750H', display: '16" Retina', ram: '16GB', stocare: '512GB SSD', gpu: 'Radeon Pro 5300M', os: 'macOS Sonoma' }),
      isFeatured: true,
    },
    {
      name: 'Acer Aspire 3 A317',
      slug: 'acer-aspire-3-a317',
      descriptionRo: 'Acer Aspire 3 cu ecran mare de 17.3" — ideal pentru entertainment și lucru.',
      descriptionRu: 'Acer Aspire 3 с большим экраном 17.3" — идеально для развлечений и работы.',
      price: 7200,
      oldPrice: null,
      stock: 6,
      condition: 'REFURBISHED',
      categoryId: laptopCat!.id,
      brandId: acerBrand!.id,
      images: '[]',
      specs: JSON.stringify({ procesor: 'i5-1235U', display: '17.3" FHD', ram: '16GB', stocare: '512GB SSD', gpu: 'Intel Iris Xe', os: 'Windows 11' }),
      isFeatured: false,
    },
    {
      name: 'iPhone 13 Pro',
      slug: 'iphone-13-pro',
      descriptionRo: 'iPhone 13 Pro refurbished în stare excelentă. Camera pro cu 3 lentile, ecran ProMotion 120Hz.',
      descriptionRu: 'iPhone 13 Pro восстановленный в отличном состоянии. Камера Pro с 3 объективами, ProMotion 120Hz.',
      price: 8990,
      oldPrice: 10500,
      stock: 4,
      condition: 'REFURBISHED',
      categoryId: phoneCat!.id,
      brandId: appleBrand!.id,
      images: '[]',
      specs: JSON.stringify({ procesor: 'A15 Bionic', display: '6.1" Super Retina XDR', ram: '6GB', stocare: '128GB', os: 'iOS 17' }),
      isFeatured: true,
    },
    {
      name: 'iPhone 16e',
      slug: 'iphone-16e',
      descriptionRo: 'iPhone 16e cu chip A18 — performanță de top la un preț accesibil.',
      descriptionRu: 'iPhone 16e с чипом A18 — топовая производительность по доступной цене.',
      price: 9500,
      oldPrice: 11505,
      stock: 3,
      condition: 'REFURBISHED',
      categoryId: phoneCat!.id,
      brandId: appleBrand!.id,
      images: '[]',
      specs: JSON.stringify({ procesor: 'A18', display: '6.1" Super Retina XDR', ram: '8GB', stocare: '128GB', os: 'iOS 18' }),
      isFeatured: true,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
  console.log('✅ Products created:', products.length);

  // Create banners
  const banners = [
    {
      title: 'Laptopuri Gaming',
      subtitle: 'Până la -20% pe laptopuri gaming',
      image: '/banner1.jpg',
      link: '/catalog?category=laptopuri',
      buttonText: 'Vezi Oferte',
      position: 'HERO',
      order: 1,
      isActive: true,
    },
    {
      title: 'iPhone Refurbished',
      subtitle: 'Calitate garantată la prețuri accesibile',
      image: '/banner2.png',
      link: '/catalog?category=telefoane',
      buttonText: 'Descoperă',
      position: 'HERO',
      order: 2,
      isActive: true,
    },
    {
      title: 'Transport Gratuit',
      subtitle: 'La comenzi peste 3000 MDL',
      image: '/banner3.png',
      link: '/shipping',
      buttonText: 'Detalii',
      position: 'HERO',
      order: 3,
      isActive: true,
    },
    {
      title: 'Laptopuri Gaming',
      subtitle: 'De la 2990 MDL',
      image: 'https://i.picrd.com/images/abMIHW72sm6.jpg',
      link: '/catalog?category=laptopuri',
      buttonText: 'Vezi oferta',
      position: 'SIDEBAR',
      order: 1,
      isActive: true,
    },
    {
      title: 'iPhone Recondiționat',
      subtitle: 'Garanție 12 luni',
      image: 'https://i.picrd.com/images/NTy1Am6S6YV.jpg',
      link: '/catalog?category=telefoane',
      buttonText: 'Descoperă',
      position: 'SIDEBAR',
      order: 2,
      isActive: true,
    },
  ];

  for (const banner of banners) {
    await prisma.banner.create({ data: banner });
  }
  console.log('✅ Banners created:', banners.length);

  // Create work schedule
  const schedule = [
    { dayOfWeek: 'monday', dayNameRo: 'Luni', dayNameRu: 'Понедельник', isOpen: true, startTime: '09:00', endTime: '18:00', order: 1 },
    { dayOfWeek: 'tuesday', dayNameRo: 'Marți', dayNameRu: 'Вторник', isOpen: true, startTime: '09:00', endTime: '18:00', order: 2 },
    { dayOfWeek: 'wednesday', dayNameRo: 'Miercuri', dayNameRu: 'Среда', isOpen: true, startTime: '09:00', endTime: '18:00', order: 3 },
    { dayOfWeek: 'thursday', dayNameRo: 'Joi', dayNameRu: 'Четверг', isOpen: true, startTime: '09:00', endTime: '18:00', order: 4 },
    { dayOfWeek: 'friday', dayNameRo: 'Vineri', dayNameRu: 'Пятница', isOpen: true, startTime: '09:00', endTime: '18:00', order: 5 },
    { dayOfWeek: 'saturday', dayNameRo: 'Sâmbătă', dayNameRu: 'Суббота', isOpen: true, startTime: '10:00', endTime: '16:00', order: 6 },
    { dayOfWeek: 'sunday', dayNameRo: 'Duminică', dayNameRu: 'Воскресенье', isOpen: false, startTime: null, endTime: null, order: 7 },
  ];

  for (const day of schedule) {
    await prisma.workSchedule.create({ data: day });
  }
  console.log('✅ Work schedule created:', schedule.length);

  // Create default settings
  const settings = [
    { key: 'site_name', value: 'Western Import' },
    { key: 'site_phone', value: '+37369466585' },
    { key: 'site_email', value: 'info@westernimport.md' },
    { key: 'site_address', value: 'Strada Podgorenilor 17, Chișinău' },
    { key: 'free_shipping_min', value: '3000' },
    { key: 'currency', value: 'MDL' },
    { key: 'iute_credit_enabled', value: 'true' },
    { key: 'iute_credit_min_amount', value: '1000' },
    { key: 'chatbot_enabled', value: 'true' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('✅ Settings created:', settings.length);

  // Create legal pages with full content
  const pages = [
    {
      slug: 'privacy',
      titleRo: 'Politica de Confidențialitate',
      titleRu: 'Политика конфиденциальности',
      contentRo: '<h2>Politica de Confidențialitate</h2><p>Western Import respectă confidențialitatea clienților săi. Datele personale colectate sunt folosite exclusiv pentru procesarea comenzilor și îmbunătățirea serviciilor noastre.</p><p>NU vindem, NU schimbăm și NU transferăm datele tale personale către terțe părți fără notificare.</p>',
      contentRu: '<h2>Политика конфиденциальности</h2><p>Western Import уважает конфиденциальность своих клиентов. Собранные личные данные используются исключительно для обработки заказов и улучшения наших услуг.</p>',
      isPublished: true,
    },
    {
      slug: 'terms',
      titleRo: 'Termeni și Condiții',
      titleRu: 'Условия и положения',
      contentRo: '<h2>1. Dispoziții generale</h2><p>Prezentul document stabilește termenii și condițiile de utilizare a site-ului westernimport.md, proprietatea SRL Western Import, înregistrată în Chișinău, Republica Moldova, sediul social str. Podgorenilor 17, Chișinău.</p><p>Accesarea și utilizarea Site-ului implică acceptarea integrală a prezentului document. Vârsta minimă pentru efectuarea de achiziții este de 18 ani.</p><h2>2. Conturi utilizatori</h2><p>Pentru a plasa comenzi pe Site, utilizatorul trebuie să creeze un cont furnizând date personale reale și complete: nume complet, adresă de e-mail, număr de telefon și adresă de livrare.</p><ul><li>Utilizatorul este singurul responsabil pentru păstrarea confidențialității datelor de autentificare.</li><li>Orice activitate realizată din contul utilizatorului este considerată ca fiind efectuată de acesta.</li><li>Western Import își rezervă dreptul de a suspenda sau șterge conturi care încalcă acești termeni.</li></ul><h2>3. Produse și prețuri</h2><p>Prețurile afișate pe Site sunt exprimate în Lei moldovenești (MDL) și includ TVA.</p><ul><li>În cazul unei erori evidente de preț, Western Import poate anula comanda și va notifica clientul în maximum 24 de ore.</li><li>Stocul este actualizat în timp real.</li><li>Promoțiile sunt valabile în perioada specificată și nu se cumulează decât dacă este menționat explicit.</li></ul><h2>4. Procesul de comandă</h2><p>Plasarea unei comenzi presupune: selectarea produselor, adăugarea în coș, completarea datelor de livrare, alegerea metodei de plată și confirmarea comenzii.</p><ul><li>După confirmare, clientul primește un e-mail cu detaliile comenzii.</li><li>Western Import poate refuza o comandă în caz de suspiciune de fraudă sau încălcare a termenilor.</li><li>Clientul poate anula o comandă gratuit înainte de expedierea produsului.</li></ul><h2>5. Metode de plată</h2><ul><li><strong>Numerar la livrare</strong> — plata se efectuează curierului la primirea coletului.</li><li><strong>Card bancar online</strong> — Visa, MasterCard, procesare securizată.</li><li><strong>Transfer bancar</strong> — datele de plată vor fi trimise pe e-mail după confirmarea comenzii.</li></ul><p>Plățile online sunt procesate prin conexiuni securizate (SSL/TLS).</p><h2>6. Livrare</h2><p>Livrarea se face exclusiv pe teritoriul Republicii Moldova. Livrare <strong>gratuită</strong> oriunde în Moldova.</p><h2>7. Returnare și rambursare</h2><p>Conform legislației Republicii Moldova, clientul are dreptul de a returna produsul în termen de <strong>14 zile calendaristice</strong> de la primire.</p><ul><li>Produsul trebuie să fie în starea originală, neutilizat și în ambalajul intact.</li><li>Rambursarea se efectuează în maximum 14 zile lucrătoare de la primirea produsului returnat.</li></ul><h2>8. Proprietate intelectuală</h2><p>Tot conținutul Site-ului este proprietatea Western Import sau a licențiatorilor săi și este protejat de legislația privind drepturile de autor.</p><h2>9. Limitarea răspunderii</h2><p>Western Import depune eforturi rezonabile pentru a asigura exactitatea informațiilor, dar nu oferă garanții explicite sau implicite privind disponibilitatea neîntreruptă a Site-ului.</p><h2>10. Forța majoră</h2><p>Western Import nu va fi responsabilă pentru întârzieri cauzate de evenimente independente de voința sa.</p><h2>11. Legi aplicabile</h2><p>Prezentul document este guvernat de legislația Republicii Moldova.</p><h2>12. Contact</h2><ul><li><strong>E-mail:</strong> info@westernimport.md</li><li><strong>Telefon:</strong> +373 69 466 585</li><li><strong>Adresă:</strong> str. Podgorenilor 17, Chișinău, Republica Moldova</li></ul>',
      contentRu: '<h2>1. Общие положения</h2><p>Настоящий документ устанавливает условия использования сайта westernimport.md, собственность SRL Western Import, зарегистрированной в Кишинёве, Республика Молдова, юридический адрес: ул. Подгоренилор 17, Кишинёв.</p><p>Использование Сайта означает полное согласие с настоящим документом. Минимальный возраст для покупок — 18 лет.</p><h2>2. Учётные записи</h2><p>Для оформления заказа необходимо создать учётную запись с реальными личными данными.</p><h2>3. Товары и цены</h2><p>Цены указаны в молдавских леях (MDL) и включают НДС.</p><h2>4. Процесс заказа</h2><p>Оформление заказа включает: выбор товаров, добавление в корзину, заполнение данных доставки, выбор способа оплаты и подтверждение заказа.</p><h2>5. Способы оплаты</h2><ul><li><strong>Наличные при получении</strong></li><li><strong>Банковская карта онлайн</strong> — Visa, MasterCard</li><li><strong>Банковский перевод</strong></li></ul><h2>6. Доставка</h2><p>Доставка осуществляется только по территории Республики Молдова. Доставка <strong>бесплатная</strong> по всей Молдове.</p><h2>7. Возврат и возмещение</h2><p>Согласно законодательству Республики Молдова, клиент имеет право вернуть товар в течение <strong>14 календарных дней</strong> с момента получения.</p><h2>8. Интеллектуальная собственность</h2><p>Все материалы сайта являются собственностью Western Import.</p><h2>9. Ограничение ответственности</h2><h2>10. Форс-мажор</h2><h2>11. Применимое законодательство</h2><p>Настоящий документ регулируется законодательством Республики Молдова.</p><h2>12. Контакты</h2><ul><li><strong>Email:</strong> info@westernimport.md</li><li><strong>Телефон:</strong> +373 69 466 585</li><li><strong>Адрес:</strong> ул. Подгоренилор 17, Кишинёв</li></ul>',
      isPublished: true,
    },
    {
      slug: 'cookies',
      titleRo: 'Politica Cookies',
      titleRu: 'Политика Cookies',
      contentRo: '<h2>Politica Cookies</h2><p>Acest site folosește cookies pentru a îmbunătăți experiența de navigare. Cookies-urile sunt fișiere mici stocate pe dispozitivul tău.</p><p>Poți gestiona preferințele de cookies în setările browser-ului tău.</p>',
      contentRu: '<h2>Политика Cookies</h2><p>Этот сайт использует cookies для улучшения опыта навигации. Cookies — это небольшие файлы, хранящиеся на вашем устройстве.</p>',
      isPublished: true,
    },
    {
      slug: 'warranty',
      titleRo: 'Garanție',
      titleRu: 'Гарантия',
      contentRo: '<h2>Perioade de garanție</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px"><div style="padding:24px;background:rgba(37,99,235,0.1);border-radius:12px;border:1px solid rgba(37,99,235,0.2)"><h3 style="font-size:20px;font-weight:bold;margin-bottom:8px">Produse noi</h3><p style="font-size:28px;font-weight:800;color:#2563eb">12 luni</p><p style="font-size:14px;margin-top:8px">Garanție completă pentru toate produsele noi achiziționate de la Western Import.</p></div><div style="padding:24px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0"><h3 style="font-size:20px;font-weight:bold;margin-bottom:8px">Produse refurbished</h3><p style="font-size:28px;font-weight:800;color:#64748b">6 luni</p><p style="font-size:14px;margin-top:8px">Garanție pentru produsele refurbished/testate, acoperind defecțiunile tehnice majore.</p></div></div><h2>Ce acoperă garanția</h2><ul><li>Defecțiuni de fabricație ale componentelor hardware</li><li>Probleme de funcționare apărute în condiții normale de utilizare</li><li>Defecțiuni ale ecranului (pixeli morți, linii, spoturi)</li><li>Probleme de alimentare sau încărcare nelegate la uzură</li><li>Defecțiuni ale porturilor și conectoarelor</li><li>Probleme software preinstalat</li><li>Defecțiuni ale tastaturii și trackpad-ului</li><li>Defecțiuni ale difuzoarelor, microfonului sau camerei web</li></ul><h2>Ce NU acoperă garanția</h2><ul><li>Deteriorări cauzate de căderi, lovituri sau expunere la lichide</li><li>Deteriorări intenționate sau modificări neautorizate</li><li>Baterii cu capacitate redusă din uzură normală</li><li>Probleme software cauzate de instalări ulterioare</li><li>Reparații efectuate de terțe părți neautorizate</li></ul><h2>Procedura de service</h2><ol><li><strong>Contactați-ne:</strong> Sunați la +373 69 466 585 sau scrieți pe info@westernimport.md.</li><li><strong>Diagnosticare:</strong> Echipa noastră va evalua problema și vă va confirma dacă este acoperită de garanție.</li><li><strong>Predare produs:</strong> Aduceți produsul la sediul nostru din str. Podgorenilor 17, Chișinău.</li><li><strong>Reparație sau înlocuire:</strong> Timpul de reparare: 5–15 zile lucrătoare.</li><li><strong>Returnare produs:</strong> Vă notificăm când produsul este gata.</li></ol><h2>Termeni garanție</h2><ul><li>Garanția începe de la data achiziției, conform facturii.</li><li>Factura originală este obligatorie.</li><li>Reparația nu prelungește perioada de garanție.</li><li>Western Import nu este responsabilă pentru pierderea datelor.</li></ul><h2>Contact service</h2><ul><li><strong>Telefon:</strong> +373 69 466 585</li><li><strong>E-mail:</strong> service@westernimport.md</li><li><strong>Adresă:</strong> str. Podgorenilor 17, Chișinău</li><li><strong>Program:</strong> Luni–Vineri: 09:00–18:00, Sâmbătă: 10:00–15:00</li></ul>',
      contentRu: '<h2>Сроки гарантии</h2><p><strong>Новые товары — 12 месяцев.</strong> Полная гарантия на все новые товары.</p><p><strong>Восстановленные товары — 6 месяцев.</strong> Гарантия на основные технические неисправности.</p><h2>Что покрывает гарантия</h2><ul><li>Производственные дефекты компонентов</li><li>Проблемы работы в нормальных условиях</li><li>Дефекты экрана</li><li>Проблемы питания или зарядки</li><li>Дефекты портов и разъёмов</li><li>Проблемы предустановленного ПО</li></ul><h2>Что НЕ покрывает гарантия</h2><ul><li>Повреждения от падений, ударов или жидкостей</li><li>Намеренные повреждения или несанкционированные модификации</li><li>Батарея с пониженной ёмкостью из-за нормального износа</li><li>Проблемы ПО от сторонних установок</li></ul><h2>Процедура сервиса</h2><ol><li><strong>Свяжитесь с нами:</strong> +373 69 466 585 или service@westernimport.md</li><li><strong>Диагностика:</strong> Наша команда оценит проблему</li><li><strong>Передача товара:</strong> ул. Подгоренилор 17, Кишинёв</li><li><strong>Ремонт или замена:</strong> 5–15 рабочих дней</li><li><strong>Возврат товара:</strong> Мы уведомим вас, когда товар будет готов</li></ol><h2>Контакты сервиса</h2><ul><li><strong>Телефон:</strong> +373 69 466 585</li><li><strong>Email:</strong> service@westernimport.md</li><li><strong>Адрес:</strong> ул. Подгоренилор 17, Кишинёв</li><li><strong>График:</strong> Пн–Пт: 09:00–18:00, Сб: 10:00–15:00</li></ul>',
      isPublished: true,
    },
    {
      slug: 'shipping',
      titleRo: 'Livrare și Returnare',
      titleRu: 'Доставка и возврат',
      contentRo: '<h2>Metode de livrare</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px"><div style="padding:20px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0"><h3 style="font-weight:bold;margin-bottom:4px">Curier Chișinău</h3><p style="font-size:14px">Gratuit</p><p style="font-size:12px;margin-top:4px">Livrare în 1–2 zile lucrătoare</p></div><div style="padding:20px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0"><h3 style="font-weight:bold;margin-bottom:4px">Curier național</h3><p style="font-size:14px">Gratuit</p><p style="font-size:12px;margin-top:4px">Livrare în 2–5 zile lucrătoare</p></div><div style="padding:20px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0"><h3 style="font-weight:bold;margin-bottom:4px">Ridicare din magazin</h3><p style="font-size:14px">Gratuit</p><p style="font-size:12px;margin-top:4px">str. Podgorenilor 17, Chișinău</p></div></div><h2>Detalii despre livrare</h2><ul><li>Comenzile plasate până la ora 14:00 (luni–vineri) sunt expediate în aceeași zi.</li><li>Comenzile plasate vineri după 14:00, sâmbătă sau duminică sunt expediate luni.</li><li>Livrare <strong>gratuită</strong> oriunde în Moldova, indiferent de suma comenzii.</li><li>Verificați coletul la primire. Dacă observați deteriorări, semnați proces-verbal cu curierul.</li><li>Livrarea se face doar pe teritoriul Republicii Moldova.</li></ul><h2>Returnare și rambursare</h2><p>Aveți dreptul de a returna produsele în termen de <strong>14 zile calendaristice</strong> de la primirea coletului.</p><h3>Condiții de returnare</h3><ul><li>Produsul trebuie să fie în starea originală, neutilizat și nedeteriorat.</li><li>Ambalajul trebuie să fie complet și intact.</li><li>Factura sau dovada achiziției trebuie inclusă.</li><li>Produsele cu software activat nu pot fi returnate.</li></ul><h3>Procedura de returnare</h3><ol><li>Contactați-ne la <strong>+373 69 466 585</strong> sau <strong>info@westernimport.md</strong> pentru număr de autorizație (RMA).</li><li>Pregătiți produsul în ambalajul original cu toate accesoriile și factura.</li><li>Adresați-vă la sediu sau programați ridicarea prin curier (cost: 150 MDL).</li><li>Echipa noastră va inspecta produsul în maximum 3 zile lucrătoare.</li><li>Rambursarea prin aceeași metodă de plată, în maximum 14 zile lucrătoare.</li></ol><h3>Produse care NU pot fi returnate</h3><ul><li>Software desigilat sau licențe activate</li><li>Produse personalizate sau gravate</li><li>Consumabile desigilate</li><li>Produse cu defecțiuni cauzate de utilizare incorectă</li></ul>',
      contentRu: '<h2>Способы доставки</h2><p><strong>Курьер Кишинёв</strong> — Бесплатно, 1–2 рабочих дня</p><p><strong>Курьер по стране</strong> — Бесплатно, 2–5 рабочих дней</p><p><strong>Самовывоз</strong> — Бесплатно, ул. Подгоренилор 17, Кишинёв</p><h2>Детали доставки</h2><ul><li>Заказы, оформленные до 14:00 (пн–пт), отправляются в тот же день.</li><li>Доставка <strong>бесплатная</strong> по всей Молдове.</li><li>Доставка только по территории Республики Молдова.</li></ul><h2>Возврат и возмещение</h2><p>Вы имеете право вернуть товар в течение <strong>14 календарных дней</strong> с момента получения.</p><h3>Условия возврата</h3><ul><li>Товар должен быть в оригинальном состоянии, неиспользованный.</li><li>Упаковка должна быть полной и неповреждённой.</li><li>Необходим чек или подтверждение покупки.</li></ul><h3>Процедура возврата</h3><ol><li>Свяжитесь с нами: <strong>+373 69 466 585</strong> или <strong>info@westernimport.md</strong> для получения номера авторизации (RMA).</li><li>Подготовьте товар в оригинальной упаковке.</li><li>Привезите товар или закажите курьера (стоимость: 150 MDL).</li><li>Мы осмотрим товар в течение 3 рабочих дней.</li><li>Возмещение тем же способом оплаты в течение 14 рабочих дней.</li></ol><h3>Товары, которые НЕ подлежат возврату</h3><ul><li>Вскрытое ПО или активированные лицензии</li><li>Персонализированные товары</li><li>Вскрытые расходные материалы</li><li>Товары с дефектами от неправильного использования</li></ul>',
      isPublished: true,
    },
    {
      slug: 'about',
      titleRo: 'Despre Noi',
      titleRu: 'О нас',
      contentRo: '<h2>Povestea noastră</h2><p>Western Import s-a născut în 2023 dintr-o simplă observație: moldovenii merită acces la electronică de calitate la prețuri corecte, fără compromisuri. Am pornit de la un magazin mic pe o stradă liniștită din Chișinău, cu un laptop pe masă și o determinare uriașă.</p><p>De ce „Western"? Pentru că aducem produse din occident — laptopuri, telefoane, monitoare și componente — seleculate cu grijă, testate minuțios și oferite cu garanție reală. Nu vindem „înghesuit", nu vindem „la noroc". Fiecare produs trece prin mâinile noastre înainte să ajungă la tine.</p><p>Astăzi, după 3 ani pe piață, suntem mândri de fiecare client mulțumit. Nu suntem cel mai mare magazin din Moldova — și nici nu dorim să fim. Preferăm să fim cel mai de încredere.</p><h2>Misiune și valori</h2><div style="padding:20px;background:rgba(37,99,235,0.05);border-radius:12px;border:1px solid rgba(37,99,235,0.2);margin-bottom:24px"><p style="font-size:18px;font-style:italic">„Să oferim fiecărui moldovean acces la tehnologie de calitate, la un preț corect, susținut de un serviciu clienți de excepție."</p></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px"><div><h3>Integritate</h3><p>Ce promitem, livrăm. Fără surprize ascunse, fără prețuri manipulative.</p></div><div><h3>Calitate</h3><p>Fiecare produs e testat înainte de vânzare. Nu facem compromisuri.</p></div><div><h3>Transparență</h3><p>Stările produselor sunt descrise clar. Știm ce vindem și de unde vine.</p></div><div><h3>Comunitate</h3><p>Clienții noștri sunt vecini, prieteni, colegi. Îi tratăm ca atare.</p></div></div><h2>Western Import în cifre</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;text-align:center"><div style="padding:20px;background:#f8fafc;border-radius:12px"><p style="font-size:28px;font-weight:800">1000+</p><p style="font-size:14px">Clienți mulțumiți</p></div><div style="padding:20px;background:#f8fafc;border-radius:12px"><p style="font-size:28px;font-weight:800">500+</p><p style="font-size:14px">Produse în catalog</p></div><div style="padding:20px;background:#f8fafc;border-radius:12px"><p style="font-size:28px;font-weight:800">3</p><p style="font-size:14px">Ani pe piață</p></div></div><h2>De ce Western Import?</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px"><div style="padding:20px;border:1px solid #e2e8f0;border-radius:12px"><h3>Calitate verificată</h3><p>Fiecare produs e testat individual de tehnicienii noștri.</p></div><div style="padding:20px;border:1px solid #e2e8f0;border-radius:12px"><h3>Prețuri corecte</h3><p>Negociem direct cu furnizorii din UE și SUA. Fără intermediari.</p></div><div style="padding:20px;border:1px solid #e2e8f0;border-radius:12px"><h3>Garanție reală</h3><p>12 luni pentru produse noi, 6 luni pentru refurbished. Service propriu.</p></div><div style="padding:20px;border:1px solid #e2e8f0;border-radius:12px"><h3>Suport dedicat</h3><p>Vorbești cu oameni reali, care cunosc produsele. Răspundem în maxim 2 ore.</p></div></div><h2>Echipa</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;text-align:center"><div style="padding:20px;background:#f8fafc;border-radius:12px"><div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#60a5fa);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:20px;margin:0 auto 12px">VI</div><h3>Victor I.</h3><p>Fondator & CEO</p></div><div style="padding:20px;background:#f8fafc;border-radius:12px"><div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#4ade80,#10b981);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:20px;margin:0 auto 12px">AM</div><h3>Andrei M.</h3><p>Tehnician șef</p></div><div style="padding:20px;background:#f8fafc;border-radius:12px"><div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#a78bfa,#ec4899);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:20px;margin:0 auto 12px">EC</div><h3>Elena C.</h3><p>Suport clienți</p></div></div>',
      contentRu: '<h2>Наша история</h2><p>Western Import родился в 2023 году из простого наблюдения: молдаване заслуживают доступа к качественной электронике по справедливым ценам. Мы начали с маленького магазина на тихой улице в Кишинёве.</p><p>Почему «Western»? Потому что мы привозим продукцию с Запада — ноутбуки, телефоны, мониторы и компоненты — тщательно отобранные, тщательно протестированные и с реальной гарантией.</p><p>Спустя 3 года на рынке мы гордимся каждым довольным клиентом. Мы не самый большой магазин в Молдове — и не стремимся быть таковым. Предпочитаем быть самыми надёжными.</p><h2>Миссия и ценности</h2><p style="font-size:18px;font-style:italic;padding:20px;background:rgba(37,99,235,0.05);border-radius:12px">«Предоставить каждому молдаванину доступ к качественным технологиям по справедливой цене, подкреплённым исключительным обслуживанием.»</p><h2>Western Import в цифрах</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;text-align:center;margin-bottom:24px"><div style="padding:20px;background:#f8fafc;border-radius:12px"><p style="font-size:28px;font-weight:800">1000+</p><p>Довольных клиентов</p></div><div style="padding:20px;background:#f8fafc;border-radius:12px"><p style="font-size:28px;font-weight:800">500+</p><p>Товаров в каталоге</p></div><div style="padding:20px;background:#f8fafc;border-radius:12px"><p style="font-size:28px;font-weight:800">3</p><p>Года на рынке</p></div></div><h2>Почему Western Import?</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px"><div style="padding:20px;border:1px solid #e2e8f0;border-radius:12px"><h3>Проверенное качество</h3><p>Каждый товар тестируется нашими техниками.</p></div><div style="padding:20px;border:1px solid #e2e8f0;border-radius:12px"><h3>Справедливые цены</h3><p>Прямые переговоры с поставщиками из ЕС и США.</p></div><div style="padding:20px;border:1px solid #e2e8f0;border-radius:12px"><h3>Реальная гарантия</h3><p>12 месяцев для новых, 6 месяцев для восстановленных.</p></div><div style="padding:20px;border:1px solid #e2e8f0;border-radius:12px"><h3>Поддержка</h3><p>Отвечаем в течение 2 часов.</p></div></div><h2>Команда</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;text-align:center"><div style="padding:20px;background:#f8fafc;border-radius:12px"><h3>Виктор И.</h3><p>Основатель и CEO</p></div><div style="padding:20px;background:#f8fafc;border-radius:12px"><h3>Андрей М.</h3><p>Главный техник</p></div><div style="padding:20px;background:#f8fafc;border-radius:12px"><h3>Елена К.</h3><p>Поддержка клиентов</p></div></div>',
      isPublished: true,
    },
    {
      slug: 'contact',
      titleRo: 'Contact',
      titleRu: 'Контакты',
      contentRo: '<h2>Contactează-ne</h2><div style="display:grid;gap:16px;margin-bottom:24px"><div style="display:flex;align-items:center;gap:12px;padding:12px;background:#f8fafc;border-radius:12px"><strong>📞 Telefon:</strong> <a href="tel:+37369466585">+373 69 466 585</a> — Luni - Sâmbătă, 10:00 - 18:00</div><div style="display:flex;align-items:center;gap:12px;padding:12px;background:#f8fafc;border-radius:12px"><strong>📧 Email:</strong> <a href="mailto:info@westernimport.md">info@westernimport.md</a> — Răspundem în 24h</div><div style="display:flex;align-items:center;gap:12px;padding:12px;background:#f8fafc;border-radius:12px"><strong>📍 Adresă:</strong> Strada Podgorenilor 17, Chișinău, Moldova</div></div><h2>Program Magazin</h2><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">Luni</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600">10:00 - 18:00</td></tr><tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">Marți</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600">10:00 - 18:00</td></tr><tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">Miercuri</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600">10:00 - 18:00</td></tr><tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">Joi</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600">10:00 - 18:00</td></tr><tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">Vineri</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600">10:00 - 18:00</td></tr><tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">Sâmbătă</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600">10:00 - 18:00</td></tr><tr><td style="padding:8px">Duminică</td><td style="padding:8px;text-align:right;font-weight:600">10:00 - 16:00</td></tr></table>',
      contentRu: '<h2>Свяжитесь с нами</h2><div style="display:grid;gap:16px;margin-bottom:24px"><div style="display:flex;align-items:center;gap:12px;padding:12px;background:#f8fafc;border-radius:12px"><strong>📞 Телефон:</strong> <a href="tel:+37369466585">+373 69 466 585</a> — Понедельник - Суббота, 10:00 - 18:00</div><div style="display:flex;align-items:center;gap:12px;padding:12px;background:#f8fafc;border-radius:12px"><strong>📧 Email:</strong> <a href="mailto:info@westernimport.md">info@westernimport.md</a> — Отвечаем в течение 24ч</div><div style="display:flex;align-items:center;gap:12px;padding:12px;background:#f8fafc;border-radius:12px"><strong>📍 Адрес:</strong> ул. Подгоренилор 17, Кишинёв, Молдова</div></div><h2>График работы</h2><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">Понедельник</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600">10:00 - 18:00</td></tr><tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">Вторник</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600">10:00 - 18:00</td></tr><tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">Среда</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600">10:00 - 18:00</td></tr><tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">Четверг</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600">10:00 - 18:00</td></tr><tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">Пятница</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600">10:00 - 18:00</td></tr><tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">Суббота</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600">10:00 - 18:00</td></tr><tr><td style="padding:8px">Воскресенье</td><td style="padding:8px;text-align:right;font-weight:600">10:00 - 16:00</td></tr></table>',
      isPublished: true,
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {
        titleRo: page.titleRo,
        titleRu: page.titleRu,
        contentRo: page.contentRo,
        contentRu: page.contentRu,
        isPublished: page.isPublished,
      },
      create: page,
    });
  }
  console.log('✅ Pages created:', pages.length);

  console.log('\n🎉 Seed completed successfully!');
  console.log('📧 Admin: freemen92@gmail.com / Admin123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
