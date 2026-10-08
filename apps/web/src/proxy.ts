import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { stripLocale } from '@/lib/locale';
import { captureRequestAuthCookies, copySetCookieHeaders, extractCookieValue } from '@/lib/cookies';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];
const OPEN_PATHS = ['/verify-email', '/reset-password', '/privacy', '/terms'];

const handleLocales = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const { accessToken, refreshToken } = captureRequestAuthCookies(request);
  const pathname = request.nextUrl.pathname;
  const pathnameWithoutLocale = stripLocale(pathname);
  const isPublicPath = PUBLIC_PATHS.some((path) => pathnameWithoutLocale.startsWith(path));
  const hasRecoverableSession = Boolean(accessToken || refreshToken);

  if (OPEN_PATHS.some((path) => pathnameWithoutLocale.startsWith(path))) {
    return handleLocales(request);
  }

  if (pathnameWithoutLocale === '/') {
    return hasRecoverableSession
      ? NextResponse.redirect(new URL('/rides', request.url))
      : handleLocales(request);
  }

  if (isPublicPath && accessToken) {
    return NextResponse.redirect(new URL('/rides', request.url));
  }

  if (!isPublicPath && !hasRecoverableSession) {
    return NextResponse.redirect(
      new URL(`/login?redirectTo=${encodeURIComponent(pathname)}`, request.url),
    );
  }

  if (!isPublicPath && !accessToken && refreshToken) {
    const refreshResponse = await fetch(`${process.env.API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    if (!refreshResponse.ok) {
      const response = NextResponse.redirect(
        new URL(`/login?redirectTo=${encodeURIComponent(pathname)}`, request.url),
      );
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }

    const newAccessToken = extractCookieValue(refreshResponse.headers, 'accessToken');
    const newRefreshToken = extractCookieValue(refreshResponse.headers, 'refreshToken');

    if (newAccessToken) {
      request.cookies.set('accessToken', newAccessToken);
    }

    if (newRefreshToken) {
      request.cookies.set('refreshToken', newRefreshToken);
    }

    const response = handleLocales(request);
    copySetCookieHeaders(response, refreshResponse.headers);
    return response;
  }

  return handleLocales(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
