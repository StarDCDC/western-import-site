// scripts/seed-pages.ts — Import company pages from footer into admin/pages
// Run: npx ts-node --compiler-options {"module":"CommonJS"} scripts/seed-pages.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pages = [
  {
    slug: 'about',
    titleRo: 'Despre Noi',
    titleRu: 'О нас',
    contentRo: '<h2>Povestea noastră</h2><p>Western Import s-a născut în 2023 dintr-o simplă observație: moldovenii merită acces la electronică de calitate la prețuri corecte, fără compromisuri.</p>',
    contentRu: '<h2>Наша история</h2><p>Western Import родился в 2023 году из простого наблюдения: молдаване заслуживают доступа к качественной электронике по справедливым ценам.</p>',
    isPublished: true,
  },
  {
    slug: 'contact',
    titleRo: 'Contact',
    titleRu: 'Контакты',
    contentRo: '<h2>Contactează-ne</h2><p><strong>📞 Telefon:</strong> +373 69 466 585</p><p><strong>📧 Email:</strong> info@westernimport.md</p><p><strong>📍 Adresă:</strong> Strada Podgorenilor 17, Chișinău</p>',
    contentRu: '<h2>Свяжитесь с нами</h2><p><strong>📞 Телефон:</strong> +373 69 466 585</p><p><strong>📧 Email:</strong> info@westernimport.md</p><p><strong>📍 Адрес:</strong> ул. Подгоренилор 17, Кишинёв</p>',
    isPublished: true,
  },
  {
    slug: 'terms',
    titleRo: 'Termeni și Condiții',
    titleRu: 'Условия и положения',
    contentRo: '<h2>Termeni și Condiții</h2><p>Prin utilizarea acestui site, sunteți de acord cu următorii termeni și condiții.</p>',
    contentRu: '<h2>Условия и положения</h2><p>Используя этот сайт, вы соглашаетесь со следующими условиями.</p>',
    isPublished: true,
  },
  {
    slug: 'shipping',
    titleRo: 'Livrare și Returnare',
    titleRu: 'Доставка и возврат',
    contentRo: '<h2>Metode de livrare</h2><p><strong>Curier Chișinău</strong> — Gratuit, 1–2 zile lucrătoare</p><p><strong>Curier național</strong> — Gratuit, 2–5 zile lucrătoare</p><p><strong>Ridicare din magazin</strong> — Gratuit, str. Podgorenilor 17</p>',
    contentRu: '<h2>Способы доставки</h2><p><strong>Курьер Кишинёв</strong> — Бесплатно, 1–2 рабочих дня</p><p><strong>Курьер по стране</strong> — Бесплатно, 2–5 рабочих дней</p><p><strong>Самовывоз</strong> — Бесплатно, ул. Подгоренилор 17</p>',
    isPublished: true,
  },
  {
    slug: 'warranty',
    titleRo: 'Garanție',
    titleRu: 'Гарантия',
    contentRo: '<h2>Perioade de garanție</h2><p><strong>Produse noi — 12 luni.</strong> Garanție completă.</p><p><strong>Produse refurbished — 6 luni.</strong> Garanție pentru defecțiuni tehnice majore.</p>',
    contentRu: '<h2>Сроки гарантии</h2><p><strong>Новые товары — 12 месяцев.</strong> Полная гарантия.</p><p><strong>Восстановленные товары — 6 месяцев.</strong> Гарантия на основные технические неисправности.</p>',
    isPublished: true,
  },
  {
    slug: 'cookies',
    titleRo: 'Politica Cookies',
    titleRu: 'Политика Cookies',
    contentRo: '<h2>Politica Cookies</h2><p>Acest site utilizează cookies pentru a îmbunătăți experiența de navigare.</p>',
    contentRu: '<h2>Политика Cookies</h2><p>Этот сайт использует cookies для улучшения опыта навигации.</p>',
    isPublished: true,
  },
];

async function main() {
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
    console.log(`✅ Upserted page: ${page.slug}`);
  }
  console.log(`\n🎉 Done! ${pages.length} pages seeded.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
