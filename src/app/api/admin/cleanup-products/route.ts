import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';

// DELETE /api/admin/cleanup-products — remove seeded/fake products
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'ADMIN') {
      return errorResponse('Neautorizat', 401);
    }

    // Delete all products that came from seed (they have specific names)
    const seedNames = [
      'Acer Nitro V',
      'Lenovo ThinkPad X1 Yoga Gen 5',
      'Lenovo IdeaPad 3 15ITL05',
      'Lenovo ThinkPad P15',
      'Dell Latitude 5421',
      'MSI Thin GF63 12VF',
      'MacBook Pro 16" 2019',
      'Samsung Galaxy S21 FE',
      'iPhone 13',
      'Samsung Galaxy A54',
    ];

    const result = await prisma.product.deleteMany({
      where: {
        name: { in: seedNames },
      },
    });

    return successResponse({
      message: `Deleted ${result.count} seed products`,
      deleted: result.count,
    });
  } catch (e) {
    console.error('[CLEANUP] Error:', e);
    return serverErrorResponse();
  }
}
