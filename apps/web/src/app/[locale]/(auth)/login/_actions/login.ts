'use server';

import { z } from 'zod';
import { publicRequest } from '@/lib/api';
import { APP_ERROR_TYPES, AppErrorType, getZodValidationErrorTypes } from '@/lib/errors';
import { setAuthCookies } from '@/lib/cookies';
import { redirect } from 'next/navigation';

type LoginFieldErrors = {
  email?: AppErrorType[];
  password?: AppErrorType[];
};

const schema = z.object({
  email: z
    .string()
    .min(1, APP_ERROR_TYPES.REQUIRED)
    .pipe(z.email({ error: APP_ERROR_TYPES.INVALID_EMAIL })),
  password: z.string().min(1, APP_ERROR_TYPES.REQUIRED).min(8, APP_ERROR_TYPES.PASSWORD_TOO_SHORT),
});

export type LoginState = {
  values?: { email?: string };
  fieldErrors?: LoginFieldErrors;
  formError?: AppErrorType;
} | null;

export async function login(
  redirectTo: string,
  previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const raw = Object.fromEntries(formData);
  const result = schema.safeParse(raw);

  if (!result.success) {
    return {
      values: { email: raw.email as string },
      fieldErrors: getZodValidationErrorTypes(result.error),
    };
  }

  const { email, password } = result.data;

  try {
    const response = await publicRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return {
        values: { email },
        formError: response.errorType,
      };
    }

    await setAuthCookies(response.headers);
  } catch {
    return { values: { email }, formError: APP_ERROR_TYPES.UNKNOWN };
  }

  redirect(redirectTo);
}
