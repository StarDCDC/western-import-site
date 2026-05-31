import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

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
    // Match all paths except API routes and Next.js internals that don't need caching
    '/((?!api|admin|_next/data|_next/build|_next/webpack).*)',
    '/_next/image',
    '/_next/static/:path*',
  ],
};
