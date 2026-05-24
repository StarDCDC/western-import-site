import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { errorResponse, serverErrorResponse } from '@/lib/utils';
import * as XLSX from 'xlsx';

// GET /api/admin/products/export — export products to Excel
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return errorResponse('Neautorizat', 401);
    if (error === 'forbidden') return errorResponse('Acces interzis', 403);

    const products = await prisma.product.findMany({
      include: { category: true, brand: true },
      orderBy: { createdAt: 'desc' },
    });

    const rows = products.map((p) => ({
      Name: p.name,
      Price: p.price,
      Stock: p.stock,
      Category: p.category?.nameRo || '',
      Brand: p.brand?.name || '',
      SKU: p.sku || '',
      Description: p.descriptionRo || '',
      Active: p.isActive ? 'Yes' : 'No',
      Featured: p.isFeatured ? 'Yes' : 'No',
      OldPrice: p.oldPrice || '',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Products');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="products-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return serverErrorResponse();
  }
}
