import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !message) {
      return NextResponse.json({ success: false, error: 'Numele și mesajul sunt obligatorii' }, { status: 400 });
    }

    await prisma.contactMessage.create({
      data: { name, email: email || '', phone: phone || '', subject: subject || '', message },
    }).catch(() => {
      // If table doesn't exist yet, just log
      console.log('[Contact] Message received:', { name, email, phone, subject, message });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Contact] Error:', error);
    return NextResponse.json({ success: true }); // Still return success to user
  }
}
