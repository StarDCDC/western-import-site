import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/brands — list all brands (requires admin)
// POST /api/admin/brands — create brand (requires admin)
// PUT /api/admin/brands?id= — update brand (requires admin)
// DELETE /api/admin/brands?id= — delete brand (requires admin)

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return NextResponse.json({ success: false, error: 'Neautorizat' }, { status: 401 });
    if (error === 'forbidden') return NextResponse.json({ success: false, error: 'Acces interzis' }, { status: 403 });

    const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ success: true, data: brands });
  } catch (error) {
    console.error('Brands GET error:', error);
    return NextResponse.json({ success: false, error: 'Eroare la încărcarea brandurilor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return NextResponse.json({ success: false, error: 'Neautorizat' }, { status: 401 });
    if (error === 'forbidden') return NextResponse.json({ success: false, error: 'Acces interzis' }, { status: 403 });

    const body = await request.json();
    const { name, slug, logo, description } = body;
    if (!name) return NextResponse.json({ success: false, error: 'Numele brandului este obligatoriu' }, { status: 400 });

    const brandSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await prisma.brand.findFirst({ where: { OR: [{ slug: brandSlug }, { name }] } });
    if (existing) return NextResponse.json({ success: false, error: 'Brandul există deja' }, { status: 400 });

    const brand = await prisma.brand.create({ data: { name, slug: brandSlug, logo: logo || null, description: description || null } });
    return NextResponse.json({ success: true, data: brand }, { status: 201 });
  } catch (error) {
    console.error('Brands POST error:', error);
    return NextResponse.json({ success: false, error: 'Eroare la crearea brandului' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return NextResponse.json({ success: false, error: 'Neautorizat' }, { status: 401 });
    if (error === 'forbidden') return NextResponse.json({ success: false, error: 'Acces interzis' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID lipsă' }, { status: 400 });

    const body = await request.json();
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.logo !== undefined) updateData.logo = body.logo;
    if (body.description !== undefined) updateData.description = body.description;

    const brand = await prisma.brand.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    console.error('Brands PUT error:', error);
    return NextResponse.json({ success: false, error: 'Eroare la actualizarea brandului' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error === 'unauthorized') return NextResponse.json({ success: false, error: 'Neautorizat' }, { status: 401 });
    if (error === 'forbidden') return NextResponse.json({ success: false, error: 'Acces interzis' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID lipsă' }, { status: 400 });

    const count = await prisma.product.count({ where: { brandId: id } });
    if (count > 0) return NextResponse.json({ success: false, error: `Brandul are ${count} produse. Ștergeți produsele mai întâi.` }, { status: 400 });

    await prisma.brand.delete({ where: { id } });
    return NextResponse.json({ success: true, data: { message: 'Brand șters' } });
  } catch (error) {
    console.error('Brands DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Eroare la ștergerea brandului' }, { status: 500 });
  }
}