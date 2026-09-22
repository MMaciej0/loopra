import { eq } from 'drizzle-orm';
import type { Db } from '../../../db/index.js';
import { users } from '../../../db/schema.js';
import { UpdateUserBody } from '../schema.js';
import { UserNotFoundError } from '../errors.js';
import { getCurrentUser } from './getCurrentUser.js';

export const updateUser = async (db: Db, userId: string, body: UpdateUserBody) => {
  const [updatedUser] = await db
    .update(users)
    .set(body)
    .where(eq(users.id, userId))
    .returning({ id: users.id });

  if (!updatedUser) {
    throw new UserNotFoundError();
  }

  return getCurrentUser(db, userId);
};
