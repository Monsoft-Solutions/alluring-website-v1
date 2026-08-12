CREATE TYPE "public"."content_refresh_status" AS ENUM('pending', 'in_progress', 'ready_for_review', 'applied', 'dismissed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."gsc_sync_status" AS ENUM('running', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."gsc_sync_trigger" AS ENUM('cron', 'manual', 'backfill');--> statement-breakpoint
CREATE TYPE "public"."refresh_mode" AS ENUM('off', 'suggest', 'auto');--> statement-breakpoint
ALTER TYPE "public"."autopilot_run_kind" ADD VALUE 'refresh';--> statement-breakpoint
CREATE TABLE "blog_post_revision" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blog_post_id" uuid NOT NULL,
	"reason" varchar(40) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"meta_title" varchar(255),
	"meta_description" text,
	"meta_keywords" text,
	"excerpt" text,
	"faqs" jsonb,
	"quick_answer" text,
	"ai_summary" text,
	"reading_time" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cannibalization_report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week_start" date NOT NULL,
	"findings" jsonb NOT NULL,
	"findings_count" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_refresh" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blog_post_id" uuid NOT NULL,
	"status" "content_refresh_status" DEFAULT 'pending' NOT NULL,
	"sources" jsonb NOT NULL,
	"score" double precision DEFAULT 0 NOT NULL,
	"brief" jsonb,
	"working_post_id" uuid,
	"revision_id" uuid,
	"change_summary" text,
	"workflow_run_id" varchar(191),
	"error" text,
	"applied_at" timestamp,
	"measured_at" timestamp,
	"outcome" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gsc_query_page_daily" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"query" text NOT NULL,
	"page" text NOT NULL,
	"blog_post_id" uuid,
	"clicks" integer NOT NULL,
	"impressions" integer NOT NULL,
	"ctr" double precision NOT NULL,
	"position" double precision NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gsc_sync_run" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trigger" "gsc_sync_trigger" DEFAULT 'cron' NOT NULL,
	"status" "gsc_sync_status" DEFAULT 'running' NOT NULL,
	"dates_pulled" jsonb,
	"rows_upserted" integer,
	"error" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog_ai_config" ADD COLUMN "refresh_mode" "refresh_mode" DEFAULT 'off' NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_ai_config" ADD COLUMN "refresh_stale_months" integer DEFAULT 6 NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_ai_config" ADD COLUMN "refresh_position_drop_threshold" double precision DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_ai_config" ADD COLUMN "refresh_cooldown_days" integer DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_ai_config" ADD COLUMN "refresh_draft_cap" integer DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_post" ADD COLUMN "refresh_of_post_id" uuid;--> statement-breakpoint
ALTER TABLE "blog_post_revision" ADD CONSTRAINT "blog_post_revision_blog_post_id_blog_post_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_refresh" ADD CONSTRAINT "content_refresh_blog_post_id_blog_post_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_refresh" ADD CONSTRAINT "content_refresh_working_post_id_blog_post_id_fk" FOREIGN KEY ("working_post_id") REFERENCES "public"."blog_post"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_refresh" ADD CONSTRAINT "content_refresh_revision_id_blog_post_revision_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."blog_post_revision"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gsc_query_page_daily" ADD CONSTRAINT "gsc_query_page_daily_blog_post_id_blog_post_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_post"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_post_revision_post_created_idx" ON "blog_post_revision" USING btree ("blog_post_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cannibalization_report_week_start_idx" ON "cannibalization_report" USING btree ("week_start");--> statement-breakpoint
CREATE UNIQUE INDEX "content_refresh_active_idx" ON "content_refresh" USING btree ("blog_post_id") WHERE "content_refresh"."status" IN ('pending', 'in_progress', 'ready_for_review');--> statement-breakpoint
CREATE INDEX "content_refresh_status_score_idx" ON "content_refresh" USING btree ("status","score");--> statement-breakpoint
CREATE UNIQUE INDEX "gsc_qpd_date_query_page_idx" ON "gsc_query_page_daily" USING btree ("date","query","page");--> statement-breakpoint
CREATE INDEX "gsc_qpd_page_date_idx" ON "gsc_query_page_daily" USING btree ("page","date");--> statement-breakpoint
CREATE INDEX "gsc_qpd_query_date_idx" ON "gsc_query_page_daily" USING btree ("query","date");--> statement-breakpoint
CREATE INDEX "gsc_qpd_post_date_idx" ON "gsc_query_page_daily" USING btree ("blog_post_id","date") WHERE "gsc_query_page_daily"."blog_post_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "gsc_sync_run_started_idx" ON "gsc_sync_run" USING btree ("started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "gsc_sync_run_single_running_idx" ON "gsc_sync_run" USING btree ("status") WHERE "gsc_sync_run"."status" = 'running';--> statement-breakpoint
ALTER TABLE "blog_post" ADD CONSTRAINT "blog_post_refresh_of_post_id_fk" FOREIGN KEY ("refresh_of_post_id") REFERENCES "public"."blog_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_post_refresh_of_idx" ON "blog_post" USING btree ("refresh_of_post_id") WHERE "blog_post"."refresh_of_post_id" IS NOT NULL;