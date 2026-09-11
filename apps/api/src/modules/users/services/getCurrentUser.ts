import { eq } from 'drizzle-orm';
import type { Db } from '../../../db/index.js';
import { users } from '../../../db/schema.js';
import { UserNotFoundError } from '../errors.js';

export const getCurrentUser = async (db: Db, userId: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  return user;
};
