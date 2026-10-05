import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';

type ParsedSetCookie = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

export const captureRequestAuthCookies = (
  request: NextRequest,
): {
  accessToken: string | undefined;
  refreshToken: string | undefined;
} => {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  return { accessToken, refreshToken };
};

export const getAuthCookies = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  return { accessToken, refreshToken };
};

export const setAuthCookies = async (responseHeaders: Headers) => {
  const cookieStore = await cookies();

  parseSetCookieHeaders(responseHeaders).forEach(({ name, value, options }) => {
    cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]);
  });
};

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}

export function extractCookieValue(headers: Headers, name: string) {
  const rawCookie = headers.getSetCookie().find((cookie) => cookie.startsWith(`${name}=`));

  return rawCookie?.split(';')[0]?.split('=')[1];
}

export function copySetCookieHeaders(response: NextResponse, responseHeaders: Headers) {
  parseSetCookieHeaders(responseHeaders).forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  });
}

function parseSetCookieHeaders(responseHeaders: Headers): ParsedSetCookie[] {
  return responseHeaders.getSetCookie().map((rawCookie) => {
    const [nameValue, ...attrs] = rawCookie.split('; ');
    const [name, value] = nameValue.split('=');
    const options: Record<string, unknown> = { path: '/' };

    attrs.forEach((attr) => {
      const lower = attr.toLowerCase();
      if (lower === 'httponly') options.httpOnly = true;
      if (lower === 'secure') options.secure = true;
      if (lower.startsWith('max-age=')) options.maxAge = Number(attr.split('=')[1]);
      if (lower.startsWith('samesite=')) options.sameSite = attr.split('=')[1].toLowerCase();
    });

    return { name, value, options };
  });
}
