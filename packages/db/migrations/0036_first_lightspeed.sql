CREATE TYPE "public"."blog_post_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."processing_status" AS ENUM('idle', 'processing', 'error');--> statement-breakpoint
ALTER TABLE "blog_post" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "blog_post" ALTER COLUMN "status" SET DEFAULT 'ideation'::text;--> statement-breakpoint
DROP TYPE "public"."blog_post_status";--> statement-breakpoint
CREATE TYPE "public"."blog_post_status" AS ENUM('ideation', 'generate', 'ai_review', 'generate_metadata', 'draft', 'ready_to_publish', 'scheduled', 'published');--> statement-breakpoint
ALTER TABLE "blog_post" ALTER COLUMN "status" SET DEFAULT 'ideation'::"public"."blog_post_status";--> statement-breakpoint
ALTER TABLE "blog_post" ALTER COLUMN "status" SET DATA TYPE "public"."blog_post_status" USING "status"::"public"."blog_post_status";--> statement-breakpoint
ALTER TABLE "blog_post" ALTER COLUMN "slug" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_post" ALTER COLUMN "meta_description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_post" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_post" ADD COLUMN "priority" "blog_post_priority" DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "blog_post" ADD COLUMN "processing_status" "processing_status" DEFAULT 'idle';--> statement-breakpoint
ALTER TABLE "blog_post" ADD COLUMN "processing_error" text;--> statement-breakpoint
ALTER TABLE "blog_post" ADD COLUMN "processing_started_at" timestamp;--> statement-breakpoint
ALTER TABLE "blog_post" ADD COLUMN "planning_data" jsonb;--> statement-breakpoint
ALTER TABLE "blog_post" ADD COLUMN "pipeline_state" jsonb;--> statement-breakpoint
CREATE INDEX "blog_post_priority_idx" ON "blog_post" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "blog_post_processing_status_idx" ON "blog_post" USING btree ("processing_status");--> statement-breakpoint
CREATE INDEX "blog_post_status_priority_idx" ON "blog_post" USING btree ("status","priority");