CREATE TYPE "public"."instagram_analysis_status" AS ENUM('pending', 'analyzed', 'reviewed', 'applied');--> statement-breakpoint


ALTER TABLE "instagram_post" ADD COLUMN "analysis_status" "instagram_analysis_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "instagram_post" ADD COLUMN "ai_analysis" jsonb;--> statement-breakpoint
ALTER TABLE "instagram_post" ADD COLUMN "analyzed_at" timestamp;--> statement-breakpoint
CREATE INDEX "instagram_post_analysis_status_idx" ON "instagram_post" USING btree ("analysis_status");