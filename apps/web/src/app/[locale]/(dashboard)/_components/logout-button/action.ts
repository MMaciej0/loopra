'use server';

import { apiRequestWithCookie } from '@/lib/api';
import { clearAuthCookies, getAuthCookies } from '@/lib/cookies';
import { redirect } from 'next/navigation';

export async function logout() {
  const { accessToken, refreshToken } = await getAuthCookies();

  await apiRequestWithCookie(
    '/auth/logout',
    `accessToken=${accessToken}; refreshToken=${refreshToken}`,
    {
      method: 'DELETE',
    },
  ).finally(() => {
    clearAuthCookies();
  });

  redirect('/login');
}
