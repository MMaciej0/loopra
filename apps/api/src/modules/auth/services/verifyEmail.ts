import { Redis } from 'ioredis';
import { Db } from '../../../db/index.js';
import { consumeEmailVerificationToken } from './emailVerificationToken.js';
export { InvalidEmailVerificationTokenError } from '../errors.js';
import { users } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export const verifyEmail = async (token: string, db: Db, redis: Redis) => {
  const { email } = await consumeEmailVerificationToken(redis, token);

  await db
    .update(users)
    .set({ email_verified: true, email_verified_at: new Date() })
    .where(eq(users.email, email));
};
