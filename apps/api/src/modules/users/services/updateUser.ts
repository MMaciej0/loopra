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
      ...(dismiss_location_prompt ? { location_prompt_dismissed_at: new Date() } : {}),
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      email: users.email,
      username: users.username,
      created_at: users.created_at,
      email_verified: users.email_verified,
      favorite_location: users.favorite_location,
      favorite_city: users.favorite_city,
      favorite_municipality: users.favorite_municipality,
      favorite_region: users.favorite_region,
      favorite_country: users.favorite_country,
      favorite_postal_code: users.favorite_postal_code,
      location_prompt_dismissed_at: users.location_prompt_dismissed_at,
    });

  if (!updatedUser) {
    throw new UserNotFoundError();
  }

  return updatedUser;
};
