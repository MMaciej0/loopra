UPDATE "users" SET
  "favorite_location" = COALESCE("favorite_location", ST_SetSRID(ST_MakePoint(19.937952607870102, 50.06052139064339), 4326)),
  "favorite_city" = COALESCE("favorite_city", 'Kraków'),
  "favorite_country" = COALESCE("favorite_country", 'Poland')
WHERE "favorite_location" IS NULL OR "favorite_city" IS NULL OR "favorite_country" IS NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "favorite_location" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "favorite_city" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "favorite_country" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "location_prompt_dismissed_at";