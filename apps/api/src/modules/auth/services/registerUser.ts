import bcrypt from 'bcrypt';
import type { FastifyInstance } from 'fastify';
import { users } from '../../../db/schema.js';
import { createTokenFamily } from './tokenFamily.js';
import { sendEmailVerification } from './sendEmailVerification.js';
import { UserAlreadyExistsError } from '../errors.js';
import { RegisterBody } from '../schema.js';

interface RegisterUserParams {
  fastify: FastifyInstance;
  registerCredentials: RegisterBody;
}

export const registerUser = async ({ fastify, registerCredentials }: RegisterUserParams) => {
  const { email, password, username } = registerCredentials;
  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await fastify.db
    .insert(users)
    .values({ email, password_hash: passwordHash, username })
    .onConflictDoNothing({ target: users.email })
    .returning();

  if (!user) {
    throw new UserAlreadyExistsError();
  }

  const { familyUuid, rawRefreshToken } = await createTokenFamily(fastify.redis, user.id);
  const accessToken = fastify.jwt.sign({ sub: user.id, email_verified: user.email_verified });
  sendEmailVerification(email, fastify.db, fastify.redis, fastify.mailer).catch(() => {});

  return { user, accessToken, rawRefreshToken, familyUuid };
};
