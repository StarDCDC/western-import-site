import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimit } from '@/lib/rateLimit';
import { getClientIp, errorResponse } from '@/lib/utils';

const SPEC_FIELDS = ['display', 'storage', 'weight', 'refreshRate', 'ram', 'gpuModel', 'cpuModel', 'resolution', 'gpuSeries', 'cpuSeries', 'os', 'storageType', 'gpuType'] as const;

// GET /api/products/specs-filters — returns available filter values with counts
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(ip, { windowMs: 60000, maxRequests: 30 });
    if (!rl.allowed) {
      const { rateLimitResponse } = await import('@/lib/utils');
      return rateLimitResponse(rl.resetTime);
    }

    const { searchParams } = new URL(request.url);

    // Base filters from request
    const categoryId = searchParams.get('categoryId') || '';
    const brandId = searchParams.get('brandId') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const condition = searchParams.get('condition');
    const search = searchParams.get('search') || '';

    // Build base where clause (active products only)
    const baseWhere: Record<string, unknown> = { isActive: true };

    if (categoryId) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId)) {
        baseWhere.categoryId = categoryId;
      } else {
        const cat = await prisma.category.findFirst({ where: { slug: categoryId } });
        if (cat) baseWhere.categoryId = cat.id;
      }
    }
    if (brandId) baseWhere.brandId = brandId;
    if (condition) baseWhere.condition = condition;
    if (minPrice || maxPrice) {
      baseWhere.price = {
        ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
      };
    }
    if (search) {
      baseWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    // For each spec field, get distinct values with counts
    const filtersResult: Record<string, Record<string, number>> = {};

    for (const field of SPEC_FIELDS) {
      // Get all products that match base filters, group by spec field value
      const productsWithSpec = await prisma.product.findMany({
        where: baseWhere,
        select: { spec: { select: { [field]: true } } },
      });

      const valueCounts: Record<string, number> = {};
      for (const { spec } of productsWithSpec) {
        if (spec && (spec as any)[field]) {
          const val = (spec as any)[field] as string;
          valueCounts[val] = (valueCounts[val] || 0) + 1;
        }
      }

      // Sort by count descending
      const sorted = Object.entries(valueCounts)
        .sort((a, b) => b[1] - a[1])
        .reduce((acc, [val, count]) => {
          acc[val] = count;
          return acc;
        }, {} as Record<string, number>);

      filtersResult[field] = sorted;
    }

    return NextResponse.json({
      success: true,
      data: filtersResult,
    });
  } catch (error) {
    console.error('specs-filters error:', error);
    return errorResponse('Eroare la obținerea filtrelor', 500);
  }
}