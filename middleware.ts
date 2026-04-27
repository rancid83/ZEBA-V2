import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'zeba_session';

const PROTECTED_PATHS = ['/project-hub', '/main', '/collaboration', '/slides'];
const AUTH_PATHS = ['/login', '/signup'];

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`) ||
           pathname.match(new RegExp(`^/[^/]+${p}(/|$)`)) !== null
  );
}

function isAuthPage(pathname: string): boolean {
  return AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`) ||
           pathname.match(new RegExp(`^/[^/]+${p}(/|$)`)) !== null
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (isProtected(pathname) && !token) {
    const landingUrl = new URL('/', request.url);
    landingUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(landingUrl);
  }

  if (isAuthPage(pathname) && token) {
    return NextResponse.redirect(new URL('/project-hub', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
