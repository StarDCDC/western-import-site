import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.NEXTAUTH_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    let created = 0;

    // Admin user
    if (data.admin) {
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      await prisma.user.upsert({
        where: { email: data.admin.email },
        update: {},
        create: { ...data.admin, password: hashedPassword },
      });
      created++;
    }

    // Categories
    if (data.categories) {
      for (const c of data.categories) {
        await prisma.category.upsert({ where: { id: c.id }, update: c, create: c });
        created++;
      }
    }

    // Brands
    if (data.brands) {
      for (const b of data.brands) {
        await prisma.brand.upsert({ where: { id: b.id }, update: {}, create: b });
        created++;
      }
    }

    // Products
    if (data.products) {
      for (const p of data.products) {
        const { spec, ...productData } = p;
        await prisma.product.upsert({ where: { id: p.id }, update: {}, create: productData });
        if (spec) {
          await prisma.productSpec.upsert({ where: { id: spec.id }, update: {}, create: spec });
        }
        created++;
      }
    }

    // Settings
    if (data.settings) {
      for (const s of data.settings) {
        await prisma.setting.upsert({ where: { id: s.id }, update: {}, create: s });
        created++;
      }
    }

    // Banners
    if (data.banners) {
      for (const b of data.banners) {
        await prisma.banner.upsert({ where: { id: b.id }, update: {}, create: b });
        created++;
      }
    }

    // FAQs
    if (data.faqs) {
      for (const f of data.faqs) {
        await prisma.fAQ.upsert({ where: { id: f.id }, update: {}, create: f });
        created++;
      }
    }

    // Work Schedule
    if (data.workSchedule) {
      for (const ws of data.workSchedule) {
        await prisma.workSchedule.upsert({ where: { id: ws.id }, update: {}, create: ws });
        created++;
      }
    }

    return NextResponse.json({ success: true, created });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
