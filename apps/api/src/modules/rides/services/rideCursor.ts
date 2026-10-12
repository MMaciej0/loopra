import { sql } from 'drizzle-orm';
import { rides } from '../../../db/schema.js';
import { RideCursor } from '../schema.js';

export const afterRideCursor = (cursor: RideCursor, order: 'asc' | 'desc' = 'asc') => {
  const rideRow = sql`(${rides.start_time}, ${rides.id})`;
  const cursorRow = sql`(${cursor.startTime}::timestamptz, ${cursor.id}::uuid)`;

  return order === 'desc' ? sql`${rideRow} < ${cursorRow}` : sql`${rideRow} > ${cursorRow}`;
};

export const toRidePage = <T extends { id: string; start_time: Date }>(
  rows: T[],
  limit: number,
) => {
  const data = rows.slice(0, limit);
  const last = data[data.length - 1];
  const nextCursor = rows.length > limit ? `${last.id}:${last.start_time.getTime()}` : null;

  return { data, nextCursor };
};
