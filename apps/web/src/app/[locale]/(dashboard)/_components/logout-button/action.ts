'use server';

import { apiRequestWithCookie } from '@/utils/api';
import { clearAuthCookies, getAuthCookies } from '@/utils/cookies';
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
