import { redirect } from 'next/navigation';
import { APP_ERROR_TYPES, AppErrorType, isAppErrorType } from '@/lib/errors';
import {
  clearAuthCookies,
  extractCookieValue,
  getAuthCookies,
  setAuthCookies,
} from '@/lib/cookies';
import { cache } from 'react';

interface ErrorResponse {
  ok: false;
  errorType: AppErrorType;
}

interface SuccessResponse<T> {
  ok: true;
  data: T;
  headers: Headers;
}

const refreshSession = cache(async (refreshToken: string) => {
  const response = await apiRequestWithCookie('/auth/refresh', `refreshToken=${refreshToken}`, {
    method: 'POST',
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

export async function publicRequest<T>(
  url: string,
  options?: RequestInit,
): Promise<SuccessResponse<T> | ErrorResponse> {
  const response = await apiRequest(url, options);

  if (!response.ok) {
    return await parseApiError(response);
  }

  return await parseApiSuccess(response);
}

export async function protectedRequest<T>(
  url: string,
  options?: RequestInit,
): Promise<SuccessResponse<T> | ErrorResponse> {
  const { accessToken, refreshToken } = await getAuthCookies();

  if (accessToken) {
    const firstResponse = await apiRequestWithCookie(url, `accessToken=${accessToken}`, options);

    if (firstResponse.ok) {
      return await parseApiSuccess(firstResponse);
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

  return await parseApiSuccess(secondResponse);
}

async function parseApiSuccess<T>(response: Response): Promise<SuccessResponse<T>> {
  const data = await response.json();

  return {
    ok: true,
    data: data as T,
    headers: response.headers,
  };
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

export async function apiRequest(url: string, options?: RequestInit) {
  return fetch(`${process.env.API_URL}${url}`, {
    ...options,
    headers: {
      ...jsonContentType(options?.body),
      ...options?.headers,
    },
  });
}

export async function apiRequestWithCookie(url: string, cookie: string, options?: RequestInit) {
  return fetch(`${process.env.API_URL}${url}`, {
    ...options,
    headers: {
      ...jsonContentType(options?.body),
      ...options?.headers,
      Cookie: cookie,
    },
  });
}
