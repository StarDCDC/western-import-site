import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categories — simplified version
export async function GET() {
  try {
    console.log('[Categories API] Starting query...');
    
    // Simple categories query without complex includes
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    
    console.log('[Categories API] Found categories:', categories.length);
    console.log('[Categories API] Categories data:', categories.slice(0, 3)); // First 3
    
    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error('[Categories API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Eroare la încărcarea categoriilor' },
      { status: 500 }
    );
  }
}