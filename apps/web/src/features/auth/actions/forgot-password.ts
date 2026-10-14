'use server';

import { APP_ERROR_TYPES, type AppErrorType } from '@loopra/domain';
import { ForgotPasswordBodySchema, MessageResponseSchema } from '@loopra/domain/schemas';
import { getZodValidationErrorTypes } from '@/lib/errors';
import { publicRequest } from '@/lib/api';
import { redirect } from 'next/navigation';
import { emailSchema } from '@/features/auth/email-schema';

interface ForgotPasswordFieldErrors {
  email?: AppErrorType[];
}

type ForgotPasswordState = {
  values?: { email?: string };
  fieldErrors?: ForgotPasswordFieldErrors;
  formError?: AppErrorType;
} | null;

const schema = ForgotPasswordBodySchema.extend({
  email: emailSchema,
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
      schema: MessageResponseSchema,
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
