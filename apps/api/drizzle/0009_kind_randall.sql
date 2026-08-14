CREATE TYPE "public"."formation_policy" AS ENUM('free', 'leader', 'rotation');--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "formation_policy" "formation_policy" DEFAULT 'free' NOT NULL;