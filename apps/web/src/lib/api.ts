import { headers } from 'next/headers';
import type z from 'zod';
import { redirect } from 'next/navigation';
import { APP_ERROR_TYPES, isAppErrorType, type AppErrorType } from '@loopra/domain';
import {
  clearAuthCookies,
  extractCookieValue,
  getAuthCookies,
  setAuthCookies,
} from '@/lib/cookies';
import { cache } from 'react';
import { SessionResponseSchema } from '@loopra/domain/schemas';

interface ErrorResponse {
  ok: false;
  errorType: AppErrorType;
}

interface SuccessResponse<T> {
  ok: true;
  data: T;
  headers: Headers;
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

type RequestOptions<S extends z.ZodType> = RequestInit & { schema: S };

const refreshSession = cache(async (refreshToken: string) => {
  const response = await cookieRequest('/auth/refresh', `refreshToken=${refreshToken}`, {
    method: 'POST',
    schema: SessionResponseSchema,
  });

  if (!response.ok) {
    return await redirectToLogin();
  }

  await setAuthCookies(response.headers);

  const newAccessToken = extractCookieValue(response.headers, 'accessToken');

  if (!newAccessToken) {
    return await redirectToLogin();
  }

  return newAccessToken;
});

export async function publicRequest<S extends z.ZodType>(
  url: string,
  { schema, ...options }: RequestOptions<S>,
): Promise<ApiResponse<z.output<S>>> {
  const response = await apiRequest(url, options);

  if (!response.ok) {
    return await parseApiError(response);
  }

  return await parseApiSuccess(response, schema);
}

export async function cookieRequest<S extends z.ZodType>(
  url: string,
  cookie: string,
  { schema, ...options }: RequestOptions<S>,
): Promise<ApiResponse<z.output<S>>> {
  const response = await apiRequestWithCookie(url, cookie, options);

  if (!response.ok) {
    return await parseApiError(response);
  }

  return await parseApiSuccess(response, schema);
}

export async function protectedRequest<S extends z.ZodType>(
  url: string,
  { schema, ...options }: RequestOptions<S>,
): Promise<ApiResponse<z.output<S>>> {
  const { accessToken, refreshToken } = await getAuthCookies();

  if (accessToken) {
    const firstResponse = await apiRequestWithCookie(url, `accessToken=${accessToken}`, options);

    if (firstResponse.ok) {
      return await parseApiSuccess(firstResponse, schema);
    }

    const firstResponseError = await parseApiError(firstResponse);

    if (firstResponseError.errorType !== APP_ERROR_TYPES.STALE_TOKEN) {
      return firstResponseError;
    }
  }

  if (!refreshToken) {
    return await redirectToLogin();
  }

  const newAccessToken = await refreshSession(refreshToken);

  const secondResponse = await apiRequestWithCookie(url, `accessToken=${newAccessToken}`, options);

  if (!secondResponse.ok) {
    return await parseApiError(secondResponse);
  }

  return await parseApiSuccess(secondResponse, schema);
}

async function parseApiSuccess<S extends z.ZodType>(
  response: Response,
  schema: S,
): Promise<ApiResponse<z.output<S>>> {
  const data = await response.json();
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error(`API response from ${response.url} failed to parse`, result.error.issues);
    return { ok: false, errorType: APP_ERROR_TYPES.UNKNOWN };
  }

  return { ok: true, data: result.data, headers: response.headers };
}

async function parseApiError(response: Response): Promise<ErrorResponse> {
  const body = await response.json();

  return {
    ok: false,
    errorType: isAppErrorType(body.type) ? body.type : APP_ERROR_TYPES.UNKNOWN,
  };
}

export async function redirectToLogin(): Promise<never> {
  await clearAuthCookies();
  redirect('/login');
}

function jsonContentType(body: RequestInit['body']): Record<string, string> {
  return body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {};
}

async function forwardedFor(): Promise<Record<string, string>> {
  const value = (await headers()).get('x-forwarded-for');

  return value ? { 'X-Forwarded-For': value } : {};
}

export async function apiRequest(url: string, options?: RequestInit) {
  return fetch(`${process.env.API_URL}${url}`, {
    ...options,
    headers: {
      ...jsonContentType(options?.body),
      ...(await forwardedFor()),
      ...options?.headers,
    },
  });
}

export async function apiRequestWithCookie(url: string, cookie: string, options?: RequestInit) {
  return fetch(`${process.env.API_URL}${url}`, {
    ...options,
    headers: {
      ...jsonContentType(options?.body),
      ...(await forwardedFor()),
      ...options?.headers,
      Cookie: cookie,
    },
  });
}
