'use server';

import z from 'zod';
import { APP_ERROR_TYPES, AppErrorType, getZodValidationErrorTypes } from '@/utils/errors';
import { publicRequest } from '@/utils/api';
import { redirect } from 'next/navigation';

interface ForgotPasswordFieldErrors {
  email?: AppErrorType[];
}

type ForgotPasswordState = {
  values?: { email?: string };
  fieldErrors?: ForgotPasswordFieldErrors;
  formError?: AppErrorType;
} | null;

const schema = z.object({
  email: z
    .string()
    .min(1, APP_ERROR_TYPES.REQUIRED)
    .pipe(z.email({ error: APP_ERROR_TYPES.INVALID_EMAIL })),
});

export async function forgotPassword(previousState: ForgotPasswordState, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const result = schema.safeParse(raw);

  if (!result.success) {
    return {
      values: { email: raw.email as string },
      fieldErrors: getZodValidationErrorTypes(result.error),
    };
  }

  const { email } = result.data;

  try {
    const response = await publicRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      return {
        values: { email },
        formError: response.errorType,
      };
    }
  } catch {
    return { values: { email }, formError: APP_ERROR_TYPES.UNKNOWN };
  }

  redirect('/login');
}
