ALTER TABLE "users" ADD COLUMN "favorite_location_chosen" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "users" SET "favorite_location_chosen" = true WHERE "favorite_location" IS NOT NULL;
