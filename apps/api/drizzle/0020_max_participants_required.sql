-- Rides with no cap predate the "every ride is capped" rule. 500 is the maximum
-- the API accepts, so it is the closest capped equivalent to "unlimited".
UPDATE "rides" SET "max_participants" = 500 WHERE "max_participants" IS NULL;--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "max_participants" SET NOT NULL;
