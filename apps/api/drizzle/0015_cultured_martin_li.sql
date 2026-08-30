ALTER TABLE "users" ADD COLUMN "favorite_location" geometry(point);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "favorite_city" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "favorite_municipality" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "favorite_region" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "favorite_country" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "favorite_postal_code" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "location_prompt_dismissed_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "events_start_location_idx" ON "events" USING gist ("start_location");--> statement-breakpoint
CREATE INDEX "users_favorite_location_idx" ON "users" USING gist ("favorite_location") WHERE "users"."favorite_location" is not null;