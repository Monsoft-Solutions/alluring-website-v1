ALTER TABLE "blog_post" ADD CONSTRAINT "blog_post_author_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."author"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post" ADD CONSTRAINT "blog_post_featured_image_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_post_status_idx" ON "blog_post" USING btree ("status");--> statement-breakpoint
CREATE INDEX "blog_post_author_id_idx" ON "blog_post" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "blog_post_created_at_idx" ON "blog_post" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "blog_post_published_at_idx" ON "blog_post" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "blog_post_scheduled_at_idx" ON "blog_post" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "blog_post_status_published_at_idx" ON "blog_post" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "blog_post_is_featured_idx" ON "blog_post" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "blog_post_views_idx" ON "blog_post" USING btree ("views");--> statement-breakpoint
CREATE INDEX "blog_post_likes_idx" ON "blog_post" USING btree ("likes");