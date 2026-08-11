CREATE TYPE "public"."autopilot_cadence" AS ENUM('daily', 'weekdays', 'weekly');--> statement-breakpoint
CREATE TYPE "public"."autopilot_mode" AS ENUM('off', 'ideas', 'full');--> statement-breakpoint
CREATE TYPE "public"."autopilot_run_kind" AS ENUM('ideation', 'content');--> statement-breakpoint
CREATE TYPE "public"."autopilot_run_status" AS ENUM('running', 'completed', 'skipped', 'failed');--> statement-breakpoint
CREATE TYPE "public"."autopilot_trigger" AS ENUM('cron', 'manual');--> statement-breakpoint
CREATE TYPE "public"."idea_approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "autopilot_run" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "autopilot_run_kind" NOT NULL,
	"trigger" "autopilot_trigger" DEFAULT 'cron' NOT NULL,
	"mode" varchar(10) NOT NULL,
	"status" "autopilot_run_status" DEFAULT 'running' NOT NULL,
	"skip_reason" varchar(40),
	"topic_title" text,
	"post_id" uuid,
	"workflow_run_id" varchar(120),
	"phase_outcomes" jsonb,
	"ideas_created" integer,
	"refresh_candidates" jsonb,
	"quality_score" integer,
	"error" text,
	"acknowledged_at" timestamp,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog_ai_config" ADD COLUMN "autopilot_mode" "autopilot_mode" DEFAULT 'off' NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_ai_config" ADD COLUMN "autopilot_ideation_cadence" "autopilot_cadence" DEFAULT 'weekly' NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_ai_config" ADD COLUMN "autopilot_content_cadence" "autopilot_cadence" DEFAULT 'weekly' NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_ai_config" ADD COLUMN "autopilot_posts_per_run" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_ai_config" ADD COLUMN "autopilot_draft_cap" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_ai_config" ADD COLUMN "autopilot_ideas_per_run" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_post" ADD COLUMN "idea_approval" "idea_approval_status";--> statement-breakpoint
ALTER TABLE "autopilot_run" ADD CONSTRAINT "autopilot_run_post_id_blog_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_post"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "autopilot_run_status_idx" ON "autopilot_run" USING btree ("status");--> statement-breakpoint
CREATE INDEX "autopilot_run_kind_started_idx" ON "autopilot_run" USING btree ("kind","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "autopilot_run_single_running_idx" ON "autopilot_run" USING btree ("kind") WHERE "autopilot_run"."status" = 'running';--> statement-breakpoint
CREATE INDEX "blog_post_status_idea_approval_idx" ON "blog_post" USING btree ("status","idea_approval");