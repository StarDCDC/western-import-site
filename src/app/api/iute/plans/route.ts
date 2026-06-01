// src/app/api/iute/plans/route.ts — Fetch real IutePay plans for a price
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_KEY = 'e757e925-8e5c-4ccf-9712-edf093290032';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const amount = searchParams.get('amount');
  if (!amount) return NextResponse.json({ success: false, error: 'amount required' }, { status: 400 });

  try {
    const res = await fetch('https://ecom.iutecredit.md/api/v1/eshop/client/eshop-product/-/calculation?monthly=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-iute-api-key': PUBLIC_KEY,
      },
      body: JSON.stringify([{ id: 'calc', sku: 'CALC', amount }]),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ success: false, error: text }, { status: res.status });
    }

    const raw = await res.json();
    // Transform API response into clean plan objects
    const plans = (Array.isArray(raw) ? raw : []).map((item: any) => ({
      productId: item.productId || '',
      productName: item.productName || '',
      months: parseMonths(item.productName || ''),
      monthly: Math.ceil(item.monthlyRepayment || 0),
      total: Math.ceil(item.monthlyRepayment || 0) * parseMonths(item.productName || ''),
      isZeroPercent: item.zeroPercentOffer === true,
    }));

    return NextResponse.json({ success: true, plans });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function parseMonths(name: string): number {
  const match = name.match(/(\d+)\s*lun/i);
  return match ? parseInt(match[1]) : 4;
}
