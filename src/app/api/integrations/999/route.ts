// src/app/api/integrations/999/route.ts — 999.md API Proxy
import { NextRequest, NextResponse } from 'next/server';
import {
  getCategories, getSubcategories, getOfferTypes, getFeatures,
  getAdverts, getAdvert, getAdvertFeatures, createAdvert, updateAdvert,
  republishAdvert, setAccessPolicy, getCash, pushProductTo999, updateProductOn999,
  type Lang,
} from '@/lib/integrations/nineNineNineMd';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const lang = (searchParams.get('lang') as Lang) || 'ro';

  try {
    switch (action) {
      case 'categories':
        return NextResponse.json({ success: true, data: await getCategories(lang) });

      case 'subcategories': {
        const cat = searchParams.get('categoryId');
        if (!cat) return NextResponse.json({ success: false, error: 'categoryId required' }, { status: 400 });
        return NextResponse.json({ success: true, data: await getSubcategories(cat, lang) });
      }

      case 'offer-types': {
        const cat = searchParams.get('categoryId');
        const sub = searchParams.get('subcategoryId');
        if (!cat || !sub) return NextResponse.json({ success: false, error: 'categoryId & subcategoryId required' }, { status: 400 });
        return NextResponse.json({ success: true, data: await getOfferTypes(cat, sub, lang) });
      }

      case 'features': {
        const category_id = searchParams.get('categoryId');
        const subcategory_id = searchParams.get('subcategoryId');
        const offer_type = searchParams.get('offerType');
        if (!category_id || !subcategory_id || !offer_type)
          return NextResponse.json({ success: false, error: 'categoryId, subcategoryId & offerType required' }, { status: 400 });
        return NextResponse.json({ success: true, data: await getFeatures({ category_id, subcategory_id, offer_type, lang }) });
      }

      case 'adverts': {
        const data = await getAdverts({
          page: searchParams.get('page') || '1',
          page_size: searchParams.get('page_size') || '20',
          states: searchParams.get('states') || 'public,hidden',
          lang,
        });
        return NextResponse.json({ success: true, data });
      }

      case 'advert': {
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
        return NextResponse.json({ success: true, data: await getAdvert(id, lang) });
      }

      case 'advert-features': {
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
        return NextResponse.json({ success: true, data: await getAdvertFeatures(id, lang) });
      }

      case 'cash':
        return NextResponse.json({ success: true, data: { cash: await getCash() } });

      default:
        return NextResponse.json(
          { success: false, error: 'Actions: categories, subcategories, offer-types, features, adverts, advert, advert-features, cash' },
          { status: 400 }
        );
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
      case 'test': {
        const cash = await getCash();
        return NextResponse.json({ success: true, data: { message: `Conexiune reușită. Sold cont: ${cash} MDL`, cash } });
      }
      case 'create': {
        // body.advert = { category_id, subcategory_id, offer_type, features:[...] }
        const data = await createAdvert(body.advert);
        return NextResponse.json({ success: true, data });
      }
      case 'update': {
        const { id, features, offerType } = body;
        if (!id || !features) return NextResponse.json({ success: false, error: 'id and features required' }, { status: 400 });
        const data = await updateAdvert(id, features, offerType);
        return NextResponse.json({ success: true, data });
      }
      case 'republish': {
        const { id } = body;
        if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
        return NextResponse.json({ success: true, data: await republishAdvert(id) });
      }
      case 'access-policy': {
        const { id, policy } = body;
        if (!id || !policy) return NextResponse.json({ success: false, error: 'id and policy required' }, { status: 400 });
        return NextResponse.json({ success: true, data: await setAccessPolicy(id, policy) });
      }
      case 'push-product': {
        // body.product = Local999Product; body.options = { taxonomy?, makePublic?, lang? }
        const data = await pushProductTo999(body.product, body.options || {});
        return NextResponse.json({ success: true, data });
      }
      case 'update-product': {
        const { advertId, product, options } = body;
        if (!advertId || !product) return NextResponse.json({ success: false, error: 'advertId and product required' }, { status: 400 });
        const data = await updateProductOn999(advertId, product, options || {});
        return NextResponse.json({ success: true, data });
      }
      default:
        return NextResponse.json(
          { success: false, error: 'Actions: create, update, republish, access-policy, push-product, update-product' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
