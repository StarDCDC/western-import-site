import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';
import * as XLSX from 'xlsx';

// POST /api/admin/products/import — import products from Excel
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return successResponse(null);
    if (error === 'forbidden') return successResponse(null);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return errorResponse('Fișier lipsă');

    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(Buffer.from(bytes), { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    if (rows.length === 0) return errorResponse('Fișierul este gol');

    // Find or create default category and brand
    let defaultCategory = await prisma.category.findFirst();
    if (!defaultCategory) {
      defaultCategory = await prisma.category.create({
        data: { nameRo: 'Importate', nameRu: 'Импортированные', slug: 'importate' },
      });
    }

    let defaultBrand = await prisma.brand.findFirst();
    if (!defaultBrand) {
      defaultBrand = await prisma.brand.create({
        data: { name: 'Generic', slug: 'generic' },
      });
    }

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      const name = String(row['Name'] || row['name'] || row['Nume'] || '').trim();
      if (!name) { skipped++; continue; }

      const price = parseFloat(String(row['Price'] || row['price'] || row['Pret'] || row['Preț'] || '0'));
      if (price <= 0) { skipped++; continue; }

      const stock = parseInt(String(row['Stock'] || row['stock'] || row['Stoc'] || '0'), 10);
      const categoryName = String(row['Category'] || row['category'] || row['Categorie'] || '').trim();
      const brandName = String(row['Brand'] || row['brand'] || '').trim();
      const sku = String(row['SKU'] || row['sku'] || '').trim();
      const description = String(row['Description'] || row['description'] || row['Descriere'] || '').trim();

      // Find or create category
      let categoryId = defaultCategory.id;
      if (categoryName) {
        const existingCat = await prisma.category.findFirst({
          where: { OR: [{ nameRo: categoryName }, { slug: categoryName.toLowerCase().replace(/\s+/g, '-') }] },
        });
        if (existingCat) {
          categoryId = existingCat.id;
        } else {
          const newCat = await prisma.category.create({
            data: {
              nameRo: categoryName,
              nameRu: categoryName,
              slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            },
          });
          categoryId = newCat.id;
        }
      }

      // Find or create brand
      let brandId = defaultBrand.id;
      if (brandName) {
        const existingBrand = await prisma.brand.findFirst({ where: { name: brandName } });
        if (existingBrand) {
          brandId = existingBrand.id;
        } else {
          const newBrand = await prisma.brand.create({
            data: { name: brandName, slug: brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') },
          });
          brandId = newBrand.id;
        }
      }

      // Generate slug
      const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let slug = slugBase;
      const existingProduct = await prisma.product.findUnique({ where: { slug } });
      if (existingProduct) {
        slug = `${slugBase}-${Date.now()}`;
      }

      await prisma.product.create({
        data: {
          name,
          slug,
          price,
          stock,
          sku: sku || undefined,
          descriptionRo: description || null,
          descriptionRu: null,
          images: '[]',
          categoryId,
          brandId,
        },
      });
      imported++;
    }

    return successResponse({ imported, skipped, total: rows.length });
  } catch (err) {
    console.error('Import error:', err);
    return serverErrorResponse();
  }
}
