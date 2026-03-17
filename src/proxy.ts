import { NextRequest, NextResponse } from 'next/server';

export let defaultLocale = 'ko';

export function proxy(request: NextRequest) {
  //ko -> ja 언어 전환이 필요하면 쿠키에 값 저장하고 여기서 불러오면 됨
  let locale = defaultLocale;

  let pathname = request.nextUrl.pathname;

  let moveUrl = `/${locale}${pathname}`;

  const newUrl = new URL(moveUrl, request.nextUrl);

  // e.g. incoming request is /products
  // The new URL is now /en/products
  return NextResponse.rewrite(newUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!api|_next/static|_next/image|assets/*|favicon.ico).*)',
    // Allow image files with common extensions
    // Optional: only run on root (/) URL
    // '/'
  ],
  fallback: true,
};
