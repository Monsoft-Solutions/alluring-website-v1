CREATE TYPE "public"."gallery_media_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."gallery_media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TABLE "before_after_pair" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"before_media_id" uuid NOT NULL,
	"after_media_id" uuid NOT NULL,
	"procedure_type" varchar(100),
	"patient_info" text,
	"timeframe" varchar(100),
	"is_featured" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_group" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"cover_image_id" uuid,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_group_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "gallery_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "gallery_media_type" DEFAULT 'image' NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"title" varchar(255) NOT NULL,
	"description" text,
	"alt" text,
	"seo_title" varchar(60),
	"seo_description" varchar(160),
	"slug" varchar(255) NOT NULL,
	"width" integer,
	"height" integer,
	"duration" integer,
	"file_size" integer,
	"mime_type" varchar(100),
	"original_filename" varchar(255),
	"blur_data_url" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_before_after" boolean DEFAULT false NOT NULL,
	"before_after_id" uuid,
	"display_order" integer DEFAULT 0 NOT NULL,
	"status" "gallery_media_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	CONSTRAINT "gallery_media_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "gallery_media_group" (
	"media_id" uuid NOT NULL,
	"group_id" uuid NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "gallery_media_group_media_id_group_id_pk" PRIMARY KEY("media_id","group_id")
);
--> statement-breakpoint
CREATE INDEX "before_after_pair_procedure_type_idx" ON "before_after_pair" USING btree ("procedure_type");--> statement-breakpoint
CREATE INDEX "before_after_pair_is_featured_idx" ON "before_after_pair" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "before_after_pair_display_order_idx" ON "before_after_pair" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "gallery_group_is_visible_idx" ON "gallery_group" USING btree ("is_visible");--> statement-breakpoint
CREATE INDEX "gallery_group_display_order_idx" ON "gallery_group" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "gallery_media_type_idx" ON "gallery_media" USING btree ("type");--> statement-breakpoint
CREATE INDEX "gallery_media_status_idx" ON "gallery_media" USING btree ("status");--> statement-breakpoint
CREATE INDEX "gallery_media_is_featured_idx" ON "gallery_media" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "gallery_media_is_before_after_idx" ON "gallery_media" USING btree ("is_before_after");--> statement-breakpoint
CREATE INDEX "gallery_media_before_after_id_idx" ON "gallery_media" USING btree ("before_after_id");--> statement-breakpoint
CREATE INDEX "gallery_media_display_order_idx" ON "gallery_media" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "gallery_media_created_at_idx" ON "gallery_media" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "gallery_media_published_at_idx" ON "gallery_media" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "gallery_media_status_published_at_idx" ON "gallery_media" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "gallery_media_group_display_order_idx" ON "gallery_media_group" USING btree ("display_order");


