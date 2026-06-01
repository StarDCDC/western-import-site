// src/app/api/integrations/999/route.ts — 999.md API Proxy
import { NextRequest, NextResponse } from 'next/server';
import {
  getCategories, getAdverts, getAdvert, createAdvert,
  updateAdvert, republishAdvert, getFeaturesForAdvert, pushProductTo999,
} from '@/lib/integrations/nineNineNineMd';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'categories': {
        const lang = searchParams.get('lang') || 'ro';
        const data = await getCategories(lang);
        return NextResponse.json({ success: true, data });
      }
      case 'adverts': {
        const page = searchParams.get('page') || '1';
        const pageSize = searchParams.get('page_size') || '20';
        const data = await getAdverts({ page, page_size: pageSize, state: searchParams.get('state') || 'public' });
        return NextResponse.json({ success: true, data });
      }
      case 'advert': {
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
        const data = await getAdvert(id);
        return NextResponse.json({ success: true, data });
      }
      case 'features': {
        const subId = searchParams.get('subcategoryId');
        if (!subId) return NextResponse.json({ success: false, error: 'subcategoryId required' }, { status: 400 });
        const data = await getFeaturesForAdvert(subId);
        return NextResponse.json({ success: true, data });
      }
      default:
        return NextResponse.json({ success: false, error: 'Actions: categories, adverts, advert, features' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create': {
        const data = await createAdvert(body.advert);
        return NextResponse.json({ success: true, data });
      }
      case 'update': {
        const { id, advert } = body;
        if (!id || !advert) return NextResponse.json({ success: false, error: 'id and advert required' }, { status: 400 });
        const data = await updateAdvert(id, advert);
        return NextResponse.json({ success: true, data });
      }
      case 'republish': {
        const { id } = body;
        if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
        const data = await republishAdvert(id);
        return NextResponse.json({ success: true, data });
      }
      case 'push-product': {
        const data = await pushProductTo999(body.product);
        return NextResponse.json({ success: true, data });
      }
      default:
        return NextResponse.json({ success: false, error: 'Actions: create, update, republish, push-product' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
