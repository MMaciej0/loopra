import { NextRequest } from 'next/server';

export const getAuthCookies = (
  request: NextRequest,
): {
  accessToken: string | undefined;
  refreshToken: string | undefined;
} => {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  return { accessToken, refreshToken };
};
