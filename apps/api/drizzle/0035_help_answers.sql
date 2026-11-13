CREATE TYPE "public"."app_env" AS ENUM('development', 'staging', 'production');--> statement-breakpoint
CREATE TYPE "public"."help_answer_status" AS ENUM('completed', 'error', 'aborted');--> statement-breakpoint
CREATE TYPE "public"."help_rating" AS ENUM('up', 'down');--> statement-breakpoint
CREATE TYPE "public"."help_version" AS ENUM('v1', 'v2');--> statement-breakpoint
CREATE TYPE "public"."locale" AS ENUM('en', 'pl');--> statement-breakpoint
CREATE TABLE "help_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"topic" text,
	"fallback" boolean DEFAULT false NOT NULL,
	"locale" "locale" NOT NULL,
	"site" "app_env" NOT NULL,
	"version" "help_version" NOT NULL,
	"status" "help_answer_status" NOT NULL,
	"rating" "help_rating",
	"model" text NOT NULL,
	"stop_reason" text,
	"input_tokens" integer,
	"output_tokens" integer,
	"cache_read_tokens" integer,
	"duration_ms" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "help_answers_conversation_idx" ON "help_answers" USING btree ("conversation_id","created_at");