import { eq, getTableColumns } from 'drizzle-orm';
import type { Db } from '../../../db/index.js';
import { selected_locations, users } from '../../../db/schema.js';
import { UserNotFoundError } from '../errors.js';

const { user_id: _userId, ...selectedLocationColumns } = getTableColumns(selected_locations);

export const getCurrentUser = async (db: Db, userId: string) => {
  const [row] = await db
    .select({ user: users, selected_location: selectedLocationColumns })
    .from(users)
    .leftJoin(selected_locations, eq(selected_locations.user_id, users.id))
    .where(eq(users.id, userId));

  if (!row) {
    throw new UserNotFoundError();
  }

  return {
    ...row.user,
    has_password: row.user.password_hash !== null,
    selected_location: row.selected_location,
  };
};
