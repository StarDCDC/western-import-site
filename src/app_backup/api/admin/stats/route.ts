import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, serverErrorResponse } from '@/lib/utils';

// GET /api/admin/stats — dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return successResponse(null);
    if (error === 'forbidden') return successResponse(null);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalProducts,
      activeProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
      monthlyRevenue,
      recentOrders,
      pendingOrders,
      ordersByStatus,
      topProducts,
      salesLast7Days,
      newCustomers7d,
      outOfStockProducts,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { notIn: ['CANCELLED', 'REFUNDED'] }, createdAt: { gte: firstDayOfMonth } } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { take: 3 },
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
        where: { order: { status: { notIn: ['CANCELLED', 'REFUNDED'] } } },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { total: true, createdAt: true, status: true },
      }),
      prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: sevenDaysAgo } } }),
      prisma.product.count({ where: { stock: 0 } }),
    ]);

    // Enrich top products with names
    const topProductsWithInfo = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId! },
          select: { id: true, name: true, images: true, price: true },
        });
        return {
          ...product,
          totalSold: item._sum.quantity,
        };
      })
    );

    // Group sales by day for last 7 days
    const dailySales: Record<string, { orders: number; revenue: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      dailySales[key] = { orders: 0, revenue: 0 };
    }

    salesLast7Days.forEach((order) => {
      const key = order.createdAt.toISOString().split('T')[0];
      if (dailySales[key]) {
        dailySales[key].orders++;
        dailySales[key].revenue += Number(order.total);
      }
    });

    return successResponse({
      overview: {
        totalProducts,
        activeProducts,
        totalOrders,
        totalCustomers,
        totalRevenue: totalRevenue._sum.total || 0,
        monthlyRevenue: monthlyRevenue._sum.total || 0,
        pendingOrders,
        newCustomers7d,
        outOfStockProducts,
      },
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
      recentOrders,
      topProducts: topProductsWithInfo.filter(Boolean),
      dailySales,
    });
  } catch {
    return serverErrorResponse();
  }
}
