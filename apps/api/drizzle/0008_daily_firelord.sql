CREATE TYPE "public"."pace_policy" AS ENUM('slowest_rider', 'leader', 'group_split');--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "pace_kmh" TO "average_pace_kmh";--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "pace_policy" "pace_policy" DEFAULT 'slowest_rider' NOT NULL;