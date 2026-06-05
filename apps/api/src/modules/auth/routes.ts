import { FastifyInstance } from 'fastify';
import {
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
import { findOrCreateOAuthUser } from './services/findOrCreateOAuthUser.js';
import { sendEmailVerification } from './services/sendEmailVerification.js';
import { verifyEmail } from './services/verifyEmail.js';
import {
  UserAlreadyExistsError,
  OAuthOnlyAccountError,
  UserNotFoundError,
  InvalidPasswordError,
  InvalidTokenError,
  InvalidResetTokenError,
  InvalidEmailVerificationTokenError,
} from './errors.js';
import { clearAuthCookies, setAuthCookies } from './services/cookies.js';
import { parseBody } from '../../utils/validation.js';
import { AppError, ErrorType } from '../../utils/errors.js';
import { APP_URL } from '../../config/env.js';
import { authRateLimiter, clearRateLimits, emailSendRateLimiter } from './services/rateLimiter.js';

export const authRoutes = (fastify: FastifyInstance, _options: unknown) => {
  fastify.post('/register', async (request, reply) => {
    const { email, password } = parseBody(request.body, RegisterBodySchema);
    await authRateLimiter(request, fastify.redis);

    try {
      const { user, accessToken, familyUuid, rawRefreshToken } = await registerUser({
        fastify,
        email,
        password,
      });
      setAuthCookies(reply, accessToken, familyUuid, rawRefreshToken);
      return reply.send({
        user: { id: user.id, email: user.email, emailVerified: user.email_verified },
      });
    } catch (error) {
      if (error instanceof OAuthOnlyAccountError) {
        throw new AppError(
          409,
          ErrorType.OAUTH_ONLY_ACCOUNT,
          'This email is registered via Google. Please log in with Google.',
        );
      } else if (error instanceof UserAlreadyExistsError) {
        throw new AppError(409, ErrorType.USER_ALREADY_EXISTS, 'User already exists');
      }
      throw error;
    }
  });

  fastify.post('/login', async (request, reply) => {
    const { email, password } = parseBody(request.body, LoginBodySchema);
    await authRateLimiter(request, fastify.redis, email);

    try {
      const { user, accessToken, familyUuid, rawRefreshToken } = await loginUser({
        fastify,
        email,
        password,
      });
      setAuthCookies(reply, accessToken, familyUuid, rawRefreshToken);
      await clearRateLimits(request, fastify.redis, email);
      return reply.send({
        user: { id: user.id, email: user.email, emailVerified: user.email_verified },
      });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new AppError(401, ErrorType.INVALID_CREDENTIALS, 'Invalid credentials');
      } else if (error instanceof OAuthOnlyAccountError) {
        throw new AppError(
          401,
          ErrorType.OAUTH_ONLY_ACCOUNT,
          'This account uses Google sign-in. Please log in with Google.',
        );
      } else if (error instanceof InvalidPasswordError) {
        throw new AppError(401, ErrorType.INVALID_CREDENTIALS, 'Invalid credentials');
      }
      throw error;
    }
  });

  fastify.post('/refresh', async (request, reply) => {
    const refreshTokenCookie = request.cookies.refreshToken;

    if (!refreshTokenCookie) {
      throw new AppError(401, ErrorType.UNAUTHORIZED, 'Unauthorized');
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
        throw new AppError(401, ErrorType.INVALID_TOKEN, 'Invalid token');
      }
      throw error;
    }
  });

  fastify.delete('/logout', async (request, reply) => {
    const refreshTokenCookie = request.cookies.refreshToken;

    if (!refreshTokenCookie) {
      throw new AppError(401, ErrorType.UNAUTHORIZED, 'Unauthorized');
    }

    const [familyUuid] = refreshTokenCookie.split('.');

    try {
      await deleteTokenFamily(fastify.redis, familyUuid);
      clearAuthCookies(reply);
      return reply.send({ message: 'Logout successful' });
    } catch (error) {
      if (error instanceof InvalidTokenError) {
        clearAuthCookies(reply);
        throw new AppError(401, ErrorType.INVALID_TOKEN, 'Invalid token');
      }
      throw error;
    }
  });

  fastify.post('/forgot-password', async (request, reply) => {
    const { email } = parseBody(request.body, ForgottenPasswordBodySchema);
    await emailSendRateLimiter(request, fastify.redis, email);

    // Always return 200 — never reveal whether email exists in the system
    await sendResetPasswordToken(email, fastify.db, fastify.redis, fastify.mailer).catch(() => {});
    return reply.send({ message: 'If that email exists, a reset link has been sent.' });
  });

  fastify.post('/reset-password', async (request, reply) => {
    const { token, password } = parseBody(request.body, ResetPasswordBodySchema);

    try {
      await resetPassword(token, password, fastify.db, fastify.redis);
      return reply.send({ message: 'Password reset successful' });
    } catch (error) {
      if (error instanceof InvalidResetTokenError) {
        throw new AppError(401, ErrorType.INVALID_TOKEN, 'Invalid token');
      }
      throw error;
    }
  });

  fastify.post('/resend-verification-email', async (request, reply) => {
    const { email } = parseBody(request.body, ResendEmailVerificationBodySchema);
    await emailSendRateLimiter(request, fastify.redis, email);

    // Always return 200 — never reveal whether email exists or is already verified
    await sendEmailVerification(email, fastify.db, fastify.redis, fastify.mailer).catch(() => {});
    return reply.send({
      message: 'If that email exists and is unverified, a new link has been sent.',
    });
  });

  fastify.post('/verify-email', async (request, reply) => {
    const { token } = parseBody(request.body, VerifyEmailBodySchema);

    try {
      await verifyEmail(token, fastify.db, fastify.redis);
      return reply.send({ message: 'Email verification successful' });
    } catch (error) {
      if (error instanceof InvalidEmailVerificationTokenError) {
        throw new AppError(400, ErrorType.INVALID_TOKEN, 'Invalid or expired verification token');
      }
      throw error;
    }
  });

  fastify.get('/google/callback', async (request, reply) => {
    const { token } = await fastify.oauth2Google!.getAccessTokenFromAuthorizationCodeFlow(request);
    const { sub, email } = (await fastify.oauth2Google!.userinfo(token)) as {
      sub: string;
      email: string;
    };

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
