import type { FastifyReply } from 'fastify';
import { NODE_ENV } from '../../../config/env.js';

const isProduction = NODE_ENV === 'production';

const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const setAuthCookies = (
  reply: FastifyReply,
  accessToken: string,
  familyUuid: string,
  rawRefreshToken: string,
) => {
  reply
    .setCookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_MAX_AGE,
    })
    .setCookie('refreshToken', `${familyUuid}.${rawRefreshToken}`, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
};

export const clearAuthCookies = (reply: FastifyReply) => {
  reply.clearCookie('accessToken', { path: '/' }).clearCookie('refreshToken', { path: '/' });
};
