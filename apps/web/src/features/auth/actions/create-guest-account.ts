'use server';

import { redirect } from 'next/navigation';
import { APP_ERROR_TYPES, type AppErrorType } from '@loopra/domain';
import { AuthUserResponseSchema } from '@loopra/domain/schemas';
import { publicRequest } from '@/lib/api';
import { setAuthCookies } from '@/lib/cookies';

export type GuestAccountState = { formError?: AppErrorType } | null;

export async function createGuestAccount(): Promise<GuestAccountState> {
  try {
    const response = await publicRequest('/auth/guest', {
      method: 'POST',
      schema: AuthUserResponseSchema,
    });

    if (!response.ok) {
      return { formError: response.errorType };
    }

    await setAuthCookies(response.headers);
  } catch {
    return { formError: APP_ERROR_TYPES.UNKNOWN };
  }

  redirect('/welcome');
}
