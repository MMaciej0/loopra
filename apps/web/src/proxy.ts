import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { stripLocale } from './utils/locale';
import { getAuthCookies } from './utils/cookies';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];

const handleLocales = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { accessToken } = getAuthCookies(request);
  const pathname = request.nextUrl.pathname;
  const pathnameWithoutLocale = stripLocale(pathname);
  const isPublicPath = PUBLIC_PATHS.some((path) => pathnameWithoutLocale.startsWith(path));

  if (isPublicPath && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!isPublicPath && !accessToken) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url),
    );
  }

  return handleLocales(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
