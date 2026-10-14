'use server';

import z from 'zod';
import { refresh } from 'next/cache';
import { UpdateCurrentUserResponseSchema, UsernameSchema } from '@loopra/domain/schemas';
import { protectedRequest } from '@/lib/api';
import { APP_ERROR_TYPES, type AppErrorType } from '@loopra/domain';
import { getZodValidationErrorTypes } from '@/lib/errors';

const schema = z.object({ username: UsernameSchema });

type SaveUsernameState = {
  values?: { username?: string };
  fieldErrors?: { username?: AppErrorType[] };
  formError?: AppErrorType;
} | null;

export async function saveUsername(
  previousState: SaveUsernameState,
  formData: FormData,
): Promise<SaveUsernameState> {
  const raw = Object.fromEntries(formData);
  const result = schema.safeParse(raw);

  if (!result.success) {
    return {
      values: { username: raw.username as string },
      fieldErrors: getZodValidationErrorTypes(result.error),
    };
  }

  const { username } = result.data;

  try {
    const response = await protectedRequest('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ username }),
      schema: UpdateCurrentUserResponseSchema,
    });

    if (!response.ok) {
      return { values: { username }, formError: response.errorType };
    }
  } catch {
    return { values: { username }, formError: APP_ERROR_TYPES.UNKNOWN };
  }

  refresh();
  return null;
}
