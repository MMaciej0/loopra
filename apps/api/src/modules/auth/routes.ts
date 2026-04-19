import { FastifyInstance } from 'fastify';
import {
  ForgottenPasswordBodySchema,
  LoginBodySchema,
  RegisterBodySchema,
  ResetPasswordBodySchema,
} from './schema.js';
import { OAuthOnlyAccountError as RegisterOAuthOnlyAccountError, registerUser, UserAlreadyExistsError } from './services/registerUser.js';
import { clearAuthCookies, setAuthCookies } from './services/cookies.js';
import { parseBody } from '../../utils/validation.js';
import { InvalidPasswordError, loginUser, OAuthOnlyAccountError, UserNotFoundError } from './services/loginUser.js';
import { AppError, ErrorType } from '../../utils/errors.js';
import {
  deleteTokenFamily,
  InvalidTokenError,
  rotateTokenFamily,
} from './services/tokenFamily.js';
import { sendResetPasswordToken } from './services/sendResetPasswordToken.js';
import { resetPassword } from './services/resetPassword.js';
import { InvalidResetTokenError } from './services/passwordResetToken.js';
import { findOrCreateOAuthUser } from './services/findOrCreateOAuthUser.js';
import { APP_URL } from '../../config/env.js';

export const authRoutes = (fastify: FastifyInstance, _options: unknown) => {
  fastify.post('/register', async (request, reply) => {
    const { email, password } = parseBody(request.body, RegisterBodySchema);

    try {
      const { familyUuid, rawRefreshToken, user } = await registerUser(
        fastify.db,
        fastify.redis,
        email,
        password,
      );

      const accessToken = fastify.jwt.sign({ sub: user.id });
      setAuthCookies(reply, accessToken, familyUuid, rawRefreshToken);
      return reply.send({ user: { id: user.id, email: user.email } });
    } catch (error) {
      if (error instanceof RegisterOAuthOnlyAccountError) {
        throw new AppError(409, ErrorType.OAUTH_ONLY_ACCOUNT, 'This email is registered via Google. Please log in with Google.');
      } else if (error instanceof UserAlreadyExistsError) {
        throw new AppError(409, ErrorType.USER_ALREADY_EXISTS, 'User already exists');
      }
      throw error;
    }
  });

  fastify.post('/login', async (request, reply) => {
    const { email, password } = parseBody(request.body, LoginBodySchema);

    try {
      const { familyUuid, rawRefreshToken, user } = await loginUser(
        fastify.db,
        fastify.redis,
        email,
        password,
      );

      const accessToken = fastify.jwt.sign({ sub: user.id });
      setAuthCookies(reply, accessToken, familyUuid, rawRefreshToken);
      return reply.send({ user: { id: user.id, email: user.email } });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new AppError(401, ErrorType.USER_NOT_FOUND, 'User not found');
      } else if (error instanceof OAuthOnlyAccountError) {
        throw new AppError(401, ErrorType.OAUTH_ONLY_ACCOUNT, 'This account uses Google sign-in. Please log in with Google.');
      } else if (error instanceof InvalidPasswordError) {
        throw new AppError(401, ErrorType.INVALID_PASSWORD, 'Invalid password');
      }
      throw error;
    }
  });

  fastify.post('/refresh', async (request, reply) => {
    const refreshTokenCookie = request.cookies.refreshToken;

    if (!refreshTokenCookie) {
      throw new AppError(401, ErrorType.UNAUTHORIZED, 'Unauthorized');
    }

    try {
      const [familyUuid, rawRefreshToken] = refreshTokenCookie.split('.');
      const { newRawRefreshToken, userId } = await rotateTokenFamily(
        fastify.redis,
        familyUuid,
        rawRefreshToken,
      );

      const accessToken = fastify.jwt.sign({ sub: userId });

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

    try {
      const [familyUuid] = refreshTokenCookie.split('.');
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

  fastify.get('/google/callback', async (request, reply) => {
    const { token } = await fastify.oauth2Google!.getAccessTokenFromAuthorizationCodeFlow(request);
    const { sub, email } = (await fastify.oauth2Google!.userinfo(token)) as {
      sub: string;
      email: string;
    };

    const { userId, familyUuid, rawRefreshToken } = await findOrCreateOAuthUser(
      fastify.db,
      fastify.redis,
      'google',
      sub,
      email,
    );

    const accessToken = fastify.jwt.sign({ sub: userId });
    setAuthCookies(reply, accessToken, familyUuid, rawRefreshToken);
    return reply.redirect(APP_URL);
  });
};
