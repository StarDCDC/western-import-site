import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { productId, author, rating, text } = await request.json();
    if (!productId || !author || !text || !rating) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Find or create a guest user for the review author
    let guestUser = await prisma.user.findFirst({ where: { email: `guest_${author.trim().toLowerCase().replace(/\s+/g, '_')}@westernimport.md` } });
    if (!guestUser) {
      guestUser = await prisma.user.create({
        data: {
          name: author.trim(),
          email: `guest_${author.trim().toLowerCase().replace(/\s+/g, '_')}@westernimport.md`,
          password: 'guest',
        },
      });
    }

    const review = await prisma.review.create({
      data: {
        userId: guestUser.id,
        productId,
        rating: Number(rating),
        comment: text.trim(),
        isApproved: true,
      },
    });
    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Review POST error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
