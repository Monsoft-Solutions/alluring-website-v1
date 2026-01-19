CREATE TYPE "public"."testimonial_source_type" AS ENUM('instagram', 'direct', 'manual');--> statement-breakpoint
CREATE TYPE "public"."testimonial_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "patient_testimonial" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_type" "testimonial_source_type" NOT NULL,
	"instagram_post_id" uuid,
	"media_id" uuid,
	"thumbnail_media_id" uuid,
	"patient_name" varchar(100) NOT NULL,
	"procedure" varchar(100) NOT NULL,
	"procedure_slug" varchar(100),
	"timeframe" varchar(100),
	"quote" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"status" "testimonial_status" DEFAULT 'draft' NOT NULL,
	"slug" varchar(255) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	CONSTRAINT "patient_testimonial_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "patient_testimonial" ADD CONSTRAINT "patient_testimonial_instagram_post_id_fkey" FOREIGN KEY ("instagram_post_id") REFERENCES "public"."instagram_post"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_testimonial" ADD CONSTRAINT "patient_testimonial_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "public"."gallery_media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_testimonial" ADD CONSTRAINT "patient_testimonial_thumbnail_media_id_fkey" FOREIGN KEY ("thumbnail_media_id") REFERENCES "public"."gallery_media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "patient_testimonial_status_published_at_idx" ON "patient_testimonial" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "patient_testimonial_featured_order_idx" ON "patient_testimonial" USING btree ("is_featured","display_order");--> statement-breakpoint
CREATE INDEX "patient_testimonial_procedure_slug_idx" ON "patient_testimonial" USING btree ("procedure_slug");--> statement-breakpoint
CREATE INDEX "patient_testimonial_instagram_post_id_idx" ON "patient_testimonial" USING btree ("instagram_post_id");