CREATE TYPE "public"."media_analysis_item_type" AS ENUM('pair', 'unpaired', 'non_ba');--> statement-breakpoint
CREATE TYPE "public"."media_analysis_source" AS ENUM('instagram', 'gallery');--> statement-breakpoint
CREATE TYPE "public"."media_analysis_status" AS ENUM('pending', 'analyzing', 'completed', 'applied', 'failed');--> statement-breakpoint
CREATE TYPE "public"."media_analysis_type" AS ENUM('bulk', 'single');--> statement-breakpoint
CREATE TABLE "media_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "media_analysis_type" NOT NULL,
	"source" "media_analysis_source" NOT NULL,
	"status" "media_analysis_status" DEFAULT 'pending' NOT NULL,
	"total_media" integer DEFAULT 0 NOT NULL,
	"analyzed_media" integer DEFAULT 0 NOT NULL,
	"detected_pairs" integer DEFAULT 0 NOT NULL,
	"unpaired_media" integer DEFAULT 0 NOT NULL,
	"non_ba_media" integer DEFAULT 0 NOT NULL,
	"result_data" jsonb,
	"error_message" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"applied_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_analysis_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"analysis_id" uuid NOT NULL,
	"gallery_media_id" uuid,
	"instagram_post_id" uuid,
	"item_type" "media_analysis_item_type" NOT NULL,
	"group_assignments" jsonb DEFAULT '[]'::jsonb,
	"is_applied" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_analysis_item" ADD CONSTRAINT "media_analysis_item_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "public"."media_analysis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_analysis_item" ADD CONSTRAINT "media_analysis_item_gallery_media_id_fkey" FOREIGN KEY ("gallery_media_id") REFERENCES "public"."gallery_media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_analysis_item" ADD CONSTRAINT "media_analysis_item_instagram_post_id_fkey" FOREIGN KEY ("instagram_post_id") REFERENCES "public"."instagram_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_analysis_created_at_idx" ON "media_analysis" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "media_analysis_status_idx" ON "media_analysis" USING btree ("status");--> statement-breakpoint
CREATE INDEX "media_analysis_source_idx" ON "media_analysis" USING btree ("source");--> statement-breakpoint
CREATE INDEX "media_analysis_status_source_created_idx" ON "media_analysis" USING btree ("status","source","created_at");--> statement-breakpoint
CREATE INDEX "media_analysis_item_analysis_id_idx" ON "media_analysis_item" USING btree ("analysis_id");--> statement-breakpoint
CREATE INDEX "media_analysis_item_gallery_media_id_idx" ON "media_analysis_item" USING btree ("gallery_media_id");--> statement-breakpoint
CREATE INDEX "media_analysis_item_instagram_post_id_idx" ON "media_analysis_item" USING btree ("instagram_post_id");