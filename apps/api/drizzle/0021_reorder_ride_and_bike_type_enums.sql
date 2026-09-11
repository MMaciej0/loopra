ALTER TABLE "rides" ALTER COLUMN "bike_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."bike_type";--> statement-breakpoint
CREATE TYPE "public"."bike_type" AS ENUM('any', 'road', 'gravel', 'mtb', 'trekking', 'urban', 'cyclocross', 'tt', 'electric');--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "bike_type" SET DATA TYPE "public"."bike_type" USING "bike_type"::"public"."bike_type";--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "ride_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."ride_type";--> statement-breakpoint
CREATE TYPE "public"."ride_type" AS ENUM('casual', 'coffee_ride', 'sightseeing', 'training');--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "ride_type" SET DATA TYPE "public"."ride_type" USING "ride_type"::"public"."ride_type";