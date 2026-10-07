'use server';

import { publicRequest } from '@/lib/api';
import { APP_ERROR_TYPES } from '@/lib/errors';
import { getCurrentUser } from '@/lib/user';

export async function resendVerificationEmail() {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false as const, errorType: APP_ERROR_TYPES.UNKNOWN };
  }

  try {
    const response = await publicRequest('/auth/resend-verification-email', {
      method: 'POST',
      body: JSON.stringify({ email: user.email }),
    });

    if (!response.ok) {
      return { ok: false as const, errorType: response.errorType };
    }
  } catch {
    return { ok: false as const, errorType: APP_ERROR_TYPES.UNKNOWN };
  }

  return { ok: true as const };
}
