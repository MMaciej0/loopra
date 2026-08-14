ALTER TYPE "public"."event_difficulty" RENAME TO "ride_type";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "difficulty" TO "ride_type";--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "ride_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."ride_type";--> statement-breakpoint
CREATE TYPE "public"."ride_type" AS ENUM('coffee_ride', 'sightseeing', 'casual', 'training');--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "ride_type" SET DATA TYPE "public"."ride_type" USING "ride_type"::"public"."ride_type";