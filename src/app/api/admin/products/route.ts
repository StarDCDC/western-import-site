import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { translateToRu } from '@/lib/translate';
import { requireAdmin } from '@/lib/auth';

const productSchema = z.object({
  name: z.string().min(2, 'Nume este obligatoriu'),
  slug: z.string().min(2, 'Slug este obligatoriu'),
  descriptionRo: z.string().optional(),
  descriptionRu: z.string().optional(),
  price: z.number().min(0, 'Preț trebuie să fie pozitiv'),
  oldPrice: z.number().optional(),
  stock: z.number().int().min(0, 'Stoc trebuie să fie pozitiv'),
  sku: z.string().optional(),
  condition: z.enum(['NEW', 'REFURBISHED', 'USED']).default('NEW'),
  categoryId: z.string().min(1, 'Categorie obligatorie'),
  brandId: z.string().min(1, 'Brand obligatorie'),
  images: z.string().default('[]'),
  specs: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

async function adminGuard(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error === 'unauthorized') return { ok: false, status: 401 };
  if (error === 'forbidden') return { ok: false, status: 403 };
  return { ok: true };
}

export async function GET(request: NextRequest) {
  try {
    const guard = await adminGuard(request);
    if (!guard.ok) return NextResponse.json({ success: false, error: 'Neautorizat' }, { status: guard.status });

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const condition = searchParams.get('condition') || '';
    const isActive = searchParams.get('isActive') || null;
    const skip = (page - 1) * limit;

    let whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) whereClause.categoryId = category;
    if (brand) whereClause.brandId = brand;
    if (condition) whereClause.condition = condition as any;
    if (isActive !== null) whereClause.isActive = isActive === 'true';

    const sortParam = searchParams.get('sort') || 'createdAt';
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where: whereClause, include: { category: true, brand: true }, orderBy: { [sortParam]: 'desc' }, skip, take: limit }),
      prisma.product.count({ where: whereClause }),
    ]);

    return NextResponse.json({ success: true, data: products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Admin products GET error:', error);
    return NextResponse.json({ success: false, error: 'Eroare la încărcarea produselor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const guard = await adminGuard(request);
    if (!guard.ok) return NextResponse.json({ success: false, error: 'Neautorizat' }, { status: guard.status });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID lipsă' }, { status: 400 });

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Produs șters' });
  } catch (error) {
    console.error('Admin products DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Eroare la ștergere' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const guard = await adminGuard(request);
    if (!guard.ok) return NextResponse.json({ success: false, error: 'Neautorizat' }, { status: guard.status });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID lipsă' }, { status: 400 });

    const body = await request.json();
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.descriptionRo !== undefined) updateData.descriptionRo = body.descriptionRo;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.oldPrice !== undefined) updateData.oldPrice = body.oldPrice;
    if (body.stock !== undefined) updateData.stock = body.stock;
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.condition !== undefined) updateData.condition = body.condition;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.brandId !== undefined) updateData.brandId = body.brandId;
    if (body.images !== undefined) {
      const imgs = typeof body.images === 'string' ? JSON.parse(body.images) : body.images;
      updateData.images = JSON.stringify(imgs);
    }
    if (body.specs !== undefined) {
      const sp = typeof body.specs === 'string' ? JSON.parse(body.specs) : body.specs;
      updateData.specs = JSON.stringify(sp);
    }
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;

    const specFields = ['display', 'storage', 'weight', 'refreshRate', 'ram', 'gpuModel', 'cpuModel', 'resolution', 'gpuSeries', 'cpuSeries', 'os', 'storageType', 'gpuType'] as const;
    const specData: Record<string, string> = {};
    for (const f of specFields) {
      if (body[f] !== undefined && body[f] !== null && body[f] !== '') specData[f] = body[f];
    }
    if (Object.keys(specData).length > 0) {
      await prisma.productSpec.upsert({ where: { productId: id }, create: { productId: id, ...specData }, update: specData });
    }
    if (body.descriptionRo && !body.descriptionRu) {
      updateData.descriptionRu = await translateToRu(body.descriptionRo);
    }

    const product = await prisma.product.update({ where: { id }, data: updateData, include: { category: true, brand: true, spec: true } });
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Admin products PUT error:', error);
    return NextResponse.json({ success: false, error: 'Eroare la actualizare' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await adminGuard(request);
    if (!guard.ok) return NextResponse.json({ success: false, error: 'Neautorizat' }, { status: guard.status });

    const body = await request.json();
    const validated = productSchema.parse(body);

    let descriptionRu = validated.descriptionRu;
    if (!descriptionRu && validated.descriptionRo) {
      descriptionRu = await translateToRu(validated.descriptionRo);
    }

    const specFields = ['display', 'storage', 'weight', 'refreshRate', 'ram', 'gpuModel', 'cpuModel', 'resolution', 'gpuSeries', 'cpuSeries', 'os', 'storageType', 'gpuType'] as const;
    const specData: Record<string, string> = {};
    for (const f of specFields) {
      if (body[f] !== undefined && body[f] !== null && body[f] !== '') specData[f] = body[f];
    }
    const hasSpec = Object.keys(specData).length > 0;

    const imagesRaw = typeof validated.images === 'string' ? validated.images : JSON.stringify(validated.images);
    const specsRaw = validated.specs ? (typeof validated.specs === 'string' ? validated.specs : JSON.stringify(validated.specs)) : null;

    const productData: Record<string, unknown> = {
      name: validated.name, slug: validated.slug,
      descriptionRo: validated.descriptionRo ?? null, descriptionRu: descriptionRu ?? null,
      price: validated.price, oldPrice: validated.oldPrice ?? null,
      stock: validated.stock, sku: validated.sku ?? null,
      condition: validated.condition,
      images: imagesRaw,
      specs: specsRaw,
      isActive: validated.isActive, isFeatured: validated.isFeatured,
      categoryId: validated.categoryId, brandId: validated.brandId,
    };
    if (hasSpec) productData.spec = { create: specData };

    const product = await prisma.product.create({ data: productData as Parameters<typeof prisma.product.create>[0]['data'], include: { category: true, brand: true, spec: true } });
    return NextResponse.json({ success: true, data: product, message: 'Produs creat cu succes' });
  } catch (error) {
    console.error('Admin products POST error:', error);
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: 'Date invalide', details: error.issues }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Eroare la creare produs' }, { status: 500 });
  }
}