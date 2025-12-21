CREATE TABLE "blog_post_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blog_post_id" uuid NOT NULL,
	"image_id" uuid NOT NULL,
	"prompt" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "blog_post" ADD COLUMN "ai_summary" text;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "generation_prompt" text;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "generated_by" varchar(50);--> statement-breakpoint
ALTER TABLE "blog_post_images" ADD CONSTRAINT "blog_post_images_post_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_images" ADD CONSTRAINT "blog_post_images_image_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_post_images_post_id_idx" ON "blog_post_images" USING btree ("blog_post_id");--> statement-breakpoint
CREATE INDEX "blog_post_images_image_id_idx" ON "blog_post_images" USING btree ("image_id");--> statement-breakpoint
CREATE INDEX "blog_post_images_created_at_idx" ON "blog_post_images" USING btree ("created_at");