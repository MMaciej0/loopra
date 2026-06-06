import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export const getAuthCookies = (
  request: NextRequest,
): {
  accessToken: string | undefined;
  refreshToken: string | undefined;
} => {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  return { accessToken, refreshToken };
};

export const setAuthCookies = async (responseHeaders: Headers) => {
  const cookieStore = await cookies();

  responseHeaders.getSetCookie().forEach((rawCookie) => {
    const [nameValue, ...attrs] = rawCookie.split('; ');
    const [name, value] = nameValue.split('=');
    const opts: Record<string, unknown> = { path: '/' };

    attrs.forEach((a) => {
      const lower = a.toLowerCase();
      if (lower === 'httponly') opts.httpOnly = true;
      if (lower === 'secure') opts.secure = true;
      if (lower.startsWith('max-age=')) opts.maxAge = Number(a.split('=')[1]);
      if (lower.startsWith('samesite=')) opts.sameSite = a.split('=')[1].toLowerCase();
    });

    cookieStore.set(name, value, opts as Parameters<typeof cookieStore.set>[2]);
  });
};
