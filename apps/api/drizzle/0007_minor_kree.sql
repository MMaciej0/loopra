CREATE TYPE "public"."drop_policy" AS ENUM('no_drop', 'regroup', 'drop');--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "drop_policy" "drop_policy" DEFAULT 'no_drop' NOT NULL;