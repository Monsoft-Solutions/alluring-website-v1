CREATE TABLE "blog_post_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blog_post_id" uuid NOT NULL,
	"overall_score" integer NOT NULL,
	"grade" varchar(2) NOT NULL,
	"title_score" integer NOT NULL,
	"meta_description_score" integer NOT NULL,
	"content_length_score" integer NOT NULL,
	"readability_score" integer NOT NULL,
	"heading_structure_score" integer NOT NULL,
	"keyword_score" integer NOT NULL,
	"linking_score" integer NOT NULL,
	"visual_content_score" integer NOT NULL,
	"structure_score" integer NOT NULL,
	"analysis_details" jsonb NOT NULL,
	"model_used" varchar(50),
	"analyzed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog_post_analysis" ADD CONSTRAINT "blog_post_analysis_blog_post_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_post_analysis_blog_post_id_idx" ON "blog_post_analysis" USING btree ("blog_post_id");--> statement-breakpoint
CREATE INDEX "blog_post_analysis_overall_score_idx" ON "blog_post_analysis" USING btree ("overall_score");--> statement-breakpoint
CREATE INDEX "blog_post_analysis_grade_idx" ON "blog_post_analysis" USING btree ("grade");--> statement-breakpoint
CREATE INDEX "blog_post_analysis_analyzed_at_idx" ON "blog_post_analysis" USING btree ("analyzed_at");