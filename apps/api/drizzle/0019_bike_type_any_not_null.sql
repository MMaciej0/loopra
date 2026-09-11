ALTER TYPE "public"."bike_type" RENAME TO "bike_type_old";--> statement-breakpoint
CREATE TYPE "public"."bike_type" AS ENUM('any', 'road', 'gravel', 'mtb', 'trekking', 'urban', 'electric', 'cyclocross', 'tt');--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "bike_type" TYPE "public"."bike_type"
  USING COALESCE("bike_type"::text, 'any')::"public"."bike_type";--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "bike_type" SET NOT NULL;--> statement-breakpoint
DROP TYPE "public"."bike_type_old";
