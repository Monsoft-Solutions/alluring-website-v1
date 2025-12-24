ALTER TABLE "blog_post" ADD COLUMN "primary_keyword" varchar(100);--> statement-breakpoint
ALTER TABLE "blog_post" ADD COLUMN "secondary_keywords" json;