'use server';

import z from 'zod';
import { APP_ERROR_TYPES, AppErrorType, getZodValidationErrorTypes } from '@/lib/errors';
import { redirect } from 'next/navigation';
import { publicRequest } from '@/lib/api';
import { setAuthCookies } from '@/lib/cookies';

const schema = z.object({
  email: z
    .string()
    .min(1, APP_ERROR_TYPES.REQUIRED)
    .pipe(z.email({ error: APP_ERROR_TYPES.INVALID_EMAIL })),
  username: z.string().min(1, APP_ERROR_TYPES.REQUIRED).min(3, APP_ERROR_TYPES.USERNAME_TOO_SHORT),
  password: z
    .string()
    .min(1, APP_ERROR_TYPES.REQUIRED)
    .min(8, APP_ERROR_TYPES.PASSWORD_TOO_SHORT)
    .regex(/[A-Z]/, APP_ERROR_TYPES.PASSWORD_REQUIRES_UPPERCASE)
    .regex(/[^A-Za-z0-9]/, APP_ERROR_TYPES.PASSWORD_REQUIRES_SPECIAL_CHAR),
});

type LoginFieldErrors = {
  email?: AppErrorType[];
  username?: AppErrorType[];
  password?: AppErrorType[];
};

type RegisterState = {
  values?: { email?: string; username?: string };
  fieldErrors?: LoginFieldErrors;
  formError?: AppErrorType;
} | null;

export async function register(previousState: RegisterState, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const result = schema.safeParse(raw);

  if (!result.success) {
    return {
      values: { email: raw.email as string, username: raw.username as string },
      fieldErrors: getZodValidationErrorTypes(result.error),
    };
  }

  const { email, username, password } = result.data;

  try {
    const response = await publicRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });

    if (!response.ok) {
      return {
        values: { email, username },
        formError: response.errorType,
      };
    }

    await setAuthCookies(response.headers);
  } catch {
    return { values: { email, username }, formError: APP_ERROR_TYPES.UNKNOWN };
  }

  redirect('/welcome');
}
