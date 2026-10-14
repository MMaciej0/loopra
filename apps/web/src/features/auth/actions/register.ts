'use server';

import z from 'zod';
import { APP_ERROR_TYPES, type AppErrorType } from '@loopra/domain';
import { getZodValidationErrorTypes } from '@/lib/errors';
import { redirect } from 'next/navigation';
import { publicRequest } from '@/lib/api';
import { setAuthCookies } from '@/lib/cookies';
import { usernameSchema } from '@/features/auth/username-schema';
import { passwordSchema } from '@/features/auth/password-schema';

const schema = z.object({
  email: z
    .string()
    .min(1, APP_ERROR_TYPES.REQUIRED)
    .pipe(z.email({ error: APP_ERROR_TYPES.INVALID_EMAIL })),
  username: usernameSchema,
  password: passwordSchema,
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
