CREATE TABLE "selected_locations" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"location" geometry(Point, 4326) NOT NULL,
	"city" text NOT NULL,
	"district" text,
	"municipality" text,
	"region" text,
	"country" text NOT NULL,
	"postal_code" text
);
--> statement-breakpoint
ALTER TABLE "selected_locations" ADD CONSTRAINT "selected_locations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "favorite_location";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "favorite_city";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "favorite_district";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "favorite_municipality";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "favorite_region";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "favorite_country";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "favorite_postal_code";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "favorite_location_chosen";