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
    { nameRo: 'PC & Monitoare', nameRu: 'ПК и Мониторы', slug: 'pc-monitoare', order: 3 },
    { nameRo: 'Tablete', nameRu: 'Планшеты', slug: 'tablete', order: 4 },
    { nameRo: 'Componente', nameRu: 'Компоненты', slug: 'componente', order: 5 },
    { nameRo: 'Accesorii', nameRu: 'Аксессуары', slug: 'accesorii', order: 6 },
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
  const pcCat = await prisma.category.findUnique({ where: { slug: 'pc-monitoare' } });

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

  // Create legal pages
  const pages = [
    { slug: 'privacy', titleRo: 'Politica de Confidențialitate', titleRu: 'Политика конфиденциальности', contentRo: '<h1>Politica de Confidențialitate</h1><p>Western Import respectă confidențialitatea clienților săi...</p>', contentRu: '<h1>Политика конфиденциальности</h1><p>Western Import уважает конфиденциальность своих клиентов...</p>', isPublished: true },
    { slug: 'terms', titleRo: 'Termeni și Condiții', titleRu: 'Условия и положения', contentRo: '<h1>Termeni și Condiții</h1><p>Prin accesarea acestui site sunteți de acord cu termenii și condițiile...</p>', contentRu: '<h1>Условия и положения</h1><p>Получая доступ к этому сайту, вы соглашаетесь с условиями...</p>', isPublished: true },
    { slug: 'cookies', titleRo: 'Politica Cookies', titleRu: 'Политика Cookies', contentRo: '<h1>Politica Cookies</h1><p>Acest site folosește cookies pentru a îmbunătăți experiența...</p>', contentRu: '<h1>Политика Cookies</h1><p>Этот сайт использует cookies для улучшения опыта...</p>', isPublished: true },
    { slug: 'warranty', titleRo: 'Garanție', titleRu: 'Гарантия', contentRo: '<h1>Garanție</h1><p>Toate produsele Western Import au garanție de la 3 la 24 luni...</p>', contentRu: '<h1>Гарантия</h1><p>Все продукты Western Import имеют гарантию от 3 до 24 месяцев...</p>', isPublished: true },
    { slug: 'shipping', titleRo: 'Livrare și Retur', titleRu: 'Доставка и возврат', contentRo: '<h1>Livrare și Retur</h1><p>Livrare gratuită pentru comenzi peste 3000 MDL...</p>', contentRu: '<h1>Доставка и возврат</h1><p>Бесплатная доставка для заказов свыше 3000 MDL...</p>', isPublished: true },
    { slug: 'about', titleRo: 'Despre Noi', titleRu: 'О нас', contentRo: '<h1>Despre Western Import</h1><p>Western Import — magazinul tău de electronică premium din Chișinău...</p>', contentRu: '<h1>О Western Import</h1><p>Western Import — ваш магазин премиальной электроники в Кишинёве...</p>', isPublished: true },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
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
