import { eq } from 'drizzle-orm';
import type { Db } from '../../../db/index.js';
import { users } from '../../../db/schema.js';
import { UpdateUserBody } from '../schema.js';
import { UserNotFoundError } from '../errors.js';

export const updateUser = async (db: Db, userId: string, body: UpdateUserBody) => {
  const [updatedUser] = await db
    .update(users)
    .set({
      ...body,
      ...(body.favorite_location ? { favorite_location_chosen: true } : {}),
    })
    .where(eq(users.id, userId))
    .returning();

  if (!updatedUser) {
    throw new UserNotFoundError();
  }

  return updatedUser;
};
