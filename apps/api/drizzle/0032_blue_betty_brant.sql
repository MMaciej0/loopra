ALTER TABLE "rides" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
UPDATE "rides" SET "status" = 'published' WHERE "status" NOT IN ('draft', 'cancelled');--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "status" SET DEFAULT 'published'::text;--> statement-breakpoint
DROP TYPE "public"."ride_status";--> statement-breakpoint
CREATE TYPE "public"."ride_status" AS ENUM('draft', 'published', 'cancelled');--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "status" SET DEFAULT 'published'::"public"."ride_status";--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "status" SET DATA TYPE "public"."ride_status" USING "status"::"public"."ride_status";