// scripts/migrate-to-pg.ts
// Run AFTER prisma migrate deploy on the new PostgreSQL DB
// This reads data from SQLite backup JSON and seeds PostgreSQL

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface SqliteRow { [key: string]: string | number | null }

function querySqlite(sql: string): SqliteRow[] {
  const result = execSync(`sqlite3 prisma/dev.db "${sql}" -json -header`, { encoding: 'utf-8' });
  if (!result.trim()) return [];
  return JSON.parse(result);
}

async function migrate() {
  console.log('🔄 Migrare SQLite → PostgreSQL...\n');

  // 1. Categories
  const categories = querySqlite('SELECT * FROM categories ORDER BY "order"');
  for (const c of categories) {
    await prisma.category.upsert({
      where: { id: c.id as string },
      update: {},
      create: {
        id: c.id as string,
        nameRo: c.nameRo as string,
        nameRu: c.nameRu as string,
        slug: c.slug as string,
        description: (c.description as string) || null,
        image: (c.image as string) || null,
        parentId: (c.parentId as string) || null,
        order: Number(c.order) || 0,
        isActive: Boolean(c.isActive),
      },
    });
  }
  console.log(`✅ Categories: ${categories.length}`);

  // 2. Brands
  const brands = querySqlite('SELECT * FROM brands');
  for (const b of brands) {
    await prisma.brand.upsert({
      where: { id: b.id as string },
      update: {},
      create: {
        id: b.id as string,
        name: b.name as string,
        slug: b.slug as string,
        logo: (b.logo as string) || null,
        description: (b.description as string) || null,
      },
    });
  }
  console.log(`✅ Brands: ${brands.length}`);

  // 3. Products
  const products = querySqlite('SELECT * FROM products');
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id as string },
      update: {},
      create: {
        id: p.id as string,
        name: p.name as string,
        slug: p.slug as string,
        descriptionRo: (p.descriptionRo as string) || null,
        descriptionRu: (p.descriptionRu as string) || null,
        price: Number(p.price),
        oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
        stock: Number(p.stock) || 0,
        sku: (p.sku as string) || null,
        condition: (p.condition as string) || 'NEW',
        images: p.images as string,
        specs: (p.specs as string) || null,
        isActive: Boolean(p.isActive),
        isFeatured: Boolean(p.isFeatured),
        categoryId: p.categoryId as string,
        brandId: p.brandId as string,
        createdAt: p.createdAt ? new Date(p.createdAt as string) : new Date(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt as string) : new Date(),
      },
    });
  }
  console.log(`✅ Products: ${products.length}`);

  // 4. ProductSpecs
  const specs = querySqlite('SELECT * FROM product_specs');
  for (const s of specs) {
    await prisma.productSpec.upsert({
      where: { id: s.id as string },
      update: {},
      create: {
        id: s.id as string,
        productId: s.productId as string,
        display: (s.display as string) || null,
        storage: (s.storage as string) || null,
        weight: (s.weight as string) || null,
        refreshRate: (s.refreshRate as string) || null,
        ram: (s.ram as string) || null,
        gpuModel: (s.gpuModel as string) || null,
        cpuModel: (s.cpuModel as string) || null,
        resolution: (s.resolution as string) || null,
        gpuSeries: (s.gpuSeries as string) || null,
        cpuSeries: (s.cpuSeries as string) || null,
        os: (s.os as string) || null,
        storageType: (s.storageType as string) || null,
        gpuType: (s.gpuType as string) || null,
      },
    });
  }
  console.log(`✅ ProductSpecs: ${specs.length}`);

  // 5. Users
  const users = querySqlite('SELECT * FROM users');
  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id as string },
      update: {},
      create: {
        id: u.id as string,
        name: (u.name as string) || null,
        email: u.email as string,
        password: (u.password as string) || null,
        role: (u.role as string) || 'CUSTOMER',
        phone: (u.phone as string) || null,
        address: (u.address as string) || null,
        createdAt: u.createdAt ? new Date(u.createdAt as string) : new Date(),
        updatedAt: u.updatedAt ? new Date(u.updatedAt as string) : new Date(),
      },
    });
  }
  console.log(`✅ Users: ${users.length}`);

  // 6. Settings
  const settings = querySqlite('SELECT * FROM settings');
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { id: s.id as string },
      update: {},
      create: {
        id: s.id as string,
        key: s.key as string,
        value: s.value as string,
      },
    });
  }
  console.log(`✅ Settings: ${settings.length}`);

  // 7. Banners
  const banners = querySqlite('SELECT * FROM banners');
  for (const b of banners) {
    await prisma.banner.upsert({
      where: { id: b.id as string },
      update: {},
      create: {
        id: b.id as string,
        title: b.title as string,
        subtitle: (b.subtitle as string) || null,
        image: b.image as string,
        link: (b.link as string) || null,
        buttonText: (b.buttonText as string) || null,
        position: (b.position as string) || 'HERO',
        order: Number(b.order) || 0,
        isActive: Boolean(b.isActive),
        startDate: b.startDate ? new Date(b.startDate as string) : null,
        endDate: b.endDate ? new Date(b.endDate as string) : null,
      },
    });
  }
  console.log(`✅ Banners: ${banners.length}`);

  // 8. FAQs
  const faqs = querySqlite('SELECT * FROM faqs');
  for (const f of faqs) {
    await prisma.fAQ.upsert({
      where: { id: f.id as string },
      update: {},
      create: {
        id: f.id as string,
        question: f.question as string,
        answer: f.answer as string,
        order: Number(f.order) || 0,
        isActive: Boolean(f.isActive),
      },
    });
  }
  console.log(`✅ FAQs: ${faqs.length}`);

  // 9. WorkSchedule
  const schedules = querySqlite('SELECT * FROM work_schedule');
  for (const ws of schedules) {
    await prisma.workSchedule.upsert({
      where: { id: ws.id as string },
      update: {},
      create: {
        id: ws.id as string,
        dayOfWeek: ws.dayOfWeek as string,
        dayNameRo: ws.dayNameRo as string,
        dayNameRu: ws.dayNameRu as string,
        isOpen: Boolean(ws.isOpen),
        startTime: (ws.startTime as string) || null,
        endTime: (ws.endTime as string) || null,
        specialHours: (ws.specialHours as string) || null,
        order: Number(ws.order) || 0,
        isActive: Boolean(ws.isActive),
      },
    });
  }
  console.log(`✅ WorkSchedule: ${schedules.length}`);

  console.log('\n🎉 Migrare completă!');
  await prisma.$disconnect();
}

migrate().catch((e) => {
  console.error('❌ Eroare migrare:', e);
  process.exit(1);
});
