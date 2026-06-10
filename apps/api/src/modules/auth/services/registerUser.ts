import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import type { FastifyInstance } from 'fastify';
import { users } from '../../../db/schema.js';
import { createTokenFamily } from './tokenFamily.js';
import { sendEmailVerification } from './sendEmailVerification.js';
import { UserAlreadyExistsError, OAuthOnlyAccountError } from '../errors.js';
import { RegisterBody } from '../schema.js';

interface RegisterUserParams {
  fastify: FastifyInstance;
  registerCredentials: RegisterBody;
}

export const registerUser = async ({ fastify, registerCredentials }: RegisterUserParams) => {
  const { email, password, username } = registerCredentials;
  const [existingUser] = await fastify.db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    if (!existingUser.password_hash) {
      throw new OAuthOnlyAccountError();
    }
    throw new UserAlreadyExistsError();
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await fastify.db
    .insert(users)
    .values({ email, password_hash: passwordHash, username })
    .returning();

  const { familyUuid, rawRefreshToken } = await createTokenFamily(fastify.redis, user.id);
  const accessToken = fastify.jwt.sign({ sub: user.id, email_verified: user.email_verified });
  sendEmailVerification(email, fastify.db, fastify.redis, fastify.mailer).catch(() => {});

  return { user, accessToken, rawRefreshToken, familyUuid };
};
