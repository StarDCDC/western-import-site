import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const resp = NextResponse.json({ success: true });
  // Clear all next-auth session cookies
  const cookies = [
    'next-auth.session-token',
    'next-auth.csrf-token',
    'next-auth.callback-url',
    '__Secure-next-auth.session-token',
    '__Host-next-auth.csrf-token',
    'token',
  ];
  cookies.forEach(name => {
    resp.cookies.set(name, '', { maxAge: 0, path: '/' });
  });
  return resp;
}

// Also allow GET for CSRF-based signout (next-auth default)
export async function GET() {
  const resp = NextResponse.redirect(new URL('/?signedout=1', process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
  const cookies = [
    'next-auth.session-token', 'next-auth.csrf-token', 'next-auth.callback-url',
    '__Secure-next-auth.session-token', '__Host-next-auth.csrf-token', 'token',
  ];
  cookies.forEach(name => {
    resp.cookies.set(name, '', { maxAge: 0, path: '/' });
  });
  return resp;
}