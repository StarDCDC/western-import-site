import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.CREDIT365_BASE_URL || 'https://preprod.aventus.md/';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetPath = path.join('/');
  const body = await request.text();

  const headers: Record<string, string> = {
    'Content-Type': request.headers.get('content-type') || 'application/json',
  };
  const auth = request.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;

  const res = await fetch(`${BASE_URL}${targetPath}`, {
    method: 'POST',
    headers,
    body,
  });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetPath = path.join('/');
  const search = request.nextUrl.search;

  const headers: Record<string, string> = {};
  const auth = request.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;

  const res = await fetch(`${BASE_URL}${targetPath}${search}`, {
    method: 'GET',
    headers,
  });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
