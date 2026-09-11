ALTER TYPE "public"."event_status" RENAME TO "ride_status";--> statement-breakpoint
ALTER TABLE "events" RENAME TO "rides";--> statement-breakpoint
ALTER TABLE "event_participants" RENAME TO "ride_participants";--> statement-breakpoint
ALTER TABLE "ride_participants" RENAME COLUMN "event_id" TO "ride_id";--> statement-breakpoint
ALTER TABLE "rides" RENAME CONSTRAINT "events_creator_id_users_id_fk" TO "rides_creator_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "rides" RENAME CONSTRAINT "events_route_id_routes_id_fk" TO "rides_route_id_routes_id_fk";--> statement-breakpoint
ALTER TABLE "ride_participants" RENAME CONSTRAINT "event_participants_event_id_events_id_fk" TO "ride_participants_ride_id_rides_id_fk";--> statement-breakpoint
ALTER TABLE "ride_participants" RENAME CONSTRAINT "event_participants_user_id_users_id_fk" TO "ride_participants_user_id_users_id_fk";--> statement-breakpoint
ALTER INDEX "events_pkey" RENAME TO "rides_pkey";--> statement-breakpoint
ALTER INDEX "event_participants_event_id_user_id_pk" RENAME TO "ride_participants_ride_id_user_id_pk";--> statement-breakpoint
ALTER INDEX "events_start_location_idx" RENAME TO "rides_start_location_idx";--> statement-breakpoint
ALTER INDEX "events_start_location_geog_idx" RENAME TO "rides_start_location_geog_idx";
