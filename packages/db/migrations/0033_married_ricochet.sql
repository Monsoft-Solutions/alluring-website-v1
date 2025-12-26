CREATE TYPE "public"."blog_content_type" AS ENUM('tutorial', 'guide', 'how_to', 'case_study', 'comparison', 'faq', 'listicle', 'announcement', 'thought_leadership');--> statement-breakpoint
CREATE TYPE "public"."blog_idea_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."blog_idea_stage" AS ENUM('backlog', 'researching', 'approved', 'in_progress', 'published');--> statement-breakpoint
CREATE TABLE "blog_idea" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"topic" text,
	"unique_angle" text,
	"primary_keyword" varchar(100),
	"secondary_keywords" json,
	"target_audience" text,
	"pain_points" json,
	"content_type" "blog_content_type",
	"estimated_word_count" integer,
	"outline" json,
	"research_notes" text,
	"competitor_urls" json,
	"stage" "blog_idea_stage" DEFAULT 'backlog' NOT NULL,
	"priority" "blog_idea_priority" DEFAULT 'medium' NOT NULL,
	"ai_generated_score" integer,
	"ai_suggestions" text,
	"assigned_author_id" uuid,
	"blog_post_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog_idea" ADD CONSTRAINT "blog_idea_assigned_author_id_fk" FOREIGN KEY ("assigned_author_id") REFERENCES "public"."author"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_idea" ADD CONSTRAINT "blog_idea_blog_post_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_post"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_idea_stage_idx" ON "blog_idea" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "blog_idea_priority_idx" ON "blog_idea" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "blog_idea_content_type_idx" ON "blog_idea" USING btree ("content_type");--> statement-breakpoint
CREATE INDEX "blog_idea_assigned_author_id_idx" ON "blog_idea" USING btree ("assigned_author_id");--> statement-breakpoint
CREATE INDEX "blog_idea_blog_post_id_idx" ON "blog_idea" USING btree ("blog_post_id");--> statement-breakpoint
CREATE INDEX "blog_idea_created_at_idx" ON "blog_idea" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "blog_idea_stage_priority_idx" ON "blog_idea" USING btree ("stage","priority");