import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';
import * as XLSX from 'xlsx';

function parseCSV(buffer: Buffer): Record<string, unknown>[] {
  const text = buffer.toString('utf-8');
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, unknown> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
    rows.push(row);
  }
  return rows;
}

// POST /api/admin/products/import — import products from Excel
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return successResponse(null);
    if (error === 'forbidden') return successResponse(null);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return errorResponse('Fișier lipsă');

    const fileName = file.name.toLowerCase();
    let rows: Record<string, unknown>[];

    if (fileName.endsWith('.csv')) {
      const bytes = await file.arrayBuffer();
      rows = parseCSV(Buffer.from(bytes));
    } else {
      const bytes = await file.arrayBuffer();
      const workbook = XLSX.read(Buffer.from(bytes), { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
    }

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
      const specsRaw = String(row['Specs'] || row['specs'] || row['Specifications'] || '').trim();
      const condition = String(row['Condition'] || row['condition'] || 'NEW').trim().toUpperCase();
      const isActive = String(row['Active'] || row['active'] || 'Yes').trim().toLowerCase() === 'yes';
      const isFeatured = String(row['Featured'] || row['featured'] || 'No').trim().toLowerCase() === 'yes';

      // Build specs object from "key: value | key2: value2" format
      let specsObj: Record<string, string> | null = null;
      if (specsRaw) {
        specsObj = {};
        specsRaw.split('|').forEach((pair) => {
          const idx = pair.indexOf(':');
          if (idx > 0) {
            const k = pair.slice(0, idx).trim();
            const v = pair.slice(idx + 1).trim();
            if (k && v) specsObj![k] = v;
          }
        });
      }

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

      // Create product first
      const created = await prisma.product.create({
        data: {
          name,
          slug,
          price,
          stock,
          sku: sku || undefined,
          condition: ['NEW', 'REFURBISHED', 'USED'].includes(condition) ? condition : 'NEW',
          descriptionRo: description || null,
          descriptionRu: null,
          images: '[]',
          isActive,
          isFeatured,
          categoryId,
          brandId,
        },
      });

      // Create ProductSpec if specs were provided
      if (specsObj && Object.keys(specsObj).length > 0) {
        await prisma.productSpec.upsert({
          where: { productId: created.id },
          create: { productId: created.id, ...specsObj },
          update: specsObj,
        });
      }

      imported++;
    }

    return successResponse({ imported, skipped, total: rows.length });
  } catch (err) {
    console.error('Import error:', err);
    return serverErrorResponse();
  }
}
