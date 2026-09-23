CREATE TABLE "favorite_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"location" geometry(Point, 4326) NOT NULL,
	"city" text NOT NULL,
	"district" text,
	"municipality" text,
	"region" text,
	"country" text NOT NULL,
	"postal_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "favorite_locations" ADD CONSTRAINT "favorite_locations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;