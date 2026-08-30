-- drizzle-kit emits `geometry(point)` and drops the srid declared in the schema,
-- so existing rows carry srid 0. Pin both columns to 4326 to match the schema and
-- to keep comparisons against properly tagged 4326 geometries from erroring.
ALTER TABLE "events" ALTER COLUMN "start_location"
  TYPE geometry(Point, 4326) USING ST_SetSRID("start_location", 4326);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "favorite_location"
  TYPE geometry(Point, 4326) USING ST_SetSRID("favorite_location", 4326);
--> statement-breakpoint
-- Radius search runs on `::geography` so distances are metres rather than degrees.
-- The gist indexes on the plain geometry columns cannot serve that cast, so index
-- the cast expression itself.
CREATE INDEX "events_start_location_geog_idx"
  ON "events" USING gist ((("start_location")::geography));
--> statement-breakpoint
CREATE INDEX "users_favorite_location_geog_idx"
  ON "users" USING gist ((("favorite_location")::geography))
  WHERE "favorite_location" IS NOT NULL;
