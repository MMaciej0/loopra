'use server';

import { redirect } from 'next/navigation';
import { APP_ERROR_TYPES, type AppErrorType } from '@loopra/domain';
import { MessageResponseSchema, ResetPasswordBodySchema } from '@loopra/domain/schemas';
import { getZodValidationErrorTypes } from '@/lib/errors';
import { publicRequest } from '@/lib/api';
import { clearAuthCookies } from '@/lib/cookies';

interface ResetPasswordFieldErrors {
  password?: AppErrorType[];
}

type ResetPasswordState = {
  fieldErrors?: ResetPasswordFieldErrors;
  formError?: AppErrorType;
} | null;

const schema = ResetPasswordBodySchema.pick({ password: true });

export async function resetPassword(
  token: string,
  previousState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const result = schema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { fieldErrors: getZodValidationErrorTypes(result.error) };
  }

  try {
    const response = await publicRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password: result.data.password }),
      schema: MessageResponseSchema,
    });

    if (!response.ok) {
      return { formError: response.errorType };
    }

    await clearAuthCookies();
  } catch {
    return { formError: APP_ERROR_TYPES.UNKNOWN };
  }

  redirect('/login');
}
