'use server';

import { APP_ERROR_TYPES, type AppErrorType, type ContactMessageBody } from '@loopra/domain';
import { ContactMessageBodySchema, MessageResponseSchema } from '@loopra/domain/schemas';
import { getZodValidationErrorTypes, type AppValidationFieldErrors } from '@/lib/errors';
import { publicRequest } from '@/lib/api';

type ContactState = {
  sent?: boolean;
  values?: Partial<Omit<ContactMessageBody, 'website'>>;
  fieldErrors?: AppValidationFieldErrors<ContactMessageBody>;
  formError?: AppErrorType;
} | null;

export async function sendContactMessage(
  previousState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const raw = Object.fromEntries(formData);
  const values = {
    name: raw.name as string,
    email: raw.email as string,
    message: raw.message as string,
  };
  const result = ContactMessageBodySchema.safeParse(raw);

  if (!result.success) {
    return { values, fieldErrors: getZodValidationErrorTypes(result.error) };
  }

  try {
    const response = await publicRequest('/contact', {
      method: 'POST',
      body: JSON.stringify(result.data),
      schema: MessageResponseSchema,
    });

    if (!response.ok) {
      return { values, formError: response.errorType };
    }
  } catch {
    return { values, formError: APP_ERROR_TYPES.UNKNOWN };
  }

  return { sent: true };
}
