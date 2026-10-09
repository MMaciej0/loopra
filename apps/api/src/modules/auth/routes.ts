import { FastifyInstance } from 'fastify';
import {
  AuthUserResponseSchema,
  MessageResponseSchema,
  SessionResponseSchema,
} from '@loopra/domain/schemas';
import {
  ChangePasswordBodySchema,
  EmailSchema,
  ForgottenPasswordBodySchema,
  LoginBodySchema,
  RegisterBodySchema,
  ResendEmailVerificationBodySchema,
  ResetPasswordBodySchema,
  VerifyEmailBodySchema,
} from './schema.js';
import { registerUser } from './services/registerUser.js';
import { loginUser } from './services/loginUser.js';
import { refreshSession } from './services/refreshSession.js';
import { deleteTokenFamily } from './services/tokenFamily.js';
import { sendResetPasswordToken } from './services/sendResetPasswordToken.js';
import { resetPassword } from './services/resetPassword.js';
import { changePassword } from './services/changePassword.js';
import { findOrCreateOAuthUser } from './services/findOrCreateOAuthUser.js';
import { sendEmailVerification } from './services/sendEmailVerification.js';
import { verifyEmail } from './services/verifyEmail.js';
import { InvalidTokenError, OAuthEmailNotVerifiedError, UnauthorizedError } from './errors.js';
import { clearAuthCookies, setAuthCookies } from './services/cookies.js';
import { parseBody } from '../../utils/validation.js';
import { APP_URL } from '../../config/env.js';
import {
  authRateLimiter,
  clearPasswordChangeRateLimit,
  clearRateLimits,
  emailSendRateLimiter,
  passwordChangeRateLimiter,
} from './services/rateLimiter.js';

export const authRoutes = (fastify: FastifyInstance, _options: unknown) => {
  fastify.post(
    '/register',
    { schema: { response: { 200: AuthUserResponseSchema } } },
    async (request, reply) => {
      const registerCredentials = parseBody(request.body, RegisterBodySchema);
      await authRateLimiter(request, fastify.redis);

      const { user, accessToken, familyUuid, rawRefreshToken } = await registerUser({
        fastify,
        registerCredentials,
      });
      setAuthCookies(reply, accessToken, familyUuid, rawRefreshToken);

      return reply.send({
        user: {
          id: user.id,
          email: user.email,
          email_verified: user.email_verified,
          username: user.username,
        },
      });
    },
  );

  fastify.post(
    '/login',
    { schema: { response: { 200: AuthUserResponseSchema } } },
    async (request, reply) => {
      const { email, password } = parseBody(request.body, LoginBodySchema);
      await authRateLimiter(request, fastify.redis, email);

      const { user, accessToken, familyUuid, rawRefreshToken } = await loginUser({
        fastify,
        email,
        password,
      });
      setAuthCookies(reply, accessToken, familyUuid, rawRefreshToken);
      await clearRateLimits(request, fastify.redis, email);

      return reply.send({
        user: {
          id: user.id,
          email: user.email,
          email_verified: user.email_verified,
          username: user.username,
        },
      });
    },
  );

  fastify.post(
    '/refresh',
    { schema: { response: { 200: SessionResponseSchema } } },
    async (request, reply) => {
      const refreshTokenCookie = request.cookies.refreshToken;

      if (!refreshTokenCookie) {
        throw new UnauthorizedError();
      }

      const [familyUuid, rawRefreshToken] = refreshTokenCookie.split('.');

      try {
        const { accessToken, newRawRefreshToken, userId } = await refreshSession({
          fastify,
          familyUuid,
          rawRefreshToken,
        });
        setAuthCookies(reply, accessToken, familyUuid, newRawRefreshToken);
        return reply.send({ user: { id: userId } });
      } catch (error) {
        if (error instanceof InvalidTokenError) {
          clearAuthCookies(reply);
        }
        throw error;
      }
    },
  );

  fastify.delete(
    '/logout',
    { schema: { response: { 200: MessageResponseSchema } } },
    async (request, reply) => {
      const refreshTokenCookie = request.cookies.refreshToken;

      if (!refreshTokenCookie) {
        throw new UnauthorizedError();
      }

      const [familyUuid] = refreshTokenCookie.split('.');

      try {
        await deleteTokenFamily(fastify.redis, familyUuid);
        clearAuthCookies(reply);
        return reply.send({ message: 'Logout successful' });
      } catch (error) {
        if (error instanceof InvalidTokenError) {
          clearAuthCookies(reply);
        }
        throw error;
      }
    },
  );

  fastify.post(
    '/forgot-password',
    { schema: { response: { 200: MessageResponseSchema } } },
    async (request, reply) => {
      const { email } = parseBody(request.body, ForgottenPasswordBodySchema);
      await emailSendRateLimiter(request, fastify.redis, email);

      // Always return 200 — never reveal whether email exists in the system
      await sendResetPasswordToken(email, fastify.db, fastify.redis, fastify.mailer).catch(
        () => {},
      );
      return reply.send({ message: 'If that email exists, a reset link has been sent.' });
    },
  );

  fastify.post(
    '/reset-password',
    { schema: { response: { 200: MessageResponseSchema } } },
    async (request, reply) => {
      const { token, password } = parseBody(request.body, ResetPasswordBodySchema);

      await resetPassword(token, password, fastify.db, fastify.redis);

      return reply.send({ message: 'Password reset successful' });
    },
  );

  fastify.post(
    '/change-password',
    {
      onRequest: fastify.authenticate,
      schema: { response: { 200: MessageResponseSchema } },
    },
    async (request, reply) => {
      const { current_password, new_password } = parseBody(request.body, ChangePasswordBodySchema);
      const userId = request.user.sub;
      await passwordChangeRateLimiter(fastify.redis, userId);

      const { accessToken, familyUuid, rawRefreshToken } = await changePassword({
        fastify,
        userId,
        currentPassword: current_password,
        newPassword: new_password,
      });
      setAuthCookies(reply, accessToken, familyUuid, rawRefreshToken);
      await clearPasswordChangeRateLimit(fastify.redis, userId);

      return reply.send({ message: 'Password change successful' });
    },
  );

  fastify.post(
    '/resend-verification-email',
    { schema: { response: { 200: MessageResponseSchema } } },
    async (request, reply) => {
      const { email } = parseBody(request.body, ResendEmailVerificationBodySchema);
      await emailSendRateLimiter(request, fastify.redis, email);

      // Always return 200 — never reveal whether email exists or is already verified
      await sendEmailVerification(email, fastify.db, fastify.redis, fastify.mailer).catch(() => {});
      return reply.send({
        message: 'If that email exists and is unverified, a new link has been sent.',
      });
    },
  );

  fastify.post(
    '/verify-email',
    { schema: { response: { 200: MessageResponseSchema } } },
    async (request, reply) => {
      const { token } = parseBody(request.body, VerifyEmailBodySchema);

      await verifyEmail(token, fastify.db, fastify.redis);

      return reply.send({ message: 'Email verification successful' });
    },
  );

  fastify.get('/google/callback', async (request, reply) => {
    const { token } = await fastify.oauth2Google!.getAccessTokenFromAuthorizationCodeFlow(request);
    const userinfo = (await fastify.oauth2Google!.userinfo(token)) as {
      sub: string;
      email: string;
      email_verified?: unknown;
    };
    if (userinfo.email_verified !== true) {
      throw new OAuthEmailNotVerifiedError();
    }

    const { sub } = userinfo;
    const email = parseBody(userinfo.email, EmailSchema);

    const { accessToken, familyUuid, rawRefreshToken } = await findOrCreateOAuthUser({
      fastify,
      provider: 'google',
      providerUserId: sub,
      email,
    });

    setAuthCookies(reply, accessToken, familyUuid, rawRefreshToken);
    return reply.redirect(APP_URL);
  });
};
