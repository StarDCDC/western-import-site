import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';

// /api/admin/seed-pages — run seed for pages if missing
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      return errorResponse('Neautorizat', 401);
    }

    // Check if pages already exist
    const existing = await prisma.page.count();

    if (existing > 0) {
      return successResponse({
        message: 'Pages already exist',
        count: existing,
      });
    }

    // Seed pages
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

    return successResponse({
      message: 'Pages created successfully',
      count: pages.length,
      pages: pages.map(p => ({ slug: p.slug, titleRo: p.titleRo, titleRu: p.titleRu })),
    }, 201);
  } catch (e) {
    console.error('[SEED-PAGES] Error:', e);
    return serverErrorResponse();
  }
}
