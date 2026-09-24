CREATE TYPE "public"."ads_sync_job" AS ENUM('snapshot', 'lead-clicks');--> statement-breakpoint
CREATE TYPE "public"."ads_sync_status" AS ENUM('running', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."ads_sync_trigger" AS ENUM('cron', 'manual', 'backfill');--> statement-breakpoint
CREATE TYPE "public"."ads_term_class_name" AS ENUM('brand', 'competitor', 'procedure', 'address', 'other');--> statement-breakpoint
CREATE TYPE "public"."lead_ad_match" AS ENUM('click', 'ios_click', 'campaign', 'tagged_only', 'not_found', 'expired');--> statement-breakpoint
CREATE TABLE "ads_campaign_daily" (
	"date" date NOT NULL,
	"campaign_id" text NOT NULL,
	"campaign_name" text NOT NULL,
	"status" text NOT NULL,
	"channel" text NOT NULL,
	"bidding_strategy" text NOT NULL,
	"daily_budget" numeric(12, 2),
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"cost" numeric(12, 2) DEFAULT 0 NOT NULL,
	"conversions" numeric(12, 2) DEFAULT 0 NOT NULL,
	"all_conversions" numeric(12, 2) DEFAULT 0 NOT NULL,
	"synced_at" timestamp DEFAULT now() NOT NULL,
	"search_impression_share" double precision,
	"search_budget_lost_impression_share" double precision,
	"search_rank_lost_impression_share" double precision,
	CONSTRAINT "ads_campaign_daily_date_campaign_id_pk" PRIMARY KEY("date","campaign_id")
);
--> statement-breakpoint
CREATE TABLE "ads_change_event" (
	"resource_name" text PRIMARY KEY NOT NULL,
	"changed_at" timestamp NOT NULL,
	"user_email" text NOT NULL,
	"client_type" text NOT NULL,
	"resource_type" text NOT NULL,
	"operation" text NOT NULL,
	"changed_fields" text[] DEFAULT '{}'::text[] NOT NULL,
	"campaign_id" text,
	"campaign_name" text,
	"ad_group_id" text,
	"ad_group_name" text,
	"values" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ads_conversion_daily" (
	"date" date NOT NULL,
	"conversion_action_id" text NOT NULL,
	"action_name" text NOT NULL,
	"category" text NOT NULL,
	"origin" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"primary_for_goal" boolean NOT NULL,
	"conversions" numeric(12, 2) DEFAULT 0 NOT NULL,
	"all_conversions" numeric(12, 2) DEFAULT 0 NOT NULL,
	"synced_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ads_conversion_daily_date_conversion_action_id_pk" PRIMARY KEY("date","conversion_action_id")
);
--> statement-breakpoint
CREATE TABLE "ads_keyword_daily" (
	"date" date NOT NULL,
	"ad_group_id" text NOT NULL,
	"criterion_id" text NOT NULL,
	"campaign_id" text NOT NULL,
	"campaign_name" text NOT NULL,
	"ad_group_name" text NOT NULL,
	"keyword" text NOT NULL,
	"match_type" text NOT NULL,
	"status" text NOT NULL,
	"quality_score" integer,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"cost" numeric(12, 2) DEFAULT 0 NOT NULL,
	"conversions" numeric(12, 2) DEFAULT 0 NOT NULL,
	"all_conversions" numeric(12, 2) DEFAULT 0 NOT NULL,
	"synced_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ads_keyword_daily_date_ad_group_id_criterion_id_pk" PRIMARY KEY("date","ad_group_id","criterion_id")
);
--> statement-breakpoint
CREATE TABLE "ads_landing_page_daily" (
	"date" date NOT NULL,
	"campaign_id" text NOT NULL,
	"page" text NOT NULL,
	"expanded" boolean NOT NULL,
	"url_variants" integer DEFAULT 1 NOT NULL,
	"sample_url" text NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"cost" numeric(12, 2) DEFAULT 0 NOT NULL,
	"conversions" numeric(12, 2) DEFAULT 0 NOT NULL,
	"all_conversions" numeric(12, 2) DEFAULT 0 NOT NULL,
	"synced_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ads_landing_page_daily_date_campaign_id_page_expanded_pk" PRIMARY KEY("date","campaign_id","page","expanded")
);
--> statement-breakpoint
CREATE TABLE "ads_search_term_daily" (
	"date" date NOT NULL,
	"ad_group_id" text NOT NULL,
	"search_term" text NOT NULL,
	"match_type" text NOT NULL,
	"campaign_id" text NOT NULL,
	"campaign_name" text NOT NULL,
	"ad_group_name" text NOT NULL,
	"status" text NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"cost" numeric(12, 2) DEFAULT 0 NOT NULL,
	"conversions" numeric(12, 2) DEFAULT 0 NOT NULL,
	"all_conversions" numeric(12, 2) DEFAULT 0 NOT NULL,
	"synced_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ads_search_term_daily_date_ad_group_id_search_term_match_type_pk" PRIMARY KEY("date","ad_group_id","search_term","match_type")
);
--> statement-breakpoint
CREATE TABLE "ads_sync_run" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job" "ads_sync_job" NOT NULL,
	"trigger" "ads_sync_trigger" DEFAULT 'cron' NOT NULL,
	"status" "ads_sync_status" DEFAULT 'running' NOT NULL,
	"window_start" date,
	"window_end" date,
	"counts" jsonb,
	"api_operations" integer,
	"error" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ads_term_class" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pattern" text NOT NULL,
	"term_class" "ads_term_class_name" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_ad_click" (
	"lead_id" uuid PRIMARY KEY NOT NULL,
	"lead_date" date NOT NULL,
	"match" "lead_ad_match" NOT NULL,
	"click_id_type" text,
	"click_id" text,
	"click_id_source" text,
	"click_date" date,
	"campaign_id" text,
	"campaign_name" text,
	"ad_group_id" text,
	"ad_group_name" text,
	"keyword" text,
	"keyword_match_type" text,
	"device" text,
	"network" text,
	"landing_path" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_attempt_at" timestamp,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_submission" ADD COLUMN "landing_params" jsonb;--> statement-breakpoint
ALTER TABLE "lead_ad_click" ADD CONSTRAINT "lead_ad_click_lead_id_contact_submission_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."contact_submission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ads_campaign_daily_campaign_date_idx" ON "ads_campaign_daily" USING btree ("campaign_id","date");--> statement-breakpoint
CREATE INDEX "ads_change_event_changed_at_idx" ON "ads_change_event" USING btree ("changed_at");--> statement-breakpoint
CREATE INDEX "ads_change_event_campaign_idx" ON "ads_change_event" USING btree ("campaign_id","changed_at");--> statement-breakpoint
CREATE INDEX "ads_keyword_daily_campaign_date_idx" ON "ads_keyword_daily" USING btree ("campaign_id","date");--> statement-breakpoint
CREATE INDEX "ads_landing_page_daily_page_date_idx" ON "ads_landing_page_daily" USING btree ("page","date");--> statement-breakpoint
CREATE INDEX "ads_search_term_daily_campaign_date_idx" ON "ads_search_term_daily" USING btree ("campaign_id","date");--> statement-breakpoint
CREATE INDEX "ads_sync_run_job_started_idx" ON "ads_sync_run" USING btree ("job","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "ads_sync_run_single_running_idx" ON "ads_sync_run" USING btree ("job") WHERE "ads_sync_run"."status" = 'running';--> statement-breakpoint
CREATE UNIQUE INDEX "ads_term_class_pattern_idx" ON "ads_term_class" USING btree ("pattern");--> statement-breakpoint
CREATE INDEX "lead_ad_click_lead_date_idx" ON "lead_ad_click" USING btree ("lead_date");--> statement-breakpoint
CREATE INDEX "lead_ad_click_campaign_idx" ON "lead_ad_click" USING btree ("campaign_id","lead_date");--> statement-breakpoint
CREATE INDEX "lead_ad_click_ad_group_keyword_idx" ON "lead_ad_click" USING btree ("ad_group_id","keyword");