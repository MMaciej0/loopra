'use server';

import { MessageResponseSchema } from '@loopra/domain/schemas';
import { cookieRequest } from '@/lib/api';
import { clearAuthCookies, getAuthCookies } from '@/lib/cookies';
import { redirect } from 'next/navigation';

export async function logout() {
  const { accessToken, refreshToken } = await getAuthCookies();

  await cookieRequest('/auth/logout', `accessToken=${accessToken}; refreshToken=${refreshToken}`, {
    method: 'DELETE',
    schema: MessageResponseSchema,
  }).finally(() => {
    clearAuthCookies();
  });

  redirect('/login');
}
