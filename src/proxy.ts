import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin/* routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
      || request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  // Cache static assets aggressively (1 year)
  if (
    pathname.match(/\.(js|css|woff2?|ttf|eot|ico|svg|jpg|jpeg|png|webp|avif)$/) ||
    pathname.startsWith('/_next/static/')
  ) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
    return response;
  }

  // Cache product images from external CDN (via _next/image)
  if (pathname.startsWith('/_next/image')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=86400, stale-while-revalidate=604800'
    );
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/data|_next/build|_next/webpack).*)',
    '/_next/image',
    '/_next/static/:path*',
  ],
};
