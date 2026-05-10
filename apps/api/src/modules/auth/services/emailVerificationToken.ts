import { Redis } from 'ioredis';
import { createHash, randomBytes } from 'node:crypto';
import { InvalidEmailVerificationTokenError } from '../errors.js';

const TTL_SECONDS = 60 * 60 * 24; // 24 hours
const TOKEN_KEY = (tokenHash: string) => `email-verification:${tokenHash}`;
const EMAIL_KEY = (email: string) => `email-verification:email:${email}`;

export const createEmailVerificationToken = async (redis: Redis, email: string) => {
  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');

  const existingHash = await redis.get(EMAIL_KEY(email));

  const pipeline = redis.pipeline();
  if (existingHash) {
    pipeline.del(TOKEN_KEY(existingHash));
  }
  pipeline.set(TOKEN_KEY(tokenHash), email, 'EX', TTL_SECONDS);
  pipeline.set(EMAIL_KEY(email), tokenHash, 'EX', TTL_SECONDS);
  await pipeline.exec();

  return { rawToken };
};

export const consumeEmailVerificationToken = async (redis: Redis, rawToken: string) => {
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');
  const email = await redis.get(TOKEN_KEY(tokenHash));

  if (!email) throw new InvalidEmailVerificationTokenError();

  await redis.del(TOKEN_KEY(tokenHash), EMAIL_KEY(email));

  return { email };
};
