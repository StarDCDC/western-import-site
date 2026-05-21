import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
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

// GET /api/admin/products - List with filters, pagination, search
export async function GET(request: NextRequest) {
  try {
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

    if (category) {
      whereClause.categoryId = category;
    }

    if (brand) {
      whereClause.brandId = brand;
    }

    if (condition) {
      whereClause.condition = condition as any;
    }

    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }

    console.log('[AdminProducts] Querying with whereClause:', whereClause);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
          brand: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where: whereClause }),
    ]);
    console.log('[AdminProducts] Found:', total, 'products');

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin products GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Eroare la încărcarea produselor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = productSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        ...validated,
        images: JSON.stringify(validated.images),
        specs: validated.specs ? JSON.stringify(validated.specs) : null,
      },
      include: {
        category: true,
        brand: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Produs creat cu succes',
    });
  } catch (error) {
    console.error('Admin products POST error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Date invalide', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Eroare la creare produs' },
      { status: 500 }
    );
  }
}
