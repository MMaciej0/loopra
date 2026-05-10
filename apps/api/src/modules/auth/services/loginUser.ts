import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { users } from '../../../db/schema.js';
import { createTokenFamily } from './tokenFamily.js';
import { UserNotFoundError, InvalidPasswordError, OAuthOnlyAccountError } from '../errors.js';

interface LoginUserParams {
  fastify: FastifyInstance;
  email: string;
  password: string;
}

export const loginUser = async ({ fastify, email, password }: LoginUserParams) => {
  const [user] = await fastify.db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    throw new UserNotFoundError();
  }

  if (!user.password_hash) {
    throw new OAuthOnlyAccountError();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new InvalidPasswordError();
  }

  const { familyUuid, rawRefreshToken } = await createTokenFamily(fastify.redis, user.id);
  const accessToken = fastify.jwt.sign({ sub: user.id, email_verified: user.email_verified });

  return { user, accessToken, rawRefreshToken, familyUuid };
};
