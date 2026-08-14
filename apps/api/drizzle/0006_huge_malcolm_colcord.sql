ALTER TABLE "events" ALTER COLUMN "ride_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "type";--> statement-breakpoint
DROP TYPE "public"."event_type";