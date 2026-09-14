import { eq } from 'drizzle-orm';
import type { Db } from '../../../db/index.js';
import { users } from '../../../db/schema.js';
import { UpdateUserBody } from '../schema.js';
import { UserNotFoundError } from '../errors.js';

export const updateUser = async (db: Db, userId: string, body: UpdateUserBody) => {
  const { dismiss_location_prompt, ...updates } = body;
  const [updatedUser] = await db
    .update(users)
    .set({
      ...updates,
      ...(updates.favorite_location ? { favorite_location_chosen: true } : {}),
      ...(dismiss_location_prompt ? { location_prompt_dismissed_at: new Date() } : {}),
    })
    .where(eq(users.id, userId))
    .returning();

  if (!updatedUser) {
    throw new UserNotFoundError();
  }

  return updatedUser;
};
