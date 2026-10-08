'use server';

import z from 'zod';
import { passwordSchema } from '@/features/auth/password-schema';
import { protectedRequest } from '@/lib/api';
import { setAuthCookies } from '@/lib/cookies';
import { APP_ERROR_TYPES, AppErrorType, getZodValidationErrorTypes } from '@/lib/errors';

const schema = z.object({
  current_password: z.string().min(1, APP_ERROR_TYPES.REQUIRED),
  new_password: passwordSchema,
});

type ChangePasswordState = {
  fieldErrors?: { current_password?: AppErrorType[]; new_password?: AppErrorType[] };
  formError?: AppErrorType;
  changed?: boolean;
} | null;

export async function changePassword(
  previousState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const result = schema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { fieldErrors: getZodValidationErrorTypes(result.error) };
  }

  try {
    const response = await protectedRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(result.data),
    });

    if (!response.ok) {
      return response.errorType === APP_ERROR_TYPES.INVALID_PASSWORD
        ? { fieldErrors: { current_password: [response.errorType] } }
        : { formError: response.errorType };
    }

    await setAuthCookies(response.headers);
  } catch {
    return { formError: APP_ERROR_TYPES.UNKNOWN };
  }

  return { changed: true };
}
