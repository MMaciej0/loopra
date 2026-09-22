import { eq } from 'drizzle-orm';
import type { Db } from '../../../db/index.js';
import { selected_locations, users } from '../../../db/schema.js';
import { ReplaceSelectedLocationBody } from '../schema.js';
import { UserNotFoundError } from '../errors.js';

export const replaceSelectedLocation = async (
  db: Db,
  userId: string,
  body: ReplaceSelectedLocationBody,
) => {
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));

  if (!user) {
    throw new UserNotFoundError();
  }

  const [selectedLocation] = await db
    .insert(selected_locations)
    .values({ user_id: userId, ...body })
    .onConflictDoUpdate({ target: selected_locations.user_id, set: body })
    .returning();

  return selectedLocation;
};
