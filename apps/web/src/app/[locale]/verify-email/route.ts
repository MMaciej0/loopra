import { redirect } from 'next/navigation';
import { hasLocale } from 'next-intl';
import type { NextRequest } from 'next/server';
import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { apiRequest, apiRequestWithCookie } from '@/lib/api';
import { getAuthCookies, setAuthCookies } from '@/lib/cookies';

export async function GET(request: NextRequest, context: RouteContext<'/[locale]/verify-email'>) {
  const { locale: requestedLocale } = await context.params;
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    redirect(getPathname({ href: '/verify-email/invalid', locale }));
  }

  const verifyResponse = await apiRequest('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });

  if (!verifyResponse.ok) {
    redirect(getPathname({ href: '/verify-email/invalid', locale }));
  }

  const { refreshToken } = await getAuthCookies();

  if (!refreshToken) {
    redirect(getPathname({ href: '/login', locale }));
  }

  const refreshResponse = await apiRequestWithCookie(
    '/auth/refresh',
    `refreshToken=${refreshToken}`,
    { method: 'POST' },
  ).catch(() => null);

  if (refreshResponse?.ok) {
    await setAuthCookies(refreshResponse.headers);
  }

  redirect(getPathname({ href: '/rides', locale }));
}
