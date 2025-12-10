CREATE TYPE "public"."instagram_media_type" AS ENUM('image', 'video', 'carousel');--> statement-breakpoint
CREATE TYPE "public"."social_media_platform" AS ENUM('instagram', 'facebook', 'tiktok');--> statement-breakpoint
CREATE TABLE "instagram_post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instagram_id" varchar(100) NOT NULL,
	"code" varchar(50) NOT NULL,
	"media_type" "instagram_media_type" NOT NULL,
	"caption" text,
	"permalink" text NOT NULL,
	"taken_at" timestamp NOT NULL,
	"like_count" integer DEFAULT 0,
	"comment_count" integer DEFAULT 0,
	"play_count" integer,
	"video_duration" integer,
	"media_id" uuid NOT NULL,
	"thumbnail_media_id" uuid,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "instagram_post_instagram_id_unique" UNIQUE("instagram_id")
);
--> statement-breakpoint
CREATE TABLE "instagram_post_media" (
	"post_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "instagram_post_media_post_id_media_id_pk" PRIMARY KEY("post_id","media_id")
);
--> statement-breakpoint
CREATE TABLE "social_media_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" "social_media_platform" NOT NULL,
	"handle" varchar(100),
	"api_key" text,
	"last_sync_at" timestamp,
	"last_sync_cursor" varchar(255),
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "social_media_settings_platform_unique" UNIQUE("platform")
);
--> statement-breakpoint
ALTER TABLE "instagram_post" ADD CONSTRAINT "instagram_post_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "public"."gallery_media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instagram_post" ADD CONSTRAINT "instagram_post_thumbnail_media_id_fkey" FOREIGN KEY ("thumbnail_media_id") REFERENCES "public"."gallery_media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instagram_post_media" ADD CONSTRAINT "instagram_post_media_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."instagram_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instagram_post_media" ADD CONSTRAINT "instagram_post_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "public"."gallery_media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "instagram_post_instagram_id_idx" ON "instagram_post" USING btree ("instagram_id");--> statement-breakpoint
CREATE INDEX "instagram_post_taken_at_idx" ON "instagram_post" USING btree ("taken_at");--> statement-breakpoint
CREATE INDEX "instagram_post_published_idx" ON "instagram_post" USING btree ("is_published","taken_at");--> statement-breakpoint
CREATE INDEX "instagram_post_featured_idx" ON "instagram_post" USING btree ("is_featured","taken_at");--> statement-breakpoint
CREATE INDEX "instagram_post_media_post_id_idx" ON "instagram_post_media" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "instagram_post_media_media_id_idx" ON "instagram_post_media" USING btree ("media_id");--> statement-breakpoint
CREATE INDEX "social_media_settings_platform_idx" ON "social_media_settings" USING btree ("platform");